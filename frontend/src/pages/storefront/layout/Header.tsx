import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/brand/Logo";
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

  // Bosh sahifa hero ustida — tepada shaffof, pastga aylanganda glass
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const transparent = location.pathname === "/" && !scrolled;

  const navLinks = [
    { to: "/catalog/kostyumlar", label: t("nav.suits") },
    { to: "/catalog/shimlar", label: t("nav.pants") },
    { to: "/catalog/koylaklar", label: t("nav.shirts") },
    { to: "/catalog/aksessuarlar", label: t("nav.accessories") },
    { to: "/about", label: "Biz haqimizda" },
  ];

  function launchSearch() {
    haptic("light");
    openSearch(true);
  }

  return (
    <header className={cn("sticky top-0 z-40 transition-colors duration-500", transparent ? "nav-over-hero nav-scrim" : "glass-nav")}>
      {/* Yuqori chiziq (faqat desktop) */}
      <div className="hidden bg-black/30 text-cream lg:block">
        <div className="container-page flex h-9 items-center justify-between text-[0.7rem]">
          <span className="tracking-wide opacity-80">
            {[contact?.address, contact?.phone].filter(Boolean).join(" · ")}
          </span>
          <LangSwitch className="text-cream" />
        </div>
      </div>

      {/* Asosiy header */}
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        {/* Mobil menyu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="tap flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold lg:hidden" aria-label="Menyu">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-border py-4 font-sans text-sm uppercase tracking-wider transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex-shrink-0 lg:flex-1">
          <Logo />
        </div>

        {/* Desktop navigatsiya */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-sans text-xs uppercase tracking-widest text-charcoal transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* O'ng tarafdagi ikonkalar — ochiq, klassik */}
        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-1.5">
          {/* Qidiruv — overlay ochadi */}
          <button
            onClick={launchSearch}
            aria-label={t("common.search")}
            className="tap flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold"
          >
            <Search className="h-[1.15rem] w-[1.15rem]" />
          </button>

          {/* Orqa fon rejimi (Oq / Qora) */}
          <BgModeQuickButton />

          {/* Sevimlilar (desktop) */}
          <Link
            to="/wishlist"
            aria-label={t("common.wishlist")}
            className="tap relative hidden h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold lg:flex"
          >
            <Heart className="h-[1.15rem] w-[1.15rem]" />
            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.55rem] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Hisob (desktop) */}
          <Link
            to={user ? "/account" : "/login"}
            aria-label={t("common.account")}
            className="tap hidden h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold lg:flex"
          >
            <User className="h-[1.15rem] w-[1.15rem]" />
          </Link>

          {/* Savat */}
          <Link
            to="/cart"
            aria-label={t("common.cart")}
            className="tap relative flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold"
          >
            <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
            {totalItems > 0 && (
              <span className="absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.55rem] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
