import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useSearchStore } from "@/store/search";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

// iOS uslubidagi suzuvchi pastki navigatsiya (faqat mobil)
// Pastga scroll qilganda yashirinadi, tepaga qaytganda ko'rinadi
export function BottomTabBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const user = useAuthStore((s) => s.user);
  const openSearch = useSearchStore((s) => s.setOpen);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current && y > 120) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tabs = [
    { to: "/", label: t("nav.home"), icon: Home, exact: true },
    { to: "/catalog", label: t("nav.catalog"), icon: LayoutGrid },
    { type: "search" as const, label: t("common.search"), icon: Search },
    { to: "/cart", label: t("common.cart"), icon: ShoppingBag, badge: totalItems },
    { to: user ? "/account" : "/login", label: t("common.account"), icon: User },
  ];

  return (
    <nav
      className={cn(
        "pb-safe fixed inset-x-0 bottom-0 z-40 px-4 transition-transform duration-300 lg:hidden",
        hidden ? "translate-y-[140%]" : "translate-y-0"
      )}
    >
      <div className="glass-strong mx-auto flex max-w-md items-center justify-around rounded-ios-lg px-2 py-2 shadow-ios-tab">
        {tabs.map((tab) => {
          // Qidiruv tugmasi — overlay ochadi (navigatsiya emas)
          if (tab.type === "search") {
            return (
              <button
                key="search"
                onClick={() => { haptic("light"); openSearch(true); }}
                className="tap relative flex flex-1 flex-col items-center gap-1 py-1.5"
              >
                <tab.icon className="h-6 w-6 text-charcoal-400" strokeWidth={1.8} />
                <span className="text-[0.65rem] font-medium text-charcoal-400">{tab.label}</span>
              </button>
            );
          }

          const isActive = tab.exact
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to!) && tab.to !== "/";

          return (
            <NavLink
              key={tab.label}
              to={tab.to!}
              onClick={() => haptic("light")}
              className="tap relative flex flex-1 flex-col items-center gap-1 py-1.5"
            >
              <div className="relative">
                <tab.icon
                  className={cn(
                    "h-6 w-6 transition-colors",
                    isActive ? "text-gold" : "text-charcoal-400"
                  )}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[0.65rem] font-medium transition-colors",
                  isActive ? "text-gold" : "text-charcoal-400"
                )}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
