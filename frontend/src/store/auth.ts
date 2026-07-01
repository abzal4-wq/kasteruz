import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile, Customer } from "@/types/database";
import { supabase } from "@/lib/supabase";

interface AuthResult {
  error: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  customer: Customer | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setCustomer: (customer: Customer | null) => void;
  signInEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpEmail: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Supabase xato xabarlarini o'zbekchaga o'girish
function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email yoki parol noto'g'ri";
  if (m.includes("already registered") || m.includes("already been registered")) return "Bu email allaqachon ro'yxatdan o'tgan";
  if (m.includes("password should be") || m.includes("at least 6")) return "Parol kamida 6 ta belgidan iborat bo'lsin";
  if (m.includes("unable to validate email") || m.includes("invalid email")) return "Email noto'g'ri kiritilgan";
  if (m.includes("rate limit") || m.includes("too many")) return "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring";
  if (m.includes("network") || m.includes("fetch")) return "Internet aloqasi yo'q. Ulanishni tekshiring";
  return msg;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  customer: null,
  loading: false,
  initialized: false,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  setProfile: (profile) => set({ profile }),

  setCustomer: (customer) => set({ customer }),

  // ─── Email + parol bilan kirish ──────────────────────────
  signInEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { error: translateAuthError(error.message) };
    return { error: null };
  },

  // ─── Email + parol bilan ro'yxatdan o'tish ───────────────
  signUpEmail: async ({ fullName, email, phone, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: translateAuthError(error.message) };
    if (!data.user) return { error: "Ro'yxatdan o'tishda xatolik" };

    // Mijoz yozuvini yaratish (RLS: auth_user_id = auth.uid())
    const { error: custErr } = await supabase.from("customers").insert({
      auth_user_id: data.user.id,
      full_name: fullName || null,
      phone: phone || cleanEmail, // telefon majburiy (unique) — bo'lmasa email
      email: cleanEmail,
    });
    // Mijoz allaqachon mavjud bo'lsa (takroriy) — e'tiborsiz qoldiramiz
    if (custErr && !custErr.message.toLowerCase().includes("duplicate")) {
      // jiddiy xato emas — profil keyin yaratiladi
      console.warn("customer insert:", custErr.message);
    }
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, customer: null });
  },

  initialize: async () => {
    // Idempotent: takroriy chaqiruvlardan himoya
    const state = useAuthStore.getState();
    if (state.initialized || state.loading) return;

    set({ loading: true });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      set({ session, user: session.user });

      // Profil va mijoz ma'lumotlarini yuklash
      const [profileRes, customerRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("auth_user_id", session.user.id)
          .maybeSingle(),
        supabase
          .from("customers")
          .select("*")
          .eq("auth_user_id", session.user.id)
          .maybeSingle(),
      ]);

      set({
        profile: profileRes.data ?? null,
        customer: customerRes.data ?? null,
      });
    }

    // Auth o'zgarishlarini kuzatish
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      set({ session: newSession, user: newSession?.user ?? null });

      if (event === "SIGNED_OUT") {
        set({ profile: null, customer: null });
      }

      if (
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
        newSession?.user
      ) {
        const [profileRes, customerRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("auth_user_id", newSession.user.id)
            .maybeSingle(),
          supabase
            .from("customers")
            .select("*")
            .eq("auth_user_id", newSession.user.id)
            .maybeSingle(),
        ]);
        set({
          profile: profileRes.data ?? null,
          customer: customerRes.data ?? null,
        });
      }
    });

    set({ loading: false, initialized: true });
  },
}));
