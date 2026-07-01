import { create } from "zustand";
import { persist } from "zustand/middleware";
import { haptic } from "@/lib/haptics";

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  count: () => number;
  prune: (validIds: string[]) => void;
}

// Sevimlilar (wishlist) — mahsulot ID'lari, brauzerda saqlanadi
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (productId) => {
        haptic("medium");
        set((state) =>
          state.ids.includes(productId)
            ? { ids: state.ids.filter((id) => id !== productId) }
            : { ids: [...state.ids, productId] }
        );
      },

      add: (productId) => {
        haptic("medium");
        set((state) =>
          state.ids.includes(productId)
            ? state
            : { ids: [...state.ids, productId] }
        );
      },

      remove: (productId) =>
        set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),

      has: (productId) => get().ids.includes(productId),

      count: () => get().ids.length,

      // Mavjud bo'lmagan (o'chirilgan / eski demo) ID'larni tozalash —
      // faqat haqiqiy mahsulot ro'yxati bilan chaqirilsin
      prune: (validIds) =>
        set((state) => {
          const valid = new Set(validIds);
          const filtered = state.ids.filter((id) => valid.has(id));
          return filtered.length === state.ids.length ? state : { ids: filtered };
        }),
    }),
    {
      name: "kaster-wishlist",
    }
  )
);
