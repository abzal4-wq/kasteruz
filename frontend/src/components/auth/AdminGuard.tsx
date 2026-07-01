import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

interface AdminGuardProps {
  children: React.ReactNode;
}

const ADMIN_ROLES = ["owner", "admin", "manager", "seller", "storekeeper"] as const;

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, profile, initialized } = useAuthStore();

  if (!initialized) return null;

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!profile || !ADMIN_ROLES.includes(profile.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
