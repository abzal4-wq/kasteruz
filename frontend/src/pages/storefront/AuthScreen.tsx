import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User as UserIcon, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { IS_DEMO } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";
import { toast } from "@/store/toast";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

interface LocationState {
  from?: { pathname: string };
}

export default function AuthScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as LocationState)?.from?.pathname ?? "/";
  const { signInEmail, signUpEmail } = useAuthStore();

  const [mode, setMode] = useState<Mode>("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    haptic("medium");

    if (mode === "register" && !form.fullName.trim()) {
      setError("Ismingizni kiriting");
      return;
    }
    if (!form.email.trim()) { setError("Email kiriting"); return; }
    if (form.password.length < 6) { setError("Parol kamida 6 ta belgi"); return; }

    setLoading(true);
    const res =
      mode === "login"
        ? await signInEmail(form.email, form.password)
        : await signUpEmail(form);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      haptic("error");
      return;
    }
    haptic("success");
    toast.success(mode === "login" ? "Xush kelibsiz!" : "Hisob yaratildi!");
    navigate(redirectTo, { replace: true });
  }

  function switchMode(m: Mode) {
    haptic("light");
    setMode(m);
    setError("");
  }

  // Google bilan kirish (Supabase OAuth)
  async function googleSignIn() {
    haptic("light");
    setError("");
    setGoogleLoading(true);
    try {
      const back = redirectTo !== "/" ? redirectTo : "/";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + back },
      });
      if (error) {
        toast.error("Google bilan kirish hozircha sozlanmagan");
        setGoogleLoading(false);
        return;
      }
      // Demo rejimda redirect bo'lmaydi — sessiya darhol yaratiladi
      if (IS_DEMO) {
        haptic("success");
        toast.success("Xush kelibsiz!");
        navigate(redirectTo, { replace: true });
        return;
      }
      // Haqiqiy rejimda brauzer Google sahifasiga yo'naltiriladi
    } catch {
      toast.error("Google bilan kirishda xatolik");
      setGoogleLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-10"
      style={{ background: "linear-gradient(165deg, var(--bg-deep) 0%, var(--bg-deep2) 100%)" }}
    >
      {/* Fon nurlari */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40rem 40rem at 15% 0%, rgb(var(--brand-400)/0.4), transparent 60%)," +
            "radial-gradient(44rem 44rem at 90% 100%, rgb(var(--brand-300)/0.35), transparent 60%)",
        }}
      />

      <div className="auth-in relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-float" style={{ background: "linear-gradient(135deg,#261C10,#100C08)" }}>
            <img src="/icon-192.png" alt="Kaster" className="h-full w-full rounded-2xl" />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-light text-cream">KASTER</h1>
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.35em] text-gold">Menswear · Toshkent</p>
        </div>

        {/* Karta */}
        <div className="glass-strong rounded-ios-lg p-6">
          {/* Login / Register tab */}
          <div className="mb-6 flex rounded-full bg-black/20 p-1">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  "tap flex-1 rounded-full py-2.5 text-sm font-medium transition-all",
                  mode === m ? "bg-gold text-white shadow-glass-sm" : "text-charcoal-400"
                )}
              >
                {m === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
              </button>
            ))}
          </div>

          {/* Google bilan davom etish */}
          <button
            onClick={googleSignIn}
            disabled={googleLoading}
            className="tap flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-3.5 text-sm font-semibold text-[#1f1f1f] shadow-glass-sm transition-transform hover:opacity-95 disabled:opacity-60"
          >
            <GoogleIcon />
            {googleLoading ? "Ulanmoqda…" : "Google bilan davom etish"}
          </button>

          {/* Ajratgich */}
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[0.65rem] uppercase tracking-wider text-charcoal-400">yoki</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-3.5">
              {mode === "register" && (
                <AuthField icon={<UserIcon className="h-4 w-4" />}>
                  <input
                    className="auth-input"
                    placeholder="To'liq ism"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    autoComplete="name"
                  />
                </AuthField>
              )}

              <AuthField icon={<Mail className="h-4 w-4" />}>
                <input
                  className="auth-input"
                  type="email"
                  inputMode="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                />
              </AuthField>

              {mode === "register" && (
                <AuthField icon={<Phone className="h-4 w-4" />}>
                  <input
                    className="auth-input"
                    inputMode="tel"
                    placeholder="Telefon (ixtiyoriy)"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    autoComplete="tel"
                  />
                </AuthField>
              )}

              <AuthField icon={<Lock className="h-4 w-4" />}>
                <input
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Parol"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button type="button" onClick={() => setShowPass((s) => !s)} className="tap pr-1 text-charcoal-400">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </AuthField>

              {error && (
                <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-300">{error}</p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "..." : mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <p className="pt-1 text-center text-xs text-charcoal-400">
                {mode === "login" ? "Hisobingiz yo'qmi? " : "Hisobingiz bormi? "}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "login" ? "register" : "login")}
                  className="font-semibold text-gold hover:underline"
                >
                  {mode === "login" ? "Ro'yxatdan o'ting" : "Kiring"}
                </button>
              </p>
            </form>
        </div>

        <p className="mt-6 text-center text-[0.65rem] leading-relaxed text-charcoal-400">
          Davom etish orqali siz <span className="text-charcoal-300">Foydalanish shartlari</span> va{" "}
          <span className="text-charcoal-300">Maxfiylik siyosati</span>ga rozilik bildirasiz
        </p>
      </div>
    </div>
  );
}

function AuthField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 focus-within:border-gold/50">
      <span className="text-gold">{icon}</span>
      {children}
    </div>
  );
}

// Google rasmiy rangli "G" logosi
function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 34.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C41.4 36.9 44 31 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
