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

// label_ru — ruscha yorliq (ixtiyoriy; bo'lmasa uz ko'rsatiladi)
export interface HeroStat { val: string; label: string; label_ru?: string }

export interface SiteSettings {
  heroImage: string;
  heroTitle1: string;
  heroTitle2: string; // oltin urg'u so'z
  heroSubtitle: string;
  // Ruscha variantlar (bo'sh bo'lsa uz ko'rsatiladi)
  heroTitle1Ru: string;
  heroTitle2Ru: string;
  heroSubtitleRu: string;
  heroStats: HeroStat[];
  // Bo'limlar — tartib + ko'rinish
  sections: { id: SectionId; visible: boolean }[];
}

export const SITE_DEFAULTS: SiteSettings = {
  heroImage: "/hero.jpg",
  heroTitle1: "Tikilgan",
  heroTitle2: "mukammallik",
  heroSubtitle:
    "Har bir tikuv — san'at. Toshkent yuragida tug'ilgan, erkak go'zalligi uchun yaratilgan kostyumlar.",
  heroTitle1Ru: "Скроенное",
  heroTitle2Ru: "совершенство",
  heroSubtitleRu:
    "Каждый стежок — искусство. Костюмы, рождённые в сердце Ташкента, созданные для мужской элегантности.",
  heroStats: [
    { val: "500+", label: "Mamnun mijoz", label_ru: "Довольных клиентов" },
    { val: "Premium", label: "Italyan matolari", label_ru: "Итальянские ткани" },
    { val: "100%", label: "Original sifat", label_ru: "Оригинальное качество" },
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
  heroTitle1Ru: "hero_title1_ru",
  heroTitle2Ru: "hero_title2_ru",
  heroSubtitleRu: "hero_subtitle_ru",
  heroStats: "hero_stats", // JSON (label_ru bilan)
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

      // Admin uz sarlavha kiritgan-u ru bo'sh bo'lsa: default ru emas, uz ko'rsatilsin
      const hasCustomTitle = !!(get(SITE_KEYS.heroTitle1) || get(SITE_KEYS.heroTitle2) || get(SITE_KEYS.heroSubtitle));
      return {
        heroImage: get(SITE_KEYS.heroImage) || SITE_DEFAULTS.heroImage,
        heroTitle1: get(SITE_KEYS.heroTitle1) || SITE_DEFAULTS.heroTitle1,
        heroTitle2: get(SITE_KEYS.heroTitle2) || SITE_DEFAULTS.heroTitle2,
        heroSubtitle: get(SITE_KEYS.heroSubtitle) || SITE_DEFAULTS.heroSubtitle,
        heroTitle1Ru: get(SITE_KEYS.heroTitle1Ru) || (hasCustomTitle ? "" : SITE_DEFAULTS.heroTitle1Ru),
        heroTitle2Ru: get(SITE_KEYS.heroTitle2Ru) || (hasCustomTitle ? "" : SITE_DEFAULTS.heroTitle2Ru),
        heroSubtitleRu: get(SITE_KEYS.heroSubtitleRu) || (hasCustomTitle ? "" : SITE_DEFAULTS.heroSubtitleRu),
        heroStats: parse(get(SITE_KEYS.heroStats), SITE_DEFAULTS.heroStats),
        sections: mergeSections(parse(get(SITE_KEYS.sections), SITE_DEFAULTS.sections)),
      };
    },
  });
}
