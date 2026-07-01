import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tag, Image as ImageIcon, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDateShort } from "@/lib/utils";
import { demoPromoCodes, demoBanners, IS_DEMO } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

// ─── Promo kodlar ────────────────────────────────────────────
function PromoCodesSection() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", min_order: "" });
  const [saving, setSaving] = useState(false);

  const { data: promos, isLoading } = useQuery({
    queryKey: ["admin-promos"],
    queryFn: async () => {
      if (IS_DEMO) return demoPromoCodes;
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function savePromo() {
    if (!form.code || !form.value) return;
    setSaving(true);
    if (!IS_DEMO) {
      await supabase.from("promo_codes").insert({
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        min_order: Number(form.min_order) || 0,
        is_active: true,
      });
      qc.invalidateQueries({ queryKey: ["admin-promos"] });
    }
    setForm({ code: "", type: "percent", value: "", min_order: "" });
    setAdding(false);
    setSaving(false);
  }

  async function togglePromo(id: string, current: boolean) {
    if (IS_DEMO) return;
    await supabase.from("promo_codes").update({ is_active: !current }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-promos"] });
  }

  async function deletePromo(id: string) {
    if (IS_DEMO) return;
    await supabase.from("promo_codes").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-promos"] });
  }

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gold" />
          <h2 className="font-medium text-charcoal">Promo kodlar</h2>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Qo'shish
        </Button>
      </div>

      {/* Yangi promo forma */}
      {adding && (
        <div className="border-b border-border bg-cream-50 p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Kod</label>
              <Input
                placeholder="KASTER10"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Turi</label>
              <select
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="percent">Foiz (%)</option>
                <option value="fixed">Miqdor (so'm)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                {form.type === "percent" ? "Chegirma (%)" : "Chegirma (so'm)"}
              </label>
              <Input
                type="number"
                placeholder={form.type === "percent" ? "10" : "50000"}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Min. buyurtma</label>
              <Input
                type="number"
                placeholder="500000"
                value={form.min_order}
                onChange={(e) => setForm({ ...form, min_order: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={savePromo} disabled={saving}>Saqlash</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Bekor</Button>
            {IS_DEMO && (
              <p className="ml-2 self-center text-xs text-amber-600">Demo rejimda saqlanmaydi</p>
            )}
          </div>
        </div>
      )}

      {/* Jadval */}
      <div className="divide-y divide-border">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-4">
                <Skeleton className="h-5 w-40" />
              </div>
            ))
          : promos?.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-gold/10 px-3 py-1 font-mono text-sm font-bold text-gold">
                    {p.code}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {p.type === "percent" ? `${p.value}% chegirma` : `${formatPrice(p.value)} chegirma`}
                    </p>
                    {p.min_order > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Min. buyurtma: {formatPrice(p.min_order)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    p.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  )}>
                    {p.is_active ? "Faol" : "Nofaol"}
                  </span>
                  <button
                    onClick={() => togglePromo(p.id, p.is_active)}
                    className="text-muted-foreground hover:text-charcoal"
                    title="Holat o'zgartirish"
                  >
                    {p.is_active
                      ? <ToggleRight className="h-5 w-5 text-green-600" />
                      : <ToggleLeft className="h-5 w-5" />
                    }
                  </button>
                  <button
                    onClick={() => deletePromo(p.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
        }
        {!isLoading && promos?.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">Promo kod yo'q</p>
        )}
      </div>
    </div>
  );
}

// ─── Bannerlar ───────────────────────────────────────────────
function BannersSection() {
  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      if (IS_DEMO) return demoBanners;
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-gold" />
          <h2 className="font-medium text-charcoal">Bannerlar</h2>
        </div>
        {IS_DEMO && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
            Demo rejim
          </span>
        )}
      </div>

      <div className="divide-y divide-border">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-4 px-5 py-4">
                <Skeleton className="h-20 w-32 rounded-lg" />
                <Skeleton className="h-6 w-40" />
              </div>
            ))
          : banners?.map((b: any) => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-4">
                {b.image_url && (
                  <img
                    src={b.image_url}
                    alt={b.title_uz || "Banner"}
                    className="h-20 w-36 rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-charcoal">{b.title_uz || "Banner"}</p>
                  {b.link && (
                    <p className="mt-0.5 text-xs text-muted-foreground">→ {b.link}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      b.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                    )}>
                      {b.is_active ? "Faol" : "Nofaol"}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">{b.position}</span>
                    {b.starts_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatDateShort(b.starts_at)} – {b.ends_at ? formatDateShort(b.ends_at) : "∞"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
        }
        {!isLoading && banners?.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">Banner yo'q</p>
        )}
      </div>
    </div>
  );
}

// ─── Asosiy sahifa ───────────────────────────────────────────
export default function PromoPage() {
  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-light text-charcoal">Promo & Banner</h1>
      <div className="space-y-6">
        <PromoCodesSection />
        <BannersSection />
      </div>
    </div>
  );
}
