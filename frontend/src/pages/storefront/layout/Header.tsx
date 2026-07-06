import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Logo, LogoCrest } from "@/components/brand/Logo";
import { LangSwitch } from "@/components/brand/LangSwitch";
import { BgModeQuickButton } from "@/components/brand/BgModeToggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useWishlistStore } from "@/store/wishlist";
import { useSearchStore } from "@/store/search";
import { useStoreContact } from "@/hooks/useStoreContact";
import { haptic } from "@/lib/haptics";

export function Header() {
  const { t } = useTranslation();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const user = useAuthStore((s) => s.user);
  const openSearch = useSearchStore((s) => s.setOpen);
  const { data: contact } = useStoreContact();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Bosh sahifada tepada — qog'ozga singib turadi, scroll'da glass bo'ladi
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const atTopHome = location.pathname === "/" && !scrolled;

  const navLinks = [
    { to: "/catalog/kostyumlar", label: t("nav.suits") },
    { to: "/catalog/shimlar", label: t("nav.pants") },
    { to: "/catalog/koylaklar", label: t("nav.shirts") },
    { to: "/catalog/aksessuarlar", label: t("nav.accessories") },
    { to: "/about", label: "Maison" },
  ];

  function launchSearch() {
    haptic("light");
    openSearch(true);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-500",
        atTopHome ? "bg-transparent" : "glass-nav"
      )}
    >
      {/* Yuqori chiziq — manzil + til (faqat desktop) */}
      <div className="hidden lg:block">
        <div className="container-page flex h-9 items-center justify-between text-[0.62rem] uppercase tracking-[0.22em] text-charcoal-400">
          <span>{[contact?.address, contact?.phone].filter(Boolean).join("  ·  ")}</span>
          <LangSwitch className="text-charcoal" />
        </div>
        <div className="container-page"><div className="rule-ink" /></div>
      </div>

      {/* Asosiy header — chapda menyu, markazda gerb, o'ngda amallar */}
      <div className="container-page grid h-[3.25rem] grid-cols-[1fr_auto_1fr] items-center gap-4 sm:h-16 lg:h-[4.75rem]">
        {/* Chap: mobil menyu + desktop nav */}
        <div className="flex items-center">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="tap flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold lg:hidden"
                aria-label="Menyu"
              >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col px-6">
                {navLinks.map((link, i) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-baseline gap-4 border-b border-border py-4 transition-colors hover:text-gold"
                  >
                    <span className="font-serif text-xs italic text-gold">
                      {["I", "II", "III", "IV", "V"][i]}
                    </span>
                    <span className="font-sans text-sm uppercase tracking-[0.18em]">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group relative font-sans text-[0.68rem] uppercase tracking-[0.24em] text-charcoal transition-colors hover:text-gold"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-1/2 h-px w-0 -translate-x-1/2 bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Markaz: gerb-logo */}
        <div className="justify-self-center">
          <Logo className="lg:hidden" />
          <Link to="/" className="group hidden flex-col items-center leading-none lg:inline-flex" aria-label="Kaster — bosh sahifa">
            <LogoCrest className="text-gold transition-transform duration-500 group-hover:scale-110" size={30} />
            <span className="mt-1.5 font-display text-lg font-semibold uppercase tracking-[0.34em] text-charcoal">
              Kaster
            </span>
            <span className="mt-1 text-[0.48rem] uppercase tracking-[0.5em] text-gold">
              Sartoria · Toshkent
            </span>
          </Link>
        </div>

        {/* O'ng: amallar */}
        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
          <button
            onClick={launchSearch}
            aria-label={t("common.search")}
            className="tap flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold"
          >
            <Search className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
          </button>

          {/* Orqa fon rejimi (Qog'oz / Siyoh) */}
          <BgModeQuickButton />

          <Link
            to="/wishlist"
            aria-label={t("common.wishlist")}
            className="tap relative hidden h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold lg:flex"
          >
            <Heart className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.55rem] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to={user ? "/account" : "/login"}
            aria-label={t("common.account")}
            className="tap hidden h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold lg:flex"
          >
            <User className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
          </Link>

          <Link
            to="/cart"
            aria-label={t("common.cart")}
            className="tap relative flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold"
          >
            <ShoppingBag className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.55rem] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Pastki hairline — scroll'da glass o'zi chegara beradi */}
      {atTopHome && <div className="container-page"><div className="rule-ink" /></div>}
    </header>
  );
}
