import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User as UserIcon, Phone, Mail, Calendar, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IS_DEMO } from "@/lib/demo-data";
import { toast } from "@/store/toast";
import { SubPageHeader } from "./AccountUI";
import type { Customer } from "@/types/database";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, customer, setCustomer } = useAuthStore();
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", birthday: "" });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Customer | null> => {
      const { data } = await supabase
        .from("customers").select("*").eq("auth_user_id", user!.id).maybeSingle();
      return data as Customer | null;
    },
  });

  useEffect(() => {
    const c = data ?? customer;
    if (c) {
      setForm({
        full_name: c.full_name ?? "",
        phone: c.phone ?? "",
        email: c.email ?? "",
        birthday: c.birthday ?? "",
      });
    } else if (user?.email) {
      setForm((f) => ({ ...f, email: user.email ?? "" }));
    }
  }, [data, customer, user]);

  async function save() {
    setSaving(true);
    if (IS_DEMO) {
      setTimeout(() => {
        setSaving(false);
        toast.success(t("profilePage.saved"), { subtitle: t("profilePage.demoMode") });
      }, 500);
      return;
    }

    const payload = {
      auth_user_id: user!.id,
      full_name: form.full_name || null,
      phone: form.phone,
      email: form.email || null,
      birthday: form.birthday || null,
    };

    // mavjud bo'lsa update, bo'lmasa insert (phone unique)
    const existing = data ?? customer;
    let res;
    if (existing) {
      res = await supabase.from("customers").update(payload).eq("id", existing.id).select().single();
    } else {
      res = await supabase.from("customers").insert(payload).select().single();
    }

    setSaving(false);
    if (res.error) {
      toast.error(t("common.error"), { subtitle: res.error.message });
      return;
    }
    setCustomer(res.data as Customer);
    toast.success(t("profilePage.saved"));
  }

  const initials = (form.full_name || user?.email || "K").slice(0, 1).toUpperCase();

  if (isLoading) {
    return (
      <div>
        <SubPageHeader title={t("account.profileInfo")} />
        <Skeleton className="h-64 w-full rounded-ios" />
      </div>
    );
  }

  return (
    <div>
      <SubPageHeader title={t("account.profileInfo")} />

      {/* Avatar */}
      <div className="mb-6 flex flex-col items-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-600 text-4xl font-semibold text-white shadow-float">
          {initials}
        </div>
        <p className="mt-3 font-serif text-lg text-charcoal">{form.full_name || t("profilePage.enterName")}</p>
        {form.phone && <p className="text-xs text-charcoal-400">{form.phone}</p>}
      </div>

      {/* Forma */}
      <div className="glass-card space-y-4 rounded-ios p-5">
        <Field icon={<UserIcon className="h-4 w-4" />} label={t("checkout.fullName")}>
          <input
            className="input-kaster"
            placeholder={t("profilePage.namePlaceholder")}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </Field>
        <Field icon={<Phone className="h-4 w-4" />} label={t("checkout.phone")}>
          <input
            className="input-kaster"
            placeholder="+998 90 123 45 67"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Field>
        <Field icon={<Mail className="h-4 w-4" />} label="Email">
          <input
            className="input-kaster"
            placeholder="email@example.com"
            inputMode="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field icon={<Calendar className="h-4 w-4" />} label={t("profilePage.birthday")}>
          <input
            type="date"
            className="input-kaster"
            value={form.birthday}
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
          />
        </Field>
      </div>

      <Button onClick={save} disabled={saving || !form.phone} size="lg" className="mt-6 w-full">
        {saving ? t("profilePage.saving") : (<><Check className="mr-2 h-4 w-4" /> {t("common.save")}</>)}
      </Button>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-charcoal-400">
        <span className="text-gold">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
