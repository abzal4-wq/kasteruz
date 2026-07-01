import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { IS_DEMO } from "@/lib/demo-data";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const initialize = useAuthStore((s) => s.initialize);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setLoading(false);
      setError("Email yoki parol noto'g'ri");
      return;
    }

    // Profil mavjudligini va rolini tekshirish
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("auth_user_id", data.user.id)
      .single();

    if (!profile || !profile.is_active) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Sizda admin paneliga ruxsat yo'q");
      return;
    }

    await initialize();
    setLoading(false);
    navigate("/admin", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo variant="light" />
        </div>

        <div className="bg-cream p-8">
          <h1 className="text-center font-serif text-2xl font-light text-charcoal">
            Admin panel
          </h1>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Boshqaruv tizimiga kirish
          </p>

          {IS_DEMO && (
            <p className="mt-3 rounded bg-gold-50 px-3 py-2 text-center text-xs text-charcoal">
              <strong>Demo:</strong> istalgan email va parolni kiriting — admin sifatida kirasiz.
            </p>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-charcoal">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-charcoal">
                Parol
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Kirilmoqda..." : "Kirish"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
