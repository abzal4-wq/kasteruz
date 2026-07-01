import { useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Sparkles, X, ImagePlus, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { demoBrands, IS_DEMO } from "@/lib/demo-data";
import { isLightColor, type Brand } from "@/hooks/useBrands";
import { cn } from "@/lib/utils";

// ─── Brend oldindan ko'rish kartasi ──────────────────────────
function BrandPreview({ form }: { form: BrandForm }) {
  const btnText = isLightColor(form.accent_color) ? "#1A1A1A" : "#FFFFFF";
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-xl py-8 px-6"
      style={{ background: form.bg_color, minHeight: 200 }}
    >
      {/* Logo */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
        style={{ background: `${form.text_color}18` }}>
        {form.logo_url
          ? <img src={form.logo_url} alt="" className="h-full w-full object-contain" />
          : <span style={{ color: form.text_color, fontSize: 28, fontWeight: 700 }}>
              {form.name[0] || "B"}
            </span>
        }
      </div>
      <p className="text-center font-semibold tracking-[0.22em] text-lg"
        style={{ color: form.text_color }}>{form.name || "BREND NOMI"}</p>
      <p className="mt-1 text-center tracking-widest text-xs"
        style={{ color: form.text_color + "80" }}>{form.tagline || "tagline"}</p>
      <div className="mt-4 rounded-full px-5 py-2 text-xs font-semibold tracking-widest uppercase"
        style={{ background: form.accent_color, color: btnText }}>
        Ko'rish
      </div>
    </div>
  );
}

// ─── Form tura ───────────────────────────────────────────────
interface BrandForm {
  name: string;
  tagline: string;
  logo_url: string;
  logo_blend_mode: string;
  bg_color: string;
  text_color: string;
  accent_color: string;
  sort_order: number;
  is_active: boolean;
}

const BLEND_MODES = [
  { value: "normal",    label: "Normal — PNG transparent" },
  { value: "multiply",  label: "Multiply — oq fonni olib tashlash" },
  { value: "screen",    label: "Screen — qora fonni olib tashlash" },
  { value: "overlay",   label: "Overlay — kontrast oshirish" },
  { value: "luminosity",label: "Luminosity — faqat shaklni saqlash" },
];

const EMPTY_FORM: BrandForm = {
  name: "",
  tagline: "",
  logo_url: "",
  logo_blend_mode: "normal",
  bg_color: "#1A1A2E",
  text_color: "#FFFFFF",
  accent_color: "#D4A843",
  sort_order: 10,
  is_active: true,
};

// ─── Brend modali ─────────────────────────────────────────────
function BrandModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Brand | null;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [bgRemoving, setBgRemoving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const logoBlobRef = useRef<Blob | null>(null);
  const [form, setForm] = useState<BrandForm>(
    editing
      ? {
          name: editing.name,
          tagline: editing.tagline,
          logo_url: editing.logo_url ?? "",
          logo_blend_mode: editing.logo_blend_mode ?? "normal",
          bg_color: editing.bg_color,
          text_color: editing.text_color,
          accent_color: editing.accent_color,
          sort_order: editing.sort_order,
          is_active: editing.is_active,
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);

  function set(patch: Partial<BrandForm>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((res) => {
      const reader = new FileReader();
      reader.onload = (ev) => res(ev.target?.result as string);
      reader.readAsDataURL(blob);
    });

  const processFile = useCallback(async (file: File) => {
    // 1. Asl rasmni data URL sifatida ko'rsatamiz
    const orig = await blobToDataUrl(file);
    setOriginalUrl(orig);
    logoBlobRef.current = file;
    set({ logo_url: orig, logo_blend_mode: "normal" });

    // 2. AI fon olib tashlash
    setBgRemoving(true);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const resultBlob = await removeBackground(file, {
        publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/",
        output: { quality: 0.95, format: "image/png" },
      });
      // blob → data URL (sahifa yangilangandan keyin ham saqlanadi)
      const dataUrl = await blobToDataUrl(resultBlob);
      logoBlobRef.current = resultBlob;
      set({ logo_url: dataUrl, logo_blend_mode: "normal" });
    } catch (err) {
      console.warn("AI removal failed, using original", err);
    } finally {
      setBgRemoving(false);
    }
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    void processFile(file);
  }, [processFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) void processFile(file);
  }, [processFile]);

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);

    let finalLogoUrl = form.logo_url || null;

    if (IS_DEMO) {
      // Demo rejimda data URL bevosita saqlanadi (xotira ichida)
      if (editing) {
        const idx = demoBrands.findIndex((b) => b.id === editing.id);
        if (idx >= 0) demoBrands[idx] = { ...demoBrands[idx], ...form, logo_url: finalLogoUrl };
      } else {
        demoBrands.push({
          id: `brand-${Date.now()}`,
          ...form,
          logo_url: finalLogoUrl,
          created_at: new Date().toISOString(),
        });
      }
    } else {
      // Supabase: yangi fayl bo'lsa storage'ga yuklash
      if (logoBlobRef.current && form.logo_url && !form.logo_url.startsWith("http")) {
        const ext = "png";
        const path = `${Date.now()}-${form.name.toLowerCase()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("logos")
          .upload(path, logoBlobRef.current, { contentType: "image/png", upsert: true });
        if (!upErr) {
          const { data } = supabase.storage.from("logos").getPublicUrl(path);
          finalLogoUrl = data.publicUrl;
        }
      }
      const payload = {
        name: form.name,
        tagline: form.tagline,
        logo_url: finalLogoUrl,
        logo_blend_mode: form.logo_blend_mode,
        bg_color: form.bg_color,
        text_color: form.text_color,
        accent_color: form.accent_color,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };
      if (editing) {
        await supabase.from("brands").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("brands").insert(payload);
      }
    }

    qc.invalidateQueries({ queryKey: ["brands"] });
    setSaving(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl overflow-y-auto" style={{ maxHeight: "90vh" }}>
        <DialogHeader>
          <DialogTitle>{editing ? "Brendni tahrirlash" : "Yangi brend qo'shish"}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">

          {/* ── Chap: forma ───────────────────────────────────── */}
          <div className="space-y-4">

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Brend nomi *</label>
              <Input
                placeholder="BUGASO"
                value={form.name}
                onChange={(e) => set({ name: e.target.value.toUpperCase() })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tagline / Tavsif</label>
              <Input
                placeholder="Premium Menswear"
                value={form.tagline}
                onChange={(e) => set({ tagline: e.target.value })}
              />
            </div>

            {/* Logo */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Logo</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

              {/* Dropzone — logo yo'q va yuklashni kutmayotgan payt */}
              {!form.logo_url && !bgRemoving && (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors",
                    isDragging
                      ? "border-gold bg-gold/10"
                      : "border-border bg-muted/30 hover:border-gold/50 hover:bg-gold/5"
                  )}
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Bosing yoki bu yerga tashlang</p>
                  <p className="text-[10px] text-muted-foreground/60">PNG · JPG · WEBP — AI fon avtomatik olib tashlanadi</p>
                </div>
              )}

              {/* AI ishlov holati */}
              {bgRemoving && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-gold/30 bg-gold/8 py-6 px-4">
                  {/* Asl rasm noaniq ko'rinadi */}
                  {originalUrl && (
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg opacity-40">
                      <img src={originalUrl} alt="" className="h-full w-full object-contain" />
                      <div className="absolute inset-0 animate-pulse bg-gold/20" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse text-gold" />
                    <div>
                      <p className="text-xs font-medium text-charcoal">AI fonni olib tashlayapti...</p>
                      <p className="text-[10px] text-muted-foreground">Birinchi safar 15-30 son (model yuklanadi)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Natija — logo bor va yuklash tugagan */}
              {form.logo_url && !bgRemoving && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    {/* Fon rangi ustida preview */}
                    <div className="flex-shrink-0">
                      <p className="mb-1 text-[10px] text-muted-foreground">Fon ustida</p>
                      <div
                        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border"
                        style={{ background: form.bg_color }}
                      >
                        <img src={form.logo_url} alt="logo" className="h-full w-full object-contain p-2" />
                      </div>
                    </div>
                    {/* Shaffof fon (checkerboard) */}
                    <div className="flex-shrink-0">
                      <p className="mb-1 text-[10px] text-muted-foreground">Shaffoflik</p>
                      <div
                        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border"
                        style={{
                          backgroundImage: "linear-gradient(45deg,#d0d0d0 25%,transparent 25%,transparent 75%,#d0d0d0 75%),linear-gradient(45deg,#d0d0d0 25%,transparent 25%,transparent 75%,#d0d0d0 75%)",
                          backgroundSize: "10px 10px",
                          backgroundPosition: "0 0,5px 5px",
                          backgroundColor: "#f8f8f8",
                        }}
                      >
                        <img src={form.logo_url} alt="logo" className="h-full w-full object-contain p-2" />
                      </div>
                    </div>

                    {/* Tugmalar */}
                    <div className="ml-auto flex flex-col gap-1.5 pt-5">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-charcoal transition-colors"
                      >
                        <ImagePlus className="h-3.5 w-3.5" />
                        Almashtirish
                      </button>
                      {originalUrl && originalUrl !== form.logo_url && (
                        <button
                          type="button"
                          onClick={() => set({ logo_url: originalUrl })}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-charcoal transition-colors"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Asl holat
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { set({ logo_url: "" }); setOriginalUrl(""); logoBlobRef.current = null; }}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        O'chirish
                      </button>
                    </div>
                  </div>

                  {/* Blend rejimi (yashirin) */}
                  <details className="text-xs">
                    <summary className="cursor-pointer select-none text-muted-foreground hover:text-charcoal">
                      Qo'shimcha: blend rejimi
                    </summary>
                    <select
                      className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs"
                      value={form.logo_blend_mode}
                      onChange={(e) => set({ logo_blend_mode: e.target.value })}
                    >
                      {BLEND_MODES.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </details>
                </div>
              )}
            </div>

            {/* Ranglar */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Fon rangi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.bg_color}
                    onChange={(e) => set({ bg_color: e.target.value })}
                    className="h-9 w-9 cursor-pointer rounded-lg border border-border p-0.5"
                  />
                  <Input
                    value={form.bg_color}
                    onChange={(e) => set({ bg_color: e.target.value })}
                    className="h-9 font-mono text-xs"
                    maxLength={7}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Matn rangi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.text_color}
                    onChange={(e) => set({ text_color: e.target.value })}
                    className="h-9 w-9 cursor-pointer rounded-lg border border-border p-0.5"
                  />
                  <Input
                    value={form.text_color}
                    onChange={(e) => set({ text_color: e.target.value })}
                    className="h-9 font-mono text-xs"
                    maxLength={7}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Aksent rangi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.accent_color}
                    onChange={(e) => set({ accent_color: e.target.value })}
                    className="h-9 w-9 cursor-pointer rounded-lg border border-border p-0.5"
                  />
                  <Input
                    value={form.accent_color}
                    onChange={(e) => set({ accent_color: e.target.value })}
                    className="h-9 font-mono text-xs"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tartib raqami</label>
                <Input
                  type="number"
                  min={1}
                  value={form.sort_order}
                  onChange={(e) => set({ sort_order: Number(e.target.value) })}
                  className="h-9"
                />
              </div>
              <div className="pt-5">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => set({ is_active: e.target.checked })}
                    className="h-4 w-4 rounded accent-gold"
                  />
                  Faol
                </label>
              </div>
            </div>

            {IS_DEMO && (
              <p className="text-xs text-amber-600">Demo rejimda — sahifa yangilanganda saqlanmaydi</p>
            )}
          </div>

          {/* ── O'ng: oldindan ko'rish ─────────────────────────── */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Ko'rinish (oldindan)</p>
            <BrandPreview form={form} />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={save} disabled={saving || !form.name.trim()}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
          <Button variant="outline" onClick={onClose}>Bekor qilish</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Asosiy sahifa ─────────────────────────────────────────
export default function BrandsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands", false],
    queryFn: async (): Promise<Brand[]> => {
      if (IS_DEMO) {
        return [...demoBrands].sort((a, b) => a.sort_order - b.sort_order);
      }
      const { data, error } = await supabase.from("brands").select("*").order("sort_order");
      if (error) throw error;
      return data as Brand[];
    },
  });

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    setModalOpen(true);
  }

  async function toggleActive(brand: Brand) {
    if (IS_DEMO) {
      const idx = demoBrands.findIndex((b) => b.id === brand.id);
      if (idx >= 0) demoBrands[idx].is_active = !demoBrands[idx].is_active;
    } else {
      await supabase.from("brands").update({ is_active: !brand.is_active }).eq("id", brand.id);
    }
    qc.invalidateQueries({ queryKey: ["brands"] });
  }

  async function deleteBrand(brand: Brand) {
    if (!confirm(`"${brand.name}" brendini o'chirasizmi?`)) return;
    if (IS_DEMO) {
      const idx = demoBrands.findIndex((b) => b.id === brand.id);
      if (idx >= 0) demoBrands.splice(idx, 1);
    } else {
      await supabase.from("brands").delete().eq("id", brand.id);
    }
    qc.invalidateQueries({ queryKey: ["brands"] });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-light text-charcoal">Brendlar</h1>
        <Button onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Brend qo'shish
        </Button>
      </div>

      {/* Brendlar jadvali */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {isLoading ? (
          <div className="space-y-0 divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        ) : brands?.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Hali brend yo'q. Birinchi brendni qo'shing.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {brands?.map((b) => {
              const btnText = isLightColor(b.accent_color) ? "#1A1A1A" : "#FFFFFF";
              return (
                <div
                  key={b.id}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-cream-50",
                    !b.is_active && "opacity-50"
                  )}
                >
                  {/* Drag handle */}
                  <GripVertical className="h-4 w-4 flex-shrink-0 cursor-grab text-muted-foreground/40" />

                  {/* Mini oldindan ko'rish */}
                  <div
                    className="flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-lg overflow-hidden"
                    style={{ background: b.bg_color }}
                  >
                    {b.logo_url ? (
                      <img src={b.logo_url} alt={b.name} className="h-10 w-10 object-contain" />
                    ) : (
                      <span
                        className="text-xl font-bold tracking-widest"
                        style={{ color: b.text_color }}
                      >
                        {b.name[0]}
                      </span>
                    )}
                  </div>

                  {/* Ma'lumot */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold tracking-wider text-charcoal">{b.name}</p>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        b.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                      )}>
                        {b.is_active ? "Faol" : "Nofaol"}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{b.tagline}</p>
                    {/* Ranglar */}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span title="Fon" className="h-4 w-4 rounded-full border border-border/50"
                        style={{ background: b.bg_color }} />
                      <span title="Matn" className="h-4 w-4 rounded-full border border-border/50"
                        style={{ background: b.text_color }} />
                      <span title="Aksent" className="h-4 w-4 rounded-full border border-border/50"
                        style={{ background: b.accent_color }} />
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: b.accent_color, color: btnText }}>
                        Button
                      </span>
                    </div>
                  </div>

                  {/* Amallar */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(b)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-charcoal"
                      title={b.is_active ? "Yashirish" : "Ko'rsatish"}
                    >
                      {b.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(b)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-charcoal"
                      title="Tahrirlash"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteBrand(b)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="O'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BrandModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
      />
    </div>
  );
}
