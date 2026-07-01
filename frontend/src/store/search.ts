import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  open: boolean;
  history: string[];
  setOpen: (v: boolean) => void;
  addHistory: (q: string) => void;
  removeHistory: (q: string) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      open: false,
      history: [],
      setOpen: (v) => set({ open: v }),
      addHistory: (q) =>
        set((s) => {
          const t = q.trim();
          if (!t) return s;
          return { history: [t, ...s.history.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8) };
        }),
      removeHistory: (q) => set((s) => ({ history: s.history.filter((x) => x !== q) })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "kaster-search",
      partialize: (s) => ({ history: s.history }),
    }
  )
);
