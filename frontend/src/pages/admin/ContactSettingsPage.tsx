import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Phone, MapPin, Instagram, Send, Mail, Clock, Map as MapIcon, FileText, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { IS_DEMO } from "@/lib/demo-data";
import { useStoreContact, CONTACT_DEFAULTS, CONTACT_KEYS, type StoreContact } from "@/hooks/useStoreContact";

export default function ContactSettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useStoreContact();
  const [form, setForm] = useState<StoreContact>(CONTACT_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function set<K extends keyof StoreContact>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    if (!IS_DEMO) {
      const rows = (Object.keys(CONTACT_KEYS) as (keyof StoreContact)[]).map((field) => ({
        key: CONTACT_KEYS[field],
        value: form[field] ?? "",
      }));
      await supabase.from("store_settings").upsert(rows, { onConflict: "key" });
      qc.invalidateQueries({ queryKey: ["store-contact"] });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 font-serif text-2xl font-light text-charcoal">Aloqa ma'lumotlari</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Bu yerda kiritilgan ma'lumotlar saytning pastki qismi (footer), bosh sahifa va aloqa bo'limida ko'rsatiladi.
      </p>

      <div className="space-y-5 rounded-xl border border-border bg-white p-6">
        <Field icon={<Phone className="h-4 w-4" />} label="Telefon raqam">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+998 90 123 45 67" />
        </Field>

        <Field icon={<MapPin className="h-4 w-4" />} label="Manzil">
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Toshkent, Abu Sahiy bozori, 12-do'kon" />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field icon={<Instagram className="h-4 w-4" />} label="Instagram (foydalanuvchi nomi)">
            <div className="flex items-center rounded-xl border border-border bg-white pl-3">
              <span className="text-sm text-muted-foreground">@</span>
              <input
                className="w-full bg-transparent px-1.5 py-2 text-sm outline-none"
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value.replace(/^@/, ""))}
                placeholder="kaster_uz"
              />
            </div>
          </Field>

          <Field icon={<Send className="h-4 w-4" />} label="Telegram (foydalanuvchi nomi)">
            <div className="flex items-center rounded-xl border border-border bg-white pl-3">
              <span className="text-sm text-muted-foreground">@</span>
              <input
                className="w-full bg-transparent px-1.5 py-2 text-sm outline-none"
                value={form.telegram}
                onChange={(e) => set("telegram", e.target.value.replace(/^@/, ""))}
                placeholder="kaster_uz"
              />
            </div>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field icon={<Mail className="h-4 w-4" />} label="Email">
            <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@kaster.uz" inputMode="email" />
          </Field>

          <Field icon={<Clock className="h-4 w-4" />} label="Ish vaqti">
            <Input value={form.hours} onChange={(e) => set("hours", e.target.value)} placeholder="Har kuni 09:00 — 21:00" />
          </Field>
        </div>

        <Field icon={<MapIcon className="h-4 w-4" />} label="Google Maps havolasi (ixtiyoriy)">
          <Input value={form.map_url} onChange={(e) => set("map_url", e.target.value)} placeholder="https://maps.google.com/..." inputMode="url" />
        </Field>

        <Field icon={<FileText className="h-4 w-4" />} label="Do'kon haqida (footer matni)">
          <textarea
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40"
            rows={3}
            value={form.about}
            onChange={(e) => set("about", e.target.value)}
            placeholder="Qisqa tavsif..."
          />
        </Field>

        {IS_DEMO && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Demo rejimda — o'zgarishlar saqlanmaydi. Haqiqiy saqlash uchun Supabase ulang.
          </p>
        )}
      </div>

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
