import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, Star, Home, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IS_DEMO } from "@/lib/demo-data";
import { toast } from "@/store/toast";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { SubPageHeader } from "./AccountUI";
import type { Address } from "@/types/database";

const REGIONS = ["Toshkent", "Toshkent viloyati", "Samarqand", "Buxoro", "Andijon", "Farg'ona", "Namangan", "Qashqadaryo", "Surxondaryo", "Xorazm", "Navoiy", "Jizzax", "Sirdaryo", "Qoraqalpog'iston"];

// Viloyat nomlari — bazada saqlangan qiymat UZ, ko'rinishi tilga qarab
const REGION_RU: Record<string, string> = {
  "Toshkent": "Ташкент", "Toshkent viloyati": "Ташкентская область", "Samarqand": "Самарканд",
  "Buxoro": "Бухара", "Andijon": "Андижан", "Farg'ona": "Фергана", "Namangan": "Наманган",
  "Qashqadaryo": "Кашкадарья", "Surxondaryo": "Сурхандарья", "Xorazm": "Хорезм",
  "Navoiy": "Навои", "Jizzax": "Джизак", "Sirdaryo": "Сырдарья", "Qoraqalpog'iston": "Каракалпакстан",
};

// Demo manzillar (xotirada)
const demoAddresses: Address[] = [];

export default function AddressesPage() {
  const { t, i18n } = useTranslation();
  const regionLabel = (r: string) => (i18n.language?.startsWith("ru") ? REGION_RU[r] ?? r : r);
  const qc = useQueryClient();
  const { user, customer } = useAuthStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ region: "Toshkent", district: "", address_line: "", landmark: "" });

  async function getCustomerId(): Promise<string | null> {
    if (customer?.id) return customer.id;
    if (user?.id) {
      const { data } = await supabase.from("customers").select("id").eq("auth_user_id", user.id).maybeSingle();
      return data?.id ?? null;
    }
    return null;
  }

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["my-addresses", user?.id, customer?.id],
    queryFn: async (): Promise<Address[]> => {
      if (IS_DEMO) return [...demoAddresses];
      const cid = await getCustomerId();
      if (!cid) return [];
      const { data } = await supabase
        .from("addresses").select("*").eq("customer_id", cid)
        .order("is_default", { ascending: false });
      return (data ?? []) as Address[];
    },
  });

  async function saveAddress() {
    if (!form.address_line.trim()) return;
    haptic("success");

    if (IS_DEMO) {
      demoAddresses.push({
        id: `addr-${Date.now()}`, customer_id: "demo", ...form,
        latitude: null, longitude: null,
        is_default: demoAddresses.length === 0, created_at: new Date().toISOString(),
      });
      qc.invalidateQueries({ queryKey: ["my-addresses"] });
      reset();
      toast.success(t("addressesPage.added"), { subtitle: t("profilePage.demoMode") });
      return;
    }

    const cid = await getCustomerId();
    if (!cid) {
      toast.error(t("addressesPage.fillProfileFirst"));
      return;
    }
    const { error } = await supabase.from("addresses").insert({
      customer_id: cid, region: form.region, district: form.district || null,
      address_line: form.address_line, landmark: form.landmark || null,
      is_default: (addresses?.length ?? 0) === 0,
    });
    if (error) { toast.error(t("common.error"), { subtitle: error.message }); return; }
    qc.invalidateQueries({ queryKey: ["my-addresses"] });
    reset();
    toast.success(t("addressesPage.added"));
  }

  async function makeDefault(addr: Address) {
    haptic("light");
    if (IS_DEMO) {
      demoAddresses.forEach((a) => (a.is_default = a.id === addr.id));
      qc.invalidateQueries({ queryKey: ["my-addresses"] });
      return;
    }
    await supabase.from("addresses").update({ is_default: false }).eq("customer_id", addr.customer_id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", addr.id);
    qc.invalidateQueries({ queryKey: ["my-addresses"] });
  }

  async function remove(addr: Address) {
    haptic("warning");
    if (IS_DEMO) {
      const i = demoAddresses.findIndex((a) => a.id === addr.id);
      if (i >= 0) demoAddresses.splice(i, 1);
      qc.invalidateQueries({ queryKey: ["my-addresses"] });
      return;
    }
    await supabase.from("addresses").delete().eq("id", addr.id);
    qc.invalidateQueries({ queryKey: ["my-addresses"] });
    toast.success(t("addressesPage.removed"));
  }

  function reset() {
    setForm({ region: "Toshkent", district: "", address_line: "", landmark: "" });
    setAdding(false);
  }

  return (
    <div>
      <SubPageHeader
        title={t("account.addresses")}
        right={
          !adding ? (
            <button
              onClick={() => { haptic("light"); setAdding(true); }}
              className="tap flex h-9 w-9 items-center justify-center rounded-full bg-gold text-white"
              aria-label={t("common.add")}
            >
              <Plus className="h-5 w-5" />
            </button>
          ) : undefined
        }
      />

      {/* Yangi manzil formasi */}
      {adding && (
        <div className="glass-card mb-5 animate-[scale-in_0.2s_ease-out] space-y-3 rounded-ios p-5">
          <div className="flex items-center justify-between">
            <p className="font-medium text-charcoal">{t("addressesPage.newAddress")}</p>
            <button onClick={reset} className="tap text-charcoal-300" aria-label={t("common.close")}><X className="h-4 w-4" /></button>
          </div>
          <select
            className="input-kaster"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          >
            {REGIONS.map((r) => <option key={r} value={r}>{regionLabel(r)}</option>)}
          </select>
          <input className="input-kaster" placeholder={t("addressesPage.districtPlaceholder")} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <input className="input-kaster" placeholder={t("addressesPage.addressPlaceholder")} value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} />
          <input className="input-kaster" placeholder={t("addressesPage.landmarkPlaceholder")} value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
          <Button onClick={saveAddress} disabled={!form.address_line.trim()} className="w-full">{t("common.save")}</Button>
        </div>
      )}

      {/* Ro'yxat */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-ios" />)}
        </div>
      ) : addresses && addresses.length > 0 ? (
        <ul className="space-y-3">
          {addresses.map((addr) => (
            <li key={addr.id} className={cn("glass-card rounded-ios p-4", addr.is_default && "ring-1 ring-gold/40")}>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Home className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-charcoal">{regionLabel(addr.region)}{addr.district ? `, ${addr.district}` : ""}</p>
                    {addr.is_default && (
                      <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[0.6rem] font-semibold text-gold">{t("addressesPage.defaultBadge")}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-charcoal-400">{addr.address_line}</p>
                  {addr.landmark && <p className="text-xs text-charcoal-400">{t("addressesPage.landmarkLabel")}: {addr.landmark}</p>}
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
                {!addr.is_default && (
                  <button onClick={() => makeDefault(addr)} className="tap flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-gold">
                    <Star className="h-3.5 w-3.5" /> {t("addressesPage.makeDefault")}
                  </button>
                )}
                <button onClick={() => remove(addr)} className="tap ml-auto flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-rose-400">
                  <Trash2 className="h-3.5 w-3.5" /> {t("common.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : !adding ? (
        <div className="glass-card rounded-ios-lg py-16 text-center">
          <MapPin className="mx-auto h-12 w-12 text-charcoal-300" strokeWidth={1} />
          <p className="mt-4 text-charcoal-400">{t("addressesPage.empty")}</p>
          <Button onClick={() => setAdding(true)} className="mt-6">
            <Plus className="mr-2 h-4 w-4" /> {t("addressesPage.add")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
