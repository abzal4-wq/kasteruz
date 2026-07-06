import { create } from "zustand";
import { persist } from "zustand/middleware";
import { haptic } from "@/lib/haptics";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  count: () => number;
  prune: (validIds: string[]) => void;
}

// ─── Server bilan sinxronlash (faqat tizimga kirgan mijoz uchun) ───
// Xatolar jim yutiladi: offline / demo rejimda UI localStorage bilan ishlayveradi.

function currentCustomerId(): string | null {
  return useAuthStore.getState().customer?.id ?? null;
}

async function pushAdd(productId: string) {
  const customerId = currentCustomerId();
  if (!customerId) return;
  try {
    await supabase
      .from("wishlists")
      .upsert(
        { customer_id: customerId, product_id: productId },
        { onConflict: "customer_id,product_id", ignoreDuplicates: true }
      );
  } catch {
    /* offline / demo — e'tiborsiz */
  }
}

async function pushRemove(productId: string) {
  const customerId = currentCustomerId();
  if (!customerId) return;
  try {
    await supabase
      .from("wishlists")
      .delete()
      .eq("customer_id", customerId)
      .eq("product_id", productId);
  } catch {
    /* offline / demo — e'tiborsiz */
  }
}

// Login paytida: server va localni birlashtirib, serverni yangilaymiz
async function hydrateFromServer() {
  const customerId = currentCustomerId();
  if (!customerId) return;
  try {
    const { data } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("customer_id", customerId);

    const serverIds: string[] = (data ?? []).map((r: { product_id: string }) => r.product_id);
    const localIds = useWishlistStore.getState().ids;
    const merged = Array.from(new Set([...serverIds, ...localIds]));

    // Faqat mahalliy qo'shilganlarni serverga yuklaymiz
    const localOnly = localIds.filter((id) => !serverIds.includes(id));
    if (localOnly.length) {
      await supabase.from("wishlists").upsert(
        localOnly.map((product_id) => ({ customer_id: customerId, product_id })),
        { onConflict: "customer_id,product_id", ignoreDuplicates: true }
      );
    }

    useWishlistStore.setState({ ids: merged });
  } catch {
    /* offline / demo — e'tiborsiz */
  }
}

// Sevimlilar (wishlist) — mahsulot ID'lari. Guest: localStorage, login: server + local
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (productId) => {
        haptic("medium");
        const has = get().ids.includes(productId);
        set((state) =>
          has
            ? { ids: state.ids.filter((id) => id !== productId) }
            : { ids: [...state.ids, productId] }
        );
        if (has) void pushRemove(productId);
        else void pushAdd(productId);
      },

      add: (productId) => {
        haptic("medium");
        if (get().ids.includes(productId)) return;
        set((state) => ({ ids: [...state.ids, productId] }));
        void pushAdd(productId);
      },

      remove: (productId) => {
        set((state) => ({ ids: state.ids.filter((id) => id !== productId) }));
        void pushRemove(productId);
      },

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

// ─── Auth holatiga ulanish ───
// Login (customer paydo bo'ldi) → serverdan birlashtirib yuklaymiz.
// Logout → mahalliy ro'yxatni tozalaymiz (keyingi foydalanuvchiga o'tmasin).
useAuthStore.subscribe((state, prev) => {
  const cid = state.customer?.id ?? null;
  const prevCid = prev.customer?.id ?? null;
  if (cid && cid !== prevCid) {
    void hydrateFromServer();
  } else if (!cid && prevCid) {
    useWishlistStore.setState({ ids: [] });
  }
});
