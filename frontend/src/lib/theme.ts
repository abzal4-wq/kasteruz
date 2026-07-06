// ============================================================
// Mavzular (Themes) — 5 xil elegant urg'u rangi
// Har biri butun ilova rangini (urg'u, fon, orblar) o'zgartiradi
// ============================================================

export interface ThemeDef {
  id: string;
  name_uz: string;
  name_ru: string;
  // Ko'rsatish uchun namuna rang (swatch)
  swatch: string;
  // Oq mavzu uchun swatch'ga chegara kerak (ko'rinishi uchun)
  light?: boolean;
}

export const THEMES: ThemeDef[] = [
  { id: "bordeaux", name_uz: "Bordo", name_ru: "Бордовый", swatch: "#853631" },
  { id: "brown", name_uz: "Jigarrang", name_ru: "Коричневый", swatch: "#B08D57" },
  { id: "black", name_uz: "Qora", name_ru: "Чёрный", swatch: "#2E2E2E" },
  { id: "navy", name_uz: "To'q ko'k", name_ru: "Тёмно-синий", swatch: "#2C4A6E" },
  { id: "green", name_uz: "Yashil", name_ru: "Зелёный", swatch: "#3D6B52" },
  { id: "platinum", name_uz: "Oq", name_ru: "Белый", swatch: "#F3F1ED", light: true },
];

export type ThemeId = (typeof THEMES)[number]["id"];

const KEY = "kaster-theme";
const DEFAULT: ThemeId = "bordeaux";

export function loadTheme(): ThemeId {
  try {
    const v = localStorage.getItem(KEY);
    if (v && THEMES.some((t) => t.id === v)) return v;
  } catch {
    /* localStorage yo'q */
  }
  return DEFAULT;
}

// Mavzuni <html> ga qo'llash + saqlash
export function applyTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
}

// Ilk yuklanishda (flash bo'lmasligi uchun render'dan oldin chaqiriladi)
export function initTheme() {
  document.documentElement.dataset.theme = loadTheme();
}

// ============================================================
// Fon rejimi (Background mode) — Light / Dark / Navy
// Urg'u rangidan (data-theme) mustaqil: butun saytning orqa
// fonini va matn ohangini boshqaradi (data-mode orqali).
// ============================================================
export interface BgModeDef {
  id: string;
  name_uz: string;
  name_ru: string;
  // Tugmadagi namuna rang
  swatch: string;
}

export const BG_MODES: BgModeDef[] = [
  { id: "light", name_uz: "Oq", name_ru: "Светлая", swatch: "#F4F1EA" },
  { id: "dark", name_uz: "Qora", name_ru: "Тёмная", swatch: "#0F0F0F" },
];

export type BgMode = (typeof BG_MODES)[number]["id"];

const MODE_KEY = "kaster-bgmode";
const DEFAULT_MODE: BgMode = "light";

export function loadBgMode(): BgMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v && BG_MODES.some((m) => m.id === v)) return v;
  } catch {
    /* localStorage yo'q */
  }
  return DEFAULT_MODE;
}

// Rejimni <html data-mode> ga qo'llash + saqlash
export function applyBgMode(id: BgMode) {
  document.documentElement.dataset.mode = id;
  try {
    localStorage.setItem(MODE_KEY, id);
  } catch {
    /* ignore */
  }
}

// Ilk yuklanishda (render'dan oldin — miltillash bo'lmasin)
export function initBgMode() {
  document.documentElement.dataset.mode = loadBgMode();
}
