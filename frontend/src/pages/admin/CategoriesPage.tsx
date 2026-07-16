import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff, FolderTree, ImagePlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadProductImages } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { demoCategories, IS_DEMO } from "@/lib/demo-data";
import { cn, getStorageUrl } from "@/lib/utils";
import type { Category } from "@/types/database";

interface CategoryForm {
  name_uz: string;
  name_ru: string;
  slug: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY: CategoryForm = {
  name_uz: "", name_ru: "", slug: "", image_url: "", sort_order: 10, is_active: true,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9а-яёʻʼ\s]/gi, "")
    .replace(/[ʻʼ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Modal ──────────────────────────────────────────────────
function CategoryModal({
  open, onClose, editing,
}: { open: boolean; onClose: () => void; editing: Category | null }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<CategoryForm>(
    editing
      ? {
          name_uz: editing.name_uz, name_ru: editing.name_ru, slug: editing.slug,
          image_url: editing.image_url ?? "", sort_order: editing.sort_order,
          is_active: editing.is_active,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!editing);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  function set(patch: Partial<CategoryForm>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function onNameChange(v: string) {
    set({ name_uz: v, ...(slugTouched ? {} : { slug: slugify(v) }) });
  }

  // Fayl tanlanganda — preview + URL maydonini tozalash
  function onFile(f: File | null) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setFile(f);
      set({ image_url: "" });
    };
    reader.readAsDataURL(f);
  }

  async function save() {
    if (!form.name_uz.trim() || !form.slug.trim()) return;
    setSaving(true);

    // Fayl tanlangan bo'lsa — yuklaymiz
    let imageUrl = form.image_url;
    if (file) {
      try {
        const [uploaded] = await uploadProductImages([file]);
        imageUrl = uploaded;
      } catch {
        setSaving(false);
        alert("Rasm yuklashda xato");
        return;
      }
    }

    if (IS_DEMO) {
      const data = { ...form, image_url: imageUrl };
      if (editing) {
        const idx = demoCategories.findIndex((c) => c.id === editing.id);
        if (idx >= 0) demoCategories[idx] = { ...demoCategories[idx], ...data, parent_id: null };
      } else {
        demoCategories.push({
          id: `cat-${Date.now()}`,
          ...data,
          parent_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      const payload = {
        name_uz: form.name_uz,
        name_ru: form.name_ru || form.name_uz,
        slug: form.slug,
        image_url: imageUrl || null,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };
      if (editing) {
        await supabase.from("categories").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("categories").insert(payload);
      }
    }

    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
    setSaving(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nomi (UZ) *</label>
            <Input
              placeholder="Kostyumlar"
              value={form.name_uz}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nomi (RU)</label>
            <Input
              placeholder="Костюмы"
              value={form.name_ru}
              onChange={(e) => set({ name_ru: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Slug (URL)</label>
            <Input
              placeholder="kostyumlar"
              value={form.slug}
              onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }}
              className="font-mono text-xs"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Rasm (fayl yoki URL)</label>
            <div className="flex items-start gap-3">
              <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-black/10 bg-black/5">
                {preview || form.image_url ? (
                  <img src={preview || getStorageUrl(form.image_url)!} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-white transition-transform hover:scale-105">
                  <ImagePlus className="h-3.5 w-3.5" /> Fayl yuklash
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { onFile(e.target.files?.[0] ?? null); e.target.value = ""; }}
                  />
                </label>
                <Input
                  placeholder="yoki URL: https://…"
                  value={file ? "" : form.image_url}
                  disabled={!!file}
                  onChange={(e) => set({ image_url: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tartib raqami</label>
              <Input
                type="number" min={1} className="h-9"
                value={form.sort_order}
                onChange={(e) => set({ sort_order: Number(e.target.value) })}
              />
            </div>
            <div className="pt-5">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox" className="h-4 w-4 rounded accent-gold"
                  checked={form.is_active}
                  onChange={(e) => set({ is_active: e.target.checked })}
                />
                Faol
              </label>
            </div>
          </div>
          {IS_DEMO && (
            <p className="text-xs text-amber-600">Demo rejimda — sahifa yangilanganda saqlanmaydi</p>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={save} disabled={saving || !form.name_uz.trim() || !form.slug.trim()}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
          <Button variant="outline" onClick={onClose}>Bekor qilish</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Asosiy sahifa ────────────────────────────────────────────
export default function CategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async (): Promise<Category[]> => {
      if (IS_DEMO) {
        return [...demoCategories].sort((a, b) => a.sort_order - b.sort_order) as Category[];
      }
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setModalOpen(true);
  }

  async function toggleActive(cat: Category) {
    if (IS_DEMO) {
      const idx = demoCategories.findIndex((c) => c.id === cat.id);
      if (idx >= 0) demoCategories[idx].is_active = !demoCategories[idx].is_active;
    } else {
      await supabase.from("categories").update({ is_active: !cat.is_active }).eq("id", cat.id);
    }
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  async function deleteCategory(cat: Category) {
    if (!confirm(`"${cat.name_uz}" kategoriyasini o'chirasizmi?`)) return;
    if (IS_DEMO) {
      const idx = demoCategories.findIndex((c) => c.id === cat.id);
      if (idx >= 0) demoCategories.splice(idx, 1);
    } else {
      await supabase.from("categories").delete().eq("id", cat.id);
    }
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-light text-charcoal">Kategoriyalar</h1>
        <Button onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Kategoriya qo'shish
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        ) : categories?.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FolderTree className="h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
            <p className="mt-4 text-muted-foreground">Hali kategoriya yo'q. Birinchisini qo'shing.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {categories?.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-cream-50",
                  !c.is_active && "opacity-50"
                )}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name_uz} className="h-full w-full object-cover" />
                  ) : (
                    <FolderTree className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-charcoal">{c.name_uz}</p>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      c.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                    )}>
                      {c.is_active ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">/{c.slug}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(c)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-charcoal"
                    title={c.is_active ? "Yashirish" : "Ko'rsatish"}
                  >
                    {c.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(c)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-charcoal"
                    title="Tahrirlash"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(c)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="O'chirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CategoryModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  );
}
