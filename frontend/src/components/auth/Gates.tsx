import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

// Butun saytni yopadi — kirmagan foydalanuvchi /auth ga yo'naltiriladi
export function RequireUser({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  // Splash ekrani ko'rsatilib turadi — bu yerda hech narsa render qilmaymiz
  if (!initialized) return null;

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// Faqat kirmaganlar uchun (auth ekran) — kirgan bo'lsa bosh sahifaga
export function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();

  if (!initialized) return null;

  if (user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
