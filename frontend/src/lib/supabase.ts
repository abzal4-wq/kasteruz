import { createClient } from "@supabase/supabase-js";
import { IS_DEMO } from "./demo-data";
import { createDemoClient } from "./demo-client";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ─── Demo rejim ──────────────────────────────────────────────
// Supabase sozlanmagan bo'lsa, mock client ishlatiladi —
// loyiha brauzerda darhol ishlaydi (demo ma'lumotlar bilan).
function makeClient() {
  if (IS_DEMO) {
    if (import.meta.env.DEV) {
      console.info(
        "%c🎭 Kaster.uz DEMO REJIM",
        "color:#B08D57;font-weight:bold",
        "— Supabase ulanmagan, demo ma'lumotlar ishlatilmoqda. Haqiqiy ma'lumotlar uchun .env faylini to'ldiring (SOZLASH.md)."
      );
    }
    return createDemoClient() as unknown as ReturnType<typeof createClient>;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

export const supabase = makeClient();
