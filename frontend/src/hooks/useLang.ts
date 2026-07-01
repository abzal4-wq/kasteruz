import { useTranslation } from "react-i18next";

// Joriy tilga qarab uz/ru maydonni tanlash uchun yordamchi hook
export function useLang() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ru") ? "ru" : "uz") as "uz" | "ru";

  // Obyektdan tilga mos maydonni olish: pick(product, "name") → name_uz yoki name_ru
  function pick<T extends object>(
    obj: T | null | undefined,
    field: string
  ): string {
    if (!obj) return "";
    const rec = obj as Record<string, unknown>;
    return (rec[`${field}_${lang}`] as string) ?? (rec[`${field}_uz`] as string) ?? "";
  }

  function toggleLang() {
    i18n.changeLanguage(lang === "uz" ? "ru" : "uz");
  }

  return { lang, pick, toggleLang };
}
