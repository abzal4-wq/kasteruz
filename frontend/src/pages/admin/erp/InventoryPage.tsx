import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/utils";

interface InventoryRow {
  id: string;
  variant_id: string;
  warehouse_id: string;
  quantity: number;
  reserved_quantity: number;
  available: number;
  reorder_level: number;
  name_uz: string;
  size: string;
  color: string;
  sku: string;
  warehouse_name: string;
}

interface MovementForm {
  type: "in" | "out" | "adjustment";
  quantity: number;
  note: string;
}

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<InventoryRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<MovementForm>({
    defaultValues: { type: "in", quantity: 1, note: "" },
  });
  const movType = watch("type");

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: async (): Promise<InventoryRow[]> => {
      const { data, error } = await supabase
        .from("inventory_available")
        .select("*")
        .order("name_uz");
      if (error) throw error;
      return data as InventoryRow[];
    },
  });

  const addMovement = useMutation({
    mutationFn: async (form: MovementForm & { variantId: string; warehouseId: string }) => {
      const delta =
        form.type === "out" ? -Math.abs(form.quantity) : Math.abs(form.quantity);

      // Inventar yangilash
      const { data: inv } = await supabase
        .from("inventory")
        .select("quantity")
        .eq("variant_id", form.variantId)
        .eq("warehouse_id", form.warehouseId)
        .single();

      const newQty = Math.max(0, (inv?.quantity ?? 0) + delta);

      await supabase
        .from("inventory")
        .update({ quantity: newQty })
        .eq("variant_id", form.variantId)
        .eq("warehouse_id", form.warehouseId);

      // Harakat yozuvi
      await supabase.from("stock_movements").insert({
        variant_id: form.variantId,
        warehouse_id: form.warehouseId,
        type: form.type,
        quantity: delta,
        note: form.note || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      setDialogOpen(false);
      reset();
    },
  });

  const filtered = inventory?.filter(
    (row) =>
      row.name_uz.toLowerCase().includes(search.toLowerCase()) ||
      row.sku.toLowerCase().includes(search.toLowerCase())
  );

  function openMovement(row: InventoryRow) {
    setSelectedRow(row);
    setDialogOpen(true);
    reset({ type: "in", quantity: 1, note: "" });
  }

  function onSubmit(form: MovementForm) {
    if (!selectedRow) return;
    addMovement.mutate({
      ...form,
      variantId: selectedRow.variant_id,
      warehouseId: selectedRow.warehouse_id,
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-light text-charcoal">Ombor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time stok holati
          </p>
        </div>
      </div>

      <div className="mt-6 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot yoki SKU"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-ios border border-black/5 bg-white shadow-glass-sm">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Mahsulot</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Ombor</th>
              <th className="px-4 py-3 text-center font-medium">Jami</th>
              <th className="px-4 py-3 text-center font-medium">Mavjud</th>
              <th className="px-4 py-3 text-center font-medium">Rezerv</th>
              <th className="px-4 py-3 font-medium">Holat</th>
              <th className="px-4 py-3 font-medium">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-3">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              : filtered?.map((row) => (
                  <tr key={row.id} className="hover:bg-cream-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal">{row.name_uz}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.color} · {row.size}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.sku}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.warehouse_name}</td>
                    <td className="px-4 py-3 text-center font-medium">
                      {formatNumber(row.quantity)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          row.available === 0
                            ? "font-semibold text-destructive"
                            : row.available <= row.reorder_level
                            ? "font-semibold text-gold"
                            : "text-green-600"
                        }
                      >
                        {formatNumber(row.available)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {formatNumber(row.reserved_quantity)}
                    </td>
                    <td className="px-4 py-3">
                      {row.available === 0 ? (
                        <Badge variant="destructive">Tugagan</Badge>
                      ) : row.available <= row.reorder_level ? (
                        <Badge variant="gold">Kam qoldi</Badge>
                      ) : (
                        <Badge variant="success">Yetarli</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openMovement(row)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Harakat
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Harakat dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Stok harakati</DialogTitle>
            {selectedRow && (
              <p className="text-sm text-muted-foreground">
                {selectedRow.name_uz} · {selectedRow.color} · {selectedRow.size}
              </p>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Tur
              </label>
              <Select
                value={movType}
                onValueChange={(v) =>
                  reset({ ...{ type: v as "in" | "out" | "adjustment", quantity: 1, note: "" } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Kirim (+)</SelectItem>
                  <SelectItem value="out">Chiqim (−)</SelectItem>
                  <SelectItem value="adjustment">Tuzatish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Miqdor
              </label>
              <Input
                type="number"
                min={1}
                {...register("quantity", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Izoh
              </label>
              <Input {...register("note")} placeholder="Ixtiyoriy izoh" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Bekor
              </Button>
              <Button type="submit" disabled={addMovement.isPending}>
                {addMovement.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
