import { create } from "zustand";
import type { Product } from "@/types/database";

interface QuickViewState {
  product: Product | null;
  open: (p: Product) => void;
  close: () => void;
}

// Tezkor ko'rish (Quick View) modali holati
export const useQuickView = create<QuickViewState>((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));
