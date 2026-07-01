import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Eye, EyeOff, Trash2, ImagePlus, X } from "lucide-react";
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
import { formatPrice, getStorageUrl } from "@/lib/utils";
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

  // Rasm yuklash holati
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);

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
      } else {
        const { data, error } = await supabase
          .from("products").insert({ ...payload, is_featured: form.is_featured })
          .select().single();
        if (error) throw error;
        productId = data.id;
      }

      // Featured holatini yangilash (tahrirlashda)
      if (editing) {
        await supabase.from("products").update({ is_featured: form.is_featured }).eq("id", productId);
      }

      // O'chirilgan eski rasmlarni bazadan ham o'chirish
      if (editing) {
        const keptIds = existingImages.map((i) => i.id);
        const removed = (editing.images ?? []).filter((i) => !keptIds.includes(i.id));
        for (const img of removed) {
          await supabase.from("product_images").delete().eq("id", img.id);
        }
      }

      // Yangi rasmlarni yuklash (bir nechta)
      if (newFiles.length > 0) {
        const urls = await uploadProductImages(newFiles);
        const hasPrimary =
          existingImages.length > 0 ||
          (editing?.images?.some((i) => i.is_primary) ?? false);
        const rows = urls.map((url, idx) => ({
          product_id: productId,
          url,
          alt: form.name_uz,
          is_primary: !hasPrimary && idx === 0,
          sort_order: existingImages.length + idx,
        }));
        await supabase.from("product_images").insert(rows);
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
      // Avval bog'liq yozuvlar (variantlar, rasmlar), keyin mahsulot
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
    setNewFiles([]);
    setNewPreviews([]);
    setExistingImages([]);
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
    setNewFiles([]);
    setNewPreviews([]);
    setExistingImages(
      (p.images ?? [])
        .slice()
        .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        .map((i) => ({ id: i.id, url: i.url }))
    );
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    reset(EMPTY);
    setNewFiles([]);
    setNewPreviews([]);
    setExistingImages([]);
  }

  // Fayl tanlanganda — preview yaratish
  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const arr = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    setNewFiles((prev) => [...prev, ...arr]);
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setNewPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function removeNewFile(idx: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeExisting(id: string) {
    setExistingImages((prev) => prev.filter((i) => i.id !== id));
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Rasmlar (bir nechta yuklash mumkin)
              </label>

              <div className="flex flex-wrap gap-3">
                {/* Mavjud rasmlar (tahrirlashda) */}
                {existingImages.map((img) => (
                  <div key={img.id} className="group relative h-24 w-20 overflow-hidden rounded-lg border border-black/10">
                    <img src={getStorageUrl(img.url)!} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExisting(img.id)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Yangi tanlangan rasmlar */}
                {newPreviews.map((src, idx) => (
                  <div key={idx} className="group relative h-24 w-20 overflow-hidden rounded-lg border border-gold">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Yuklash tugmasi */}
                <label className="flex h-24 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-black/15 text-muted-foreground transition-colors hover:border-gold hover:text-gold">
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[0.6rem]">Yuklash</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
                Birinchi rasm asosiy bo'ladi. JPG, PNG.
              </p>
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
