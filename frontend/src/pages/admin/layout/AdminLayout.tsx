import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Warehouse, Tag,
  LogOut, Receipt, Truck, TrendingUp, Layers, FolderTree, Phone,
  Palette, Menu, X,
} from "lucide-react";
import { DemoBanner } from "@/components/brand/DemoBanner";
import { AdminThemeSwitcher } from "@/components/admin/AdminThemeSwitcher";
import { useAuthStore } from "@/store/auth";

const NAV_GROUPS: { title: string; items: { to: string; label: string; icon: typeof Package; end?: boolean }[] }[] = [
  {
    title: "Asosiy",
    items: [
      { to: "/admin", label: "Boshqaruv", icon: LayoutDashboard, end: true },
      { to: "/admin/orders", label: "Buyurtmalar", icon: ShoppingCart },
      { to: "/admin/pos", label: "POS Kassa", icon: Receipt },
    ],
  },
  {
    title: "Katalog",
    items: [
      { to: "/admin/products", label: "Mahsulotlar", icon: Package },
      { to: "/admin/categories", label: "Kategoriyalar", icon: FolderTree },
      { to: "/admin/brands", label: "Brendlar", icon: Layers },
    ],
  },
  {
    title: "Operatsiyalar",
    items: [
      { to: "/admin/inventory", label: "Ombor", icon: Warehouse },
      { to: "/admin/suppliers", label: "Ta'minotchilar", icon: Truck },
      { to: "/admin/finance", label: "Moliya", icon: TrendingUp },
    ],
  },
  {
    title: "Boshqaruv",
    items: [
      { to: "/admin/customers", label: "Mijozlar", icon: Users },
      { to: "/admin/promo", label: "Promo / Banner", icon: Tag },
      { to: "/admin/appearance", label: "Sayt ko'rinishi", icon: Palette },
      { to: "/admin/contact", label: "Aloqa", icon: Phone },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col" style={{ color: "var(--ad-sidebar-text)" }}>
      {/* Brend */}
      <div className="flex items-center gap-3 px-6 py-6">
        <img src="/icon-192.png" alt="Kaster" className="h-11 w-11 rounded-2xl shadow-lg" />
        <div>
          <p className="font-serif text-lg font-semibold leading-none">Kaster</p>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em]" style={{ color: "var(--ad-sidebar-muted)" }}>
            Boshqaruv
          </p>
        </div>
      </div>

      {/* Navigatsiya */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[0.6rem] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--ad-sidebar-muted)" }}>
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className="ad-pressable group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300"
                  style={({ isActive }) =>
                    isActive
                      ? { background: "var(--ad-sidebar-active)", color: "var(--ad-sidebar-text)" }
                      : { color: "var(--ad-sidebar-muted)" }
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-xl transition-all"
                        style={{
                          background: isActive ? "var(--ad-accent)" : "transparent",
                          color: isActive ? "var(--ad-on-accent)" : "inherit",
                        }}
                      >
                        <item.icon className="h-4 w-4" strokeWidth={isActive ? 2.4 : 2} />
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { profile, signOut, initialize, initialized } = useAuthStore();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (!initialized) void initialize();
  }, [initialized, initialize]);

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  const initial = (profile?.full_name?.[0] ?? "A").toUpperCase();

  return (
    <div className="admin-skin flex min-h-screen" style={{ background: "var(--ad-bg)" }}>
      {/* ─── Desktop sidebar ─────────────────────────── */}
      <aside
        className="sticky top-0 hidden h-screen w-64 flex-shrink-0 lg:block"
        style={{ background: "var(--ad-sidebar)", borderRight: "1px solid var(--ad-border)" }}
      >
        <SidebarContent />
      </aside>

      {/* ─── Mobile drawer ───────────────────────────── */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside
            className="absolute left-0 top-0 h-full w-72 animate-[slide-in-right_0.3s_ease-out]"
            style={{ background: "var(--ad-sidebar)" }}
          >
            <button
              onClick={() => setDrawer(false)}
              className="absolute right-3 top-5 flex h-9 w-9 items-center justify-center rounded-full"
              style={{ color: "var(--ad-sidebar-muted)" }}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      {/* ─── Asosiy ustun ────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky glass header */}
        <header className="ad-glass-bar sticky top-0 z-40 flex h-16 items-center gap-3 px-4 lg:h-[72px] lg:px-8">
          <button
            onClick={() => setDrawer(true)}
            className="ad-pressable flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
            style={{ background: "var(--ad-surface-2)", color: "var(--ad-text-2)" }}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold" style={{ color: "var(--ad-text)" }}>
              Xush kelibsiz{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </p>
            <p className="text-xs" style={{ color: "var(--ad-text-3)" }}>
              Bugungi savdo va buyurtmalarni boshqaring
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <AdminThemeSwitcher />

            {/* Profil */}
            <div className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1.5" style={{ background: "var(--ad-surface-2)", border: "1px solid var(--ad-border)" }}>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                style={{ background: "var(--ad-accent)", color: "var(--ad-on-accent)" }}
              >
                {initial}
              </span>
              <div className="hidden pr-1 sm:block">
                <p className="text-xs font-semibold leading-none" style={{ color: "var(--ad-text)" }}>
                  {profile?.full_name ?? "Admin"}
                </p>
                <p className="mt-0.5 text-[0.65rem] capitalize" style={{ color: "var(--ad-text-3)" }}>
                  {profile?.role ?? "owner"}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="ad-pressable flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:opacity-80"
                style={{ color: "var(--ad-text-3)" }}
                title="Chiqish"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <DemoBanner />

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8" style={{ color: "var(--ad-text)" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
