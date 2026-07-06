import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Check, ChevronUp, ChevronDown, Eye, EyeOff, Type, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { IS_DEMO } from "@/lib/demo-data";
import { uploadProductImages } from "@/lib/upload";
import { toast } from "@/store/toast";
import {
  useSiteSettings,
  SITE_DEFAULTS,
  SITE_KEYS,
  SECTION_LABELS,
  type SiteSettings,
} from "@/hooks/useSiteSettings";

export default function AppearancePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(SITE_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function dirty() { setSaved(false); }
  function setHero<K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    dirty();
  }

  // Hero rasmini fayldan yuklash (Supabase Storage → public URL)
  async function onHeroFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const urls = await uploadProductImages([file]);
      if (urls[0]) {
        setHero("heroImage", urls[0]);
        toast.success("Rasm yuklandi");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yuklashda xatolik");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }
  function setStat(i: number, key: "val" | "label", v: string) {
    setForm((f) => ({ ...f, heroStats: f.heroStats.map((s, idx) => idx === i ? { ...s, [key]: v } : s) }));
    dirty();
  }
  function toggleSection(id: string) {
    setForm((f) => ({ ...f, sections: f.sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s) }));
    dirty();
  }
  function move(i: number, dir: -1 | 1) {
    setForm((f) => {
      const next = [...f.sections];
      const j = i + dir;
      if (j < 0 || j >= next.length) return f;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...f, sections: next };
    });
    dirty();
  }

  async function save() {
    setSaving(true);
    if (!IS_DEMO) {
      const rows = [
        { key: SITE_KEYS.heroImage, value: form.heroImage ?? "" },
        { key: SITE_KEYS.heroTitle1, value: form.heroTitle1 ?? "" },
        { key: SITE_KEYS.heroTitle2, value: form.heroTitle2 ?? "" },
        { key: SITE_KEYS.heroSubtitle, value: form.heroSubtitle ?? "" },
        { key: SITE_KEYS.heroStats, value: JSON.stringify(form.heroStats) },
        { key: SITE_KEYS.sections, value: JSON.stringify(form.sections) },
      ];
      await supabase.from("store_settings").upsert(rows, { onConflict: "key" });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 font-serif text-2xl font-light text-charcoal">Sayt ko'rinishi</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Bosh sahifaning hero qismi va bo'limlar tartibi/ko'rinishini shu yerdan boshqaring.
      </p>

      {/* ── HERO ── */}
      <div className="space-y-5 rounded-xl border border-border bg-white p-6">
        <h2 className="font-serif text-lg text-charcoal">Bosh sahifa (Hero)</h2>

        <Field icon={<ImageIcon className="h-4 w-4" />} label="Fon rasmi (yuklang yoki URL)">
          <div className="flex gap-2">
            <Input value={form.heroImage} onChange={(e) => setHero("heroImage", e.target.value)} placeholder="https://...jpg" inputMode="url" />
            <label className={`tap flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-xs font-medium text-charcoal transition-colors hover:border-gold/50 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
              {uploading ? "Yuklanmoqda…" : <><Upload className="h-4 w-4 text-gold" /> Yuklash</>}
              <input type="file" accept="image/*" className="hidden" onChange={onHeroFile} disabled={uploading} />
            </label>
          </div>
        </Field>
        {form.heroImage && (
          <div className="overflow-hidden rounded-lg border border-border">
            <img src={form.heroImage} alt="Hero" className="h-40 w-full object-cover" />
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field icon={<Type className="h-4 w-4" />} label="Sarlavha — 1-qator">
            <Input value={form.heroTitle1} onChange={(e) => setHero("heroTitle1", e.target.value)} placeholder="Tikilgan" />
          </Field>
          <Field icon={<Type className="h-4 w-4" />} label="Sarlavha — 2-qator (oltin)">
            <Input value={form.heroTitle2} onChange={(e) => setHero("heroTitle2", e.target.value)} placeholder="mukammallik" />
          </Field>
        </div>

        <Field icon={<Type className="h-4 w-4" />} label="Tavsif (subtitle)">
          <textarea
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            rows={2}
            value={form.heroSubtitle}
            onChange={(e) => setHero("heroSubtitle", e.target.value)}
          />
        </Field>

        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Statistika (3 ta)</label>
          <div className="space-y-2.5">
            {form.heroStats.map((s, i) => (
              <div key={i} className="grid grid-cols-2 gap-2.5">
                <Input value={s.val} onChange={(e) => setStat(i, "val", e.target.value)} placeholder="500+" />
                <Input value={s.label} onChange={(e) => setStat(i, "label", e.target.value)} placeholder="Mamnun mijoz" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BO'LIMLAR ── */}
      <div className="mt-6 rounded-xl border border-border bg-white p-6">
        <h2 className="mb-1 font-serif text-lg text-charcoal">Bosh sahifa bo'limlari</h2>
        <p className="mb-4 text-xs text-muted-foreground">Tartibni o'zgartiring (yuqori/quyi) yoki ko'rinishini yoqing/o'chiring.</p>

        <ul className="divide-y divide-border">
          {form.sections.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="tap text-charcoal-400 transition-colors hover:text-gold disabled:opacity-25"
                  aria-label="Yuqoriga"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === form.sections.length - 1}
                  className="tap text-charcoal-400 transition-colors hover:text-gold disabled:opacity-25"
                  aria-label="Pastga"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <span className="w-6 text-center font-serif text-sm text-charcoal-400">{i + 1}</span>

              <span className={`flex-1 text-sm font-medium ${s.visible ? "text-charcoal" : "text-charcoal-400 line-through"}`}>
                {SECTION_LABELS[s.id]}
              </span>

              <button
                onClick={() => toggleSection(s.id)}
                className={`tap flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  s.visible ? "bg-gold/15 text-gold" : "bg-charcoal-100/60 text-charcoal-400"
                }`}
              >
                {s.visible ? <><Eye className="h-3.5 w-3.5" /> Ko'rinadi</> : <><EyeOff className="h-3.5 w-3.5" /> Yashirin</>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {IS_DEMO && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Demo rejimda — o'zgarishlar saqlanmaydi. Haqiqiy saqlash uchun Supabase ulang.
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? "Saqlanmoqda..." : saved ? (<><Check className="mr-2 h-4 w-4" /> Saqlandi</>) : "Saqlash"}
        </Button>
        {saved && <span className="text-sm text-green-600">Saytda yangilandi ✓</span>}
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="text-gold">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
