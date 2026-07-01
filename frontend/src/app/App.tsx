import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { SplashScreen } from "@/components/app/SplashScreen";
import { RequireUser, PublicOnly } from "@/components/auth/Gates";
import { AdminGuard } from "@/components/auth/AdminGuard";
import StorefrontLayout from "@/pages/storefront/layout/StorefrontLayout";

// ─── Asosiy xarid oqimi — darhol (eager), miltillamasin ───
import HomePage from "@/pages/storefront/HomePage";
import CatalogPage from "@/pages/storefront/CatalogPage";
import ProductPage from "@/pages/storefront/ProductPage";
import CartPage from "@/pages/storefront/CartPage";

// ─── Kamroq ishlatiladigan / og'ir sahifalar — kerak bo'lganda (lazy) ───
const AuthScreen = lazy(() => import("@/pages/storefront/AuthScreen"));
const CheckoutPage = lazy(() => import("@/pages/storefront/CheckoutPage")); // leaflet xarita — og'ir
const OrderSuccessPage = lazy(() => import("@/pages/storefront/OrderSuccessPage"));
const WishlistPage = lazy(() => import("@/pages/storefront/WishlistPage"));
const AboutPage = lazy(() => import("@/pages/storefront/AboutPage"));
const InfoPage = lazy(() => import("@/pages/storefront/InfoPage"));
const AccountLayout = lazy(() => import("@/pages/storefront/account/AccountLayout"));
const AccountHub = lazy(() => import("@/pages/storefront/account/AccountHub"));
const AccountOrders = lazy(() => import("@/pages/storefront/account/OrdersPage"));
const ProfilePage = lazy(() => import("@/pages/storefront/account/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/storefront/account/SettingsPage"));
const AddressesPage = lazy(() => import("@/pages/storefront/account/AddressesPage"));

// ─── Admin paneli — to'liq alohida bo'lak (xaridorlar yuklamaydi) ───
const AdminLayout = lazy(() => import("@/pages/admin/layout/AdminLayout"));
const AdminLogin = lazy(() => import("@/pages/admin/LoginPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/DashboardPage"));
const AdminProducts = lazy(() => import("@/pages/admin/ProductsPage"));
const CategoriesPage = lazy(() => import("@/pages/admin/CategoriesPage"));
const AdminOrders = lazy(() => import("@/pages/admin/OrdersPage"));
const InventoryPage = lazy(() => import("@/pages/admin/erp/InventoryPage"));
const SuppliersPage = lazy(() => import("@/pages/admin/erp/SuppliersPage"));
const FinancePage = lazy(() => import("@/pages/admin/erp/FinancePage"));
const PosPage = lazy(() => import("@/pages/admin/erp/PosPage"));
const CustomersPage = lazy(() => import("@/pages/admin/CustomersPage"));
const BrandsPage = lazy(() => import("@/pages/admin/BrandsPage"));
const PromoPage = lazy(() => import("@/pages/admin/PromoPage"));
const ContactSettingsPage = lazy(() => import("@/pages/admin/ContactSettingsPage"));
const AppearancePage = lazy(() => import("@/pages/admin/AppearancePage"));

// Lazy sahifalar yuklanayotganda ko'rsatiladigan nozik yuklagich
function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
    </div>
  );
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  // Auth holatini ilovaning ildizida bir marta yuklash
  // (AdminGuard initialized'ni kutgani uchun bu yerda chaqirish shart)
  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* O'yin kabi kutib olish (ilk yuklanishda) */}
      <SplashScreen />

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* ─── Kirish / Ro'yxat (ochiq, faqat kirmaganlar uchun) ── */}
          <Route path="/auth" element={<PublicOnly><AuthScreen /></PublicOnly>} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />

          {/* ─── Storefront (OCHIQ — ko'rish hammaga, xarid uchun login) ─── */}
          <Route element={<StorefrontLayout />}>
            {/* Ommaviy sahifalar */}
            <Route index element={<HomePage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="catalog/:categorySlug" element={<CatalogPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="delivery" element={<InfoPage />} />
            <Route path="returns" element={<InfoPage />} />
            <Route path="size-guide" element={<InfoPage />} />
            <Route path="privacy" element={<InfoPage />} />
            <Route path="terms" element={<InfoPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="product/:productId" element={<ProductPage />} />
            <Route path="cart" element={<CartPage />} />

            {/* Faqat kirgan foydalanuvchi uchun (xarid / hisob) */}
            <Route path="checkout" element={<RequireUser><CheckoutPage /></RequireUser>} />
            <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
            <Route path="account" element={<RequireUser><AccountLayout /></RequireUser>}>
              <Route index element={<AccountHub />} />
              <Route path="orders" element={<AccountOrders />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="addresses" element={<AddressesPage />} />
            </Route>
          </Route>

          {/* ─── Admin ──────────────────────────────── */}
          <Route path="admin/login" element={<AdminLogin />} />
          <Route
            path="admin/*"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="pos" element={<PosPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="promo" element={<PromoPage />} />
            <Route path="contact" element={<ContactSettingsPage />} />
            <Route path="appearance" element={<AppearancePage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
