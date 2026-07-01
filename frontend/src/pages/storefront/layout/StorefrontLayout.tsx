import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomTabBar } from "./BottomTabBar";
import { DemoBanner } from "@/components/brand/DemoBanner";
import { Toaster } from "@/components/app/Toaster";
import { InstallPrompt } from "@/components/app/InstallPrompt";
import { OfflineIndicator } from "@/components/app/OfflineIndicator";
import { BackToTop } from "@/components/app/BackToTop";
import { SearchOverlay } from "@/components/app/SearchOverlay";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { cn } from "@/lib/utils";

export default function StorefrontLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const bgMode = useThemeStore((s) => s.bgMode);
  const location = useLocation();

  // Auth holatini ilk yuklash
  useEffect(() => {
    if (!initialized) void initialize();
  }, [initialized, initialize]);

  // Sahifa o'zgarganda yuqoriga scroll
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={cn(bgMode === "light" ? "app-light" : "app-dark", "flex min-h-screen flex-col")}>
      <OfflineIndicator />
      <DemoBanner />
      <Header />
      {/* Mobilda pastki tab bar uchun joy (pb-28) */}
      <main className="flex-1 pb-28 lg:pb-0">
        {/* Sahifa o'tish animatsiyasi */}
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
      <Footer />
      <BottomTabBar />

      {/* App-darajadagi qatlamlar */}
      <Toaster />
      <InstallPrompt />
      <BackToTop />
      <SearchOverlay />
    </div>
  );
}
