import { create } from "zustand";
import {
  THEMES, loadTheme, applyTheme, type ThemeId,
  BG_MODES, loadBgMode, applyBgMode, type BgMode,
} from "@/lib/theme";

interface ThemeState {
  theme: ThemeId;
  bgMode: BgMode;
  setTheme: (id: ThemeId) => void;
  setBgMode: (id: BgMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: loadTheme(),
  bgMode: loadBgMode(),
  setTheme: (id) => {
    if (!THEMES.some((t) => t.id === id)) return;
    applyTheme(id);
    set({ theme: id });
  },
  setBgMode: (id) => {
    if (!BG_MODES.some((m) => m.id === id)) return;
    applyBgMode(id);
    set({ bgMode: id });
  },
}));
