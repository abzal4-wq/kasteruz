import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
