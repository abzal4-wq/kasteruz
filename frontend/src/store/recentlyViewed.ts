import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentProduct {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  viewedAt: number;
}

interface RecentState {
  items: RecentProduct[];
  add: (p: Omit<RecentProduct, "viewedAt">) => void;
  clear: () => void;
}

const MAX = 12;

export const useRecentlyViewedStore = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      add: (p) =>
        set((s) => {
          const filtered = s.items.filter((x) => x.id !== p.id);
          return {
            items: [{ ...p, viewedAt: Date.now() }, ...filtered].slice(0, MAX),
          };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "kaster-recently-viewed" }
  )
);
