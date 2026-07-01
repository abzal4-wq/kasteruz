import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { IS_DEMO } from "@/lib/demo-data";

// Do'kon aloqa ma'lumotlari (store_settings jadvalidan, key/value)
export interface StoreContact {
  phone: string;
  address: string;
  instagram: string;
  telegram: string;
  email: string;
  hours: string;
  map_url: string;
  about: string;
}

export const CONTACT_DEFAULTS: StoreContact = {
  phone: "+998 90 123 45 67",
  address: "Toshkent, Abu Sahiy bozori, 12-do'kon",
  instagram: "kaster_uz",
  telegram: "kaster_uz",
  email: "info@kaster.uz",
  hours: "Har kuni 09:00 — 21:00",
  map_url: "",
  about: "Premium erkaklar kostyum va kiyimlari. Sifat va nafosat — Kaster uslubi.",
};

const KEYS: Record<keyof StoreContact, string> = {
  phone: "contact_phone",
  address: "contact_address",
  instagram: "contact_instagram",
  telegram: "contact_telegram",
  email: "contact_email",
  hours: "contact_hours",
  map_url: "contact_map_url",
  about: "footer_about",
};

export function useStoreContact() {
  return useQuery({
    queryKey: ["store-contact"],
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<StoreContact> => {
      if (IS_DEMO) return CONTACT_DEFAULTS;
      const { data } = await supabase.from("store_settings").select("key, value");
      const map = new Map((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
      const result = { ...CONTACT_DEFAULTS };
      (Object.keys(KEYS) as (keyof StoreContact)[]).forEach((field) => {
        const v = map.get(KEYS[field]);
        if (v != null && v !== "") result[field] = v;
      });
      return result;
    },
  });
}

// Telefon raqamni tel: havola uchun tozalash (+998901234567)
export function telHref(phone: string) {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

export { KEYS as CONTACT_KEYS };
