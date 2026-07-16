import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Eye, EyeOff, Trash2, ImagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { uploadProductImages } from "@/lib/upload";
import { useCategories } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatPrice, getStorageUrl, cn } from "@/lib/utils";
import type { Product } from "@/types/database";

interface ProductForm {
  name_uz: string;
  name_ru: string;
  sku: string;
  category_id: string;
  brand: string;
  fabric: string;
  season: string;
  fit_type: "slim" | "regular" | "comfort";
  base_price: number;
  sale_price: number | null;
  cost_price: number;
  description_uz: string;
  description_ru: string;
  is_featured: boolean;
}

const EMPTY: ProductForm = {
  name_uz: "", name_ru: "", sku: "", category_id: "", brand: "", fabric: "", season: "Barcha fasl",
  fit_type: "regular", base_price: 0, sale_price: null, cost_price: 0,
  description_uz: "", description_ru: "", is_featured: false,
};

// ─── Rang bloki: bitta model — har rang o'z surati + o'lchamlari ───
interface ColorBlock {
  key: string;
  color: string;
  hex: string;
  imageUrl: string;   // mavjud yoki qo'lda kiritilgan URL
  file: File | null;  // yuklangan fayl
  preview: string;    // fayl uchun preview (dataURL)
  sizes: string[];
}

const SIZE_OPTIONS = ["46", "48", "50", "52", "54", "56", "Universal"];
const STANDARD_SIZES = ["46", "48", "50", "52", "54"];
let blockCounter = 0;
const newBlockKey = () => `b${++blockCounter}`;
// Variant SKU uchun qisqa rang kodi (Qora→QOR, To'q ko'k→TOQ)
const colorSlug = (s: string) => s.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase() || "X";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<ProductForm>({ defaultValues: EMPTY });
  const categoryId = watch("category_id");
  const brandId = watch("brand");
  const fitType = watch("fit_type");
  const isFeatured = watch("is_featured");

  // Ranglar + o'lchamlar + rasmlar
  const [colorBlocks, setColorBlocks] = useState<ColorBlock[]>([]);

  // Admin barcha mahsulotlarni ko'radi (is_active filtri yo'q)
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*), variants:product_variants(*), images:product_images(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  // Aktiv/noaktiv toggle
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("products").update({ is_active: !isActive }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  // Saqlash (yaratish yoki yangilash)
  const saveProduct = useMutation({
    mutationFn: async (form: ProductForm) => {
      const payload = {
        name_uz: form.name_uz,
        name_ru: form.name_ru || form.name_uz,
        sku: form.sku,
        category_id: form.category_id || null,
        brand: (form.brand && form.brand !== "none") ? form.brand : null,
        fabric: form.fabric || null,
        season: form.season || null,
        fit_type: form.fit_type,
        base_price: Number(form.base_price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        cost_price: Number(form.cost_price) || 0,
        description_uz: form.description_uz || null,
        description_ru: form.description_ru || null,
        is_active: true,
      };

      let productId: string;
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
        productId = editing.id;
        await supabase.from("products").update({ is_featured: form.is_featured }).eq("id", productId);
      } else {
        const { data, error } = await supabase
          .from("products").insert({ ...payload, is_featured: form.is_featured })
          .select().single();
        if (error) throw error;
        productId = data.id;
      }

      // ─── Ranglar → rasmlar + variantlar ───
      // 1) Har rang uchun rasm URL'ini tayyorlaymiz (fayl bo'lsa yuklaymiz)
      const resolved = await Promise.all(
        colorBlocks
          .filter((b) => b.color.trim())
          .map(async (b) => {
            let url = b.imageUrl.trim();
            if (b.file) {
              const [uploaded] = await uploadProductImages([b.file]);
              url = uploaded;
            }
            return { color: b.color.trim(), hex: b.hex, sizes: b.sizes, url };
          })
      );

      // 2) Rasmlarni almashtiramiz (order_items rasmga bog'liq emas — xavfsiz)
      await supabase.from("product_images").delete().eq("product_id", productId);
      const imageRows = resolved
        .filter((b) => b.url)
        .map((b, idx) => ({
          product_id: productId,
          url: b.url,
          alt: `${form.name_uz} — ${b.color}`,
          color: b.color,
          is_primary: idx === 0,
          sort_order: idx,
        }));
      if (imageRows.length) {
        const { error } = await supabase.from("product_images").insert(imageRows);
        if (error) throw error;
      }

      // 3) Variantlar: kerakli (rang+o'lcham) to'plami
      const keyOf = (color: string, size: string) => `${color}::${size}`;
      const existing = editing?.variants ?? [];
      const existingKeys = new Set(existing.map((v) => keyOf(v.color, v.size)));
      // Takroriy (rang+o'lcham)larni chiqarib tashlaymiz (SKU to'qnashuvi oldi)
      const seenDesired = new Set<string>();
      const desired = resolved
        .flatMap((b) => b.sizes.map((size) => ({ color: b.color, hex: b.hex, size })))
        .filter((d) => {
          const k = keyOf(d.color, d.size);
          if (seenDesired.has(k)) return false;
          seenDesired.add(k);
          return true;
        });
      const desiredKeys = new Set(desired.map((d) => keyOf(d.color, d.size)));

      // Yangi variantlarni qo'shamiz
      const toInsert = desired.filter((d) => !existingKeys.has(keyOf(d.color, d.size)));
      if (toInsert.length) {
        const rows = toInsert.map((d) => ({
          product_id: productId,
          size: d.size,
          color: d.color,
          color_hex: d.hex,
          sku: `${form.sku}-${colorSlug(d.color)}-${d.size}`,
        }));
        const { error } = await supabase.from("product_variants").insert(rows);
        if (error) throw error;
      }

      // Mavjud variantlar rang hex'ini yangilaymiz
      for (const b of resolved) {
        await supabase.from("product_variants")
          .update({ color_hex: b.hex })
          .eq("product_id", productId).eq("color", b.color);
      }

      // Olib tashlangan variantlarni o'chiramiz (buyurtmada bo'lsa — jim o'tadi)
      const toDelete = existing.filter((v) => !desiredKeys.has(keyOf(v.color, v.size)));
      for (const v of toDelete) {
        await supabase.from("inventory").delete().eq("variant_id", v.id);
        await supabase.from("product_variants").delete().eq("id", v.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      closeDialog();
    },
    onError: (e: any) => alert("Saqlashda xato: " + (e?.message ?? "")),
  });

  // O'chirish
  const deleteProduct = useMutation({
    mutationFn: async (product: Product) => {
      for (const v of product.variants ?? []) {
        await supabase.from("inventory").delete().eq("variant_id", v.id);
      }
      await supabase.from("product_variants").delete().eq("product_id", product.id);
      await supabase.from("product_images").delete().eq("product_id", product.id);
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
    onError: (e: any) => alert("O'chirishda xato: " + (e?.message ?? "")),
  });

  function openNew() {
    setEditing(null);
    reset(EMPTY);
    setColorBlocks([]);
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    reset({
      name_uz: p.name_uz, name_ru: p.name_ru, sku: p.sku,
      category_id: p.category_id ?? "", brand: (p as any).brand ?? "",
      fabric: p.fabric ?? "", season: p.season ?? "Barcha fasl",
      fit_type: (p.fit_type as any) ?? "regular",
      base_price: p.base_price, sale_price: p.sale_price ?? null, cost_price: p.cost_price ?? 0,
      description_uz: p.description_uz ?? "", description_ru: p.description_ru ?? "",
      is_featured: p.is_featured,
    });

    // Variantlarni rang bo'yicha guruhlab bloklarga aylantiramiz
    const byColor = new Map<string, ColorBlock>();
    (p.variants ?? []).forEach((v) => {
      if (!byColor.has(v.color)) {
        const img = (p.images ?? []).find((i) => (i as any).color === v.color);
        byColor.set(v.color, {
          key: newBlockKey(),
          color: v.color,
          hex: v.color_hex ?? "#888888",
          imageUrl: img?.url ?? "",
          file: null,
          preview: "",
          sizes: [],
        });
      }
      byColor.get(v.color)!.sizes.push(v.size);
    });
    // Rangsiz (umumiy) rasmlar ham blok sifatida ko'rinsin
    if (byColor.size === 0 && (p.images?.length ?? 0) > 0) {
      const img = p.images![0];
      byColor.set("_", {
        key: newBlockKey(), color: "", hex: "#888888",
        imageUrl: img.url, file: null, preview: "", sizes: [],
      });
    }
    setColorBlocks(Array.from(byColor.values()));
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    reset(EMPTY);
    setColorBlocks([]);
  }

  // ─── Rang bloklari boshqaruvi ───
  function addColorBlock() {
    setColorBlocks((prev) => [
      ...prev,
      { key: newBlockKey(), color: "", hex: "#1a1a1a", imageUrl: "", file: null, preview: "", sizes: [] },
    ]);
  }
  function updateBlock(key: string, patch: Partial<ColorBlock>) {
    setColorBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  }
  function removeBlock(key: string) {
    setColorBlocks((prev) => prev.filter((b) => b.key !== key));
  }
  function toggleBlockSize(key: string, size: string) {
    setColorBlocks((prev) =>
      prev.map((b) =>
        b.key === key
          ? { ...b, sizes: b.sizes.includes(size) ? b.sizes.filter((s) => s !== size) : [...b.sizes, size] }
          : b
      )
    );
  }
  function onBlockFile(key: string, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateBlock(key, { file, preview: reader.result as string, imageUrl: "" });
    reader.readAsDataURL(file);
  }

  function handleDelete(p: Product) {
    if (window.confirm(`"${p.name_uz}" mahsulotini o'chirasizmi? Bu amalni qaytarib bo'lmaydi.`)) {
      deleteProduct.mutate(p);
    }
  }

  const filtered = products?.filter(
    (p) =>
      p.name_uz.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ─── Sarlavha ─────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight" style={{ color: "var(--ad-text)" }}>
            Mahsulotlar
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--ad-text-3)" }}>
            Katalogda {products?.length ?? 0} ta mahsulot
          </p>
        </div>
        <button onClick={openNew} className="ad-btn">
          <Plus className="h-4 w-4" />
          Yangi mahsulot
        </button>
      </div>

      {/* ─── Qidiruv ──────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--ad-text-3)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom yoki SKU bo'yicha qidirish"
          className="ad-input py-2.5 pl-11 pr-4 text-sm"
        />
      </div>

      {/* ─── Jadval ───────────────────────────────────── */}
      <div className="ad-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--ad-surface-2)" }}>
                {["Mahsulot", "SKU", "Kategoriya", "Variant"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--ad-text-3)" }}>{h}</th>
                ))}
                <th className="px-5 py-3.5 text-right text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--ad-text-3)" }}>Narx</th>
                <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--ad-text-3)" }}>Holat</th>
                <th className="px-5 py-3.5 text-right text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--ad-text-3)" }}>Amal</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-5 py-3"><Skeleton className="h-12 w-full" /></td>
                  </tr>
                ))
              ) : (
                filtered?.map((product) => {
                  const img = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
                  return (
                    <tr key={product.id} className="ad-row" style={{ borderTop: "1px solid var(--ad-border)" }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded-xl" style={{ background: "var(--ad-surface-2)" }}>
                            {img && (
                              <img src={getStorageUrl(img.url)!} alt={product.name_uz} className="h-full w-full object-cover" />
                            )}
                          </div>
                          <span className="font-semibold line-clamp-1" style={{ color: "var(--ad-text)" }}>
                            {product.name_uz}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: "var(--ad-text-3)" }}>{product.sku}</td>
                      <td className="px-5 py-3" style={{ color: "var(--ad-text-2)" }}>{product.category?.name_uz ?? "—"}</td>
                      <td className="px-5 py-3" style={{ color: "var(--ad-text-2)" }}>{product.variants?.length ?? 0} ta</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums" style={{ color: "var(--ad-text)" }}>
                        {formatPrice(product.sale_price ?? product.base_price)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="ad-pill"
                          style={
                            product.is_active
                              ? { background: "rgba(16,185,129,0.12)", color: "#059669" }
                              : { background: "var(--ad-surface-2)", color: "var(--ad-text-3)" }
                          }
                        >
                          {product.is_active ? "Aktiv" : "Yashirin"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleActive.mutate({ id: product.id, isActive: product.is_active })}
                            className="ad-icon-btn"
                            title={product.is_active ? "Yashirish" : "Ko'rsatish"}
                          >
                            {product.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button onClick={() => openEdit(product)} className="ad-icon-btn" title="Tahrirlash">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="ad-icon-btn hover:!text-rose-500"
                            title="O'chirish"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered?.length === 0 && (
          <p className="py-14 text-center text-sm" style={{ color: "var(--ad-text-3)" }}>Mahsulot topilmadi</p>
        )}
      </div>

      {/* ─── Qo'shish / Tahrirlash dialog ───────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit((f) => saveProduct.mutate(f))} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Nomi (UZ) *</label>
                <Input {...register("name_uz", { required: true })} placeholder="Klassik qora kostyum" />
                {errors.name_uz && <p className="mt-1 text-xs text-destructive">Majburiy</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Nomi (RU)</label>
                <Input {...register("name_ru")} placeholder="Классический чёрный костюм" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">SKU *</label>
                <Input {...register("sku", { required: true })} placeholder="KU-SUIT-007" />
                {errors.sku && <p className="mt-1 text-xs text-destructive">Majburiy</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Kategoriya</label>
                <Select value={categoryId} onValueChange={(v) => setValue("category_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name_uz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Brend</label>
                <Select value={brandId} onValueChange={(v) => setValue("brand", v)}>
                  <SelectTrigger><SelectValue placeholder="Tanlang (ixtiyoriy)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Brendsiz —</SelectItem>
                    {brands?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        <span className="flex items-center gap-2">
                          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: b.accent_color }} />
                          {b.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Asosiy narx *</label>
                <Input type="number" min={0} {...register("base_price", { required: true, valueAsNumber: true })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Chegirma narx</label>
                <Input type="number" min={0} {...register("sale_price", { valueAsNumber: true })} placeholder="ixtiyoriy" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Tannarx</label>
                <Input type="number" min={0} {...register("cost_price", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Fason</label>
                <Select value={fitType} onValueChange={(v) => setValue("fit_type", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slim">Slim fit</SelectItem>
                    <SelectItem value="regular">Regular fit</SelectItem>
                    <SelectItem value="comfort">Comfort fit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Mato</label>
                <Input {...register("fabric")} placeholder="Jun 70%, Poliyester 30%" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Fasl</label>
                <Input {...register("season")} placeholder="Barcha fasl" />
              </div>
            </div>

            {/* ─── Ranglar · o'lchamlar · rasmlar ─── */}
            <div className="rounded-xl border border-black/10 bg-black/[0.015] p-4">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                    Ranglar · o'lchamlar · rasmlar
                  </label>
                  <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                    Bitta model — har rang o'z surati va o'lchamlarida
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addColorBlock}
                  className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-white transition-transform hover:scale-105"
                >
                  <Plus className="h-3.5 w-3.5" /> Rang qo'shish
                </button>
              </div>

              {colorBlocks.length === 0 && (
                <p className="mt-2 rounded-lg border border-dashed border-black/15 px-4 py-6 text-center text-xs text-muted-foreground">
                  Hali rang qo'shilmagan. <b>"Rang qo'shish"</b> bilan boshlang.
                </p>
              )}

              <div className="mt-3 space-y-3">
                {colorBlocks.map((b) => (
                  <div key={b.key} className="rounded-xl border border-black/10 bg-white p-3">
                    <div className="flex gap-3">
                      {/* Rasm */}
                      <div className="flex-shrink-0">
                        <div className="relative h-24 w-20 overflow-hidden rounded-lg border border-black/10 bg-black/5">
                          {b.preview || b.imageUrl ? (
                            <img
                              src={b.preview || getStorageUrl(b.imageUrl)!}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <ImagePlus className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-1 text-[0.6rem] font-medium text-gold hover:underline">
                          <ImagePlus className="h-3 w-3" /> Fayl yuklash
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { onBlockFile(b.key, e.target.files?.[0] ?? null); e.target.value = ""; }}
                          />
                        </label>
                      </div>

                      {/* O'ng: rang, URL, o'lchamlar */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={b.hex}
                            onChange={(e) => updateBlock(b.key, { hex: e.target.value })}
                            className="h-9 w-9 flex-shrink-0 cursor-pointer rounded border border-black/10 bg-transparent p-0.5"
                            title="Rang tusi"
                          />
                          <Input
                            value={b.color}
                            onChange={(e) => updateBlock(b.key, { color: e.target.value })}
                            placeholder="Rang nomi — Qora, Bordo, To'q ko'k…"
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeBlock(b.key)}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-500"
                            title="Rangni o'chirish"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <Input
                          value={b.file ? "" : b.imageUrl}
                          onChange={(e) => updateBlock(b.key, { imageUrl: e.target.value, file: null, preview: "" })}
                          placeholder="yoki rasm URL: https://…"
                          disabled={!!b.file}
                          inputMode="url"
                          className="text-xs"
                        />

                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">O'lchamlar</span>
                            <button
                              type="button"
                              onClick={() => updateBlock(b.key, { sizes: STANDARD_SIZES })}
                              className="text-[0.65rem] font-medium text-gold hover:underline"
                            >
                              Standart (46–54)
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {SIZE_OPTIONS.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => toggleBlockSize(b.key, s)}
                                className={cn(
                                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                                  b.sizes.includes(s)
                                    ? "bg-gold text-white"
                                    : "bg-black/5 text-charcoal hover:bg-black/10"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Tavsif (UZ)</label>
              <textarea {...register("description_uz")} rows={2} className="input-kaster resize-none" />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setValue("is_featured", e.target.checked)}
                className="h-4 w-4"
              />
              Bosh sahifada tavsiya etilsin
            </label>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Bekor</Button>
              <Button type="submit" disabled={saveProduct.isPending}>
                {saveProduct.isPending ? "Saqlanmoqda..." : editing ? "Saqlash" : "Qo'shish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
