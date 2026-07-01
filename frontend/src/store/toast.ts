import { create } from "zustand";
import { haptic } from "@/lib/haptics";

export type ToastKind = "success" | "error" | "info" | "cart";

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  subtitle?: string;
  imageUrl?: string;
  action?: { label: string; to: string };
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = ++counter;
    haptic(t.kind === "error" ? "error" : t.kind === "success" || t.kind === "cart" ? "success" : "light");
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    // 3.5s dan keyin avtomatik yopish
    setTimeout(() => get().dismiss(id), 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

// Qulay yordamchi
export const toast = {
  success: (message: string, opts?: Partial<Toast>) =>
    useToastStore.getState().push({ kind: "success", message, ...opts }),
  error: (message: string, opts?: Partial<Toast>) =>
    useToastStore.getState().push({ kind: "error", message, ...opts }),
  info: (message: string, opts?: Partial<Toast>) =>
    useToastStore.getState().push({ kind: "info", message, ...opts }),
  cart: (message: string, opts?: Partial<Toast>) =>
    useToastStore.getState().push({ kind: "cart", message, ...opts }),
};
