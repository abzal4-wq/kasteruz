import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { IS_DEMO } from "@/lib/demo-data";

// ─── Bosh sahifa bo'limlari (ko'rinish + tartib admin'dan boshqariladi) ───
export type SectionId =
  | "featured"
  | "categories"
  | "looks"
  | "standard"
  | "story"
  | "brands"
  | "reviews"
  | "newsletter";

export const SECTION_LABELS: Record<SectionId, string> = {
  featured: "Tavsiya etilgan",
  categories: "Kolleksiyalar",
  looks: "Looklar (kombinatsiyalar)",
  standard: "Kaster standarti",
  story: "Brend hikoyasi",
  brands: "Brendlar",
  reviews: "Mijozlar sharhlari",
  newsletter: "Obuna (Newsletter)",
};

export interface HeroStat { val: string; label: string }

export interface SiteSettings {
  heroImage: string;
  heroTitle1: string;
  heroTitle2: string; // oltin urg'u so'z
  heroSubtitle: string;
  heroStats: HeroStat[];
  // Bo'limlar — tartib + ko'rinish
  sections: { id: SectionId; visible: boolean }[];
}

export const SITE_DEFAULTS: SiteSettings = {
  heroImage:
    "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1600&q=85&auto=format&fit=crop",
  heroTitle1: "Tikilgan",
  heroTitle2: "mukammallik",
  heroSubtitle:
    "Har bir tikuv — san'at. Toshkent yuragida tug'ilgan, erkak go'zalligi uchun yaratilgan kostyumlar.",
  heroStats: [
    { val: "500+", label: "Mamnun mijoz" },
    { val: "Premium", label: "Italyan matolari" },
    { val: "100%", label: "Original sifat" },
  ],
  sections: [
    { id: "featured", visible: true },
    { id: "looks", visible: true },
    { id: "standard", visible: true },
    { id: "categories", visible: true },
    { id: "story", visible: true },
    { id: "brands", visible: true },
    { id: "reviews", visible: true },
    { id: "newsletter", visible: true },
  ],
};

// store_settings kalitlari
export const SITE_KEYS = {
  heroImage: "hero_image",
  heroTitle1: "hero_title1",
  heroTitle2: "hero_title2",
  heroSubtitle: "hero_subtitle",
  heroStats: "hero_stats", // JSON
  sections: "home_sections", // JSON
} as const;

// Saqlangan bo'lim ro'yxatini standart bilan birlashtirish (yangi bo'limlar yo'qolmasin)
function mergeSections(saved: unknown): SiteSettings["sections"] {
  if (!Array.isArray(saved)) return SITE_DEFAULTS.sections;
  const valid = saved.filter(
    (s): s is { id: SectionId; visible: boolean } =>
      s && typeof s.id === "string" && s.id in SECTION_LABELS
  );
  const seen = new Set(valid.map((s) => s.id));
  // standartdagi, lekin saqlanmagan bo'limlarni oxiriga qo'shamiz
  for (const def of SITE_DEFAULTS.sections) {
    if (!seen.has(def.id)) valid.push(def);
  }
  return valid.length ? valid : SITE_DEFAULTS.sections;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<SiteSettings> => {
      if (IS_DEMO) return SITE_DEFAULTS;
      const { data } = await supabase.from("store_settings").select("key, value");
      const map = new Map((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));

      const get = (k: string) => map.get(k);
      const parse = <T,>(v: string | undefined, fallback: T): T => {
        if (!v) return fallback;
        try { return JSON.parse(v) as T; } catch { return fallback; }
      };

      return {
        heroImage: get(SITE_KEYS.heroImage) || SITE_DEFAULTS.heroImage,
        heroTitle1: get(SITE_KEYS.heroTitle1) || SITE_DEFAULTS.heroTitle1,
        heroTitle2: get(SITE_KEYS.heroTitle2) || SITE_DEFAULTS.heroTitle2,
        heroSubtitle: get(SITE_KEYS.heroSubtitle) || SITE_DEFAULTS.heroSubtitle,
        heroStats: parse(get(SITE_KEYS.heroStats), SITE_DEFAULTS.heroStats),
        sections: mergeSections(parse(get(SITE_KEYS.sections), SITE_DEFAULTS.sections)),
      };
    },
  });
}
