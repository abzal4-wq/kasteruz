import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Minus, Trash2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types/database";

interface PosItem {
  variantId: string;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export default function PosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<PosItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [success, setSuccess] = useState(false);

  // Mahsulotlar (admin barcha inventar bilan)
  const { data: products } = useQuery({
    queryKey: ["pos-products"],
    queryFn: async (): Promise<Product[]> => {
      const { data } = await supabase
        .from("products")
        .select(`
          *,
          variants:product_variants(*, inventory(*)),
          images:product_images(url, is_primary)
        `)
        .eq("is_active", true)
        .order("name_uz");
      return (data ?? []) as Product[];
    },
  });

  const filtered = useMemo(() => {
    if (!search) return products ?? [];
    const q = search.toLowerCase();
    return (products ?? []).filter(
      (p) =>
        p.name_uz.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  function addToCart(variant: ProductVariant, product: Product) {
    const price = variant.price_override ?? product.base_price;
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === variant.id);
      if (existing) {
        return prev.map((i) =>
          i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          productName: product.name_uz,
          size: variant.size,
          color: variant.color,
          price,
          quantity: 1,
        },
      ];
    });
  }

  function updateQty(variantId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.variantId === variantId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const createOrder = useMutation({
    mutationFn: async () => {
      // Ombor — asosiy do'kon
      const { data: warehouse } = await supabase
        .from("warehouses")
        .select("id")
        .eq("type", "store")
        .single();

      // Buyurtma yaratish
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          channel: "pos",
          status: "delivered",
          subtotal,
          discount_total: 0,
          delivery_fee: 0,
          total: subtotal,
          payment_status: "paid",
          payment_method: paymentMethod,
          delivery_method: "pickup",
        })
        .select()
        .single();

      if (error || !order) throw error;

      // Order items
      await supabase.from("order_items").insert(
        cart.map((item) => ({
          order_id: order.id,
          variant_id: item.variantId,
          product_name_snapshot: item.productName,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unit_price: item.price,
          total: item.price * item.quantity,
        }))
      );

      // Stokdan chiqarish
      if (warehouse) {
        for (const item of cart) {
          const { data: inv } = await supabase
            .from("inventory")
            .select("quantity")
            .eq("variant_id", item.variantId)
            .eq("warehouse_id", warehouse.id)
            .single();

          if (inv) {
            await supabase
              .from("inventory")
              .update({ quantity: Math.max(0, inv.quantity - item.quantity) })
              .eq("variant_id", item.variantId)
              .eq("warehouse_id", warehouse.id);

            await supabase.from("stock_movements").insert({
              variant_id: item.variantId,
              warehouse_id: warehouse.id,
              type: "sale",
              quantity: -item.quantity,
              reference_type: "order",
              reference_id: order.id,
            });
          }
        }
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["pos-products"] });
      setCart([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* ─── Mahsulotlar katalogi ─────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-light text-charcoal">POS Kassa</h1>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot qidirish..."
            className="pl-9"
          />
        </div>

        <div className="overflow-y-auto">
          <div className="space-y-3">
            {filtered.map((product) => (
              <div key={product.id} className="overflow-hidden rounded-ios border border-black/5 bg-white shadow-glass-sm p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-charcoal">{product.name_uz}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                  <p className="font-semibold text-charcoal">
                    {formatPrice(product.sale_price ?? product.base_price)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants?.map((v) => {
                    const available = v.inventory?.reduce(
                      (s, i) => s + (i.quantity - i.reserved_quantity),
                      0
                    ) ?? 0;
                    return (
                      <button
                        key={v.id}
                        disabled={available === 0}
                        onClick={() => addToCart(v, product)}
                        className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span>{v.color}</span>
                        <span className="text-muted-foreground">·</span>
                        <span>{v.size}</span>
                        <Badge variant="muted" className="ml-1 text-[0.6rem]">
                          {available}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Chek ─────────────────────────────────────── */}
      <div className="flex w-80 flex-shrink-0 flex-col overflow-hidden rounded-ios border border-black/5 bg-white shadow-glass-sm">
        <div className="border-b border-border p-4">
          <h2 className="font-serif text-lg font-medium">Chek</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Mahsulot qo'shing
            </p>
          ) : (
            <ul className="space-y-3">
              {cart.map((item) => (
                <li key={item.variantId} className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.color} · {item.size}
                    </p>
                    <p className="text-sm text-gold">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.variantId, -1)}
                      className="flex h-7 w-7 items-center justify-center border hover:bg-cream-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.variantId, 1)}
                      className="flex h-7 w-7 items-center justify-center border hover:bg-cream-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() =>
                        setCart((p) => p.filter((i) => i.variantId !== item.variantId))
                      }
                      className="ml-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-4 space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Jami</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
              To'lov usuli
            </label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Naqd</SelectItem>
                <SelectItem value="transfer">Plastik karta</SelectItem>
                <SelectItem value="payme">Payme</SelectItem>
                <SelectItem value="click">Click</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {success ? (
            <div className="flex items-center justify-center gap-2 bg-green-50 py-3 text-green-700">
              <Check className="h-5 w-5" />
              <span className="font-medium">Sotuv amalga oshirildi!</span>
            </div>
          ) : (
            <Button
              className="w-full"
              size="lg"
              disabled={cart.length === 0 || createOrder.isPending}
              onClick={() => createOrder.mutate()}
            >
              {createOrder.isPending ? "Saqlanmoqda..." : "Sotish"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
