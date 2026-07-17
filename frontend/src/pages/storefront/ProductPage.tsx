import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Check, Minus, Plus, ShoppingBag, Heart, Share2, Truck, RotateCcw, ShieldCheck, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProduct } from "@/hooks/useProducts";
import { useLang } from "@/hooks/useLang";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useProductReviews, reviewAverage } from "@/hooks/useReviews";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useRecentlyViewedStore } from "@/store/recentlyViewed";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { RelatedMosaic } from "@/components/product/RelatedMosaic";
import { ProductReviews } from "@/components/product/ProductReviews";
import { SizeGuide } from "@/components/product/SizeGuide";
import { Reveal } from "@/components/app/Reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { haptic } from "@/lib/haptics";
import { toast } from "@/store/toast";
import {
  formatPrice,
  discountPercent,
  getStorageUrl,
  getVariantPrice,
  cn,
} from "@/lib/utils";
import type { ProductVariant } from "@/types/database";

// Variant bo'yicha mavjud stok.
// null = inventar umuman yuritilmagan (cheklamaymiz, sotuvga ruxsat).
// son  = haqiqiy qoldiq (0 bo'lsa — tugagan).
function variantStock(v: ProductVariant): number | null {
  if (!v.inventory || v.inventory.length === 0) return null;
  return v.inventory.reduce((sum, inv) => sum + (inv.quantity - inv.reserved_quantity), 0);
}

export default function ProductPage() {
  const { t } = useTranslation();
  const { pick } = useLang();
  const { productId } = useParams();
  const { data: product, isLoading } = useProduct(productId);
  const { data: reviews = [] } = useProductReviews(productId);
  const reviewAvg = reviewAverage(reviews);
  usePageMeta(
    product ? `${pick(product, "name")} — Kaster.uz` : undefined,
    product ? pick(product, "description") || undefined : undefined
  );
  const addItem = useCartStore((s) => s.addItem);
  const addRecent = useRecentlyViewedStore((s) => s.add);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  // Mobil "Savatga" yopishqoq paneli — sahifadagi tugma ko'rinmay qolganda chiqadi
  const buyRowRef = useRef<HTMLDivElement>(null);
  const [showStickyBuy, setShowStickyBuy] = useState(false);

  // Sevimlilar (wishlist) + Instagram-uslubidagi double-tap
  const isWishlisted = useWishlistStore((s) => (productId ? s.ids.includes(productId) : false));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const addWishlist = useWishlistStore((s) => s.add);
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);

  // Rasmga bosish — 300ms ichida ikki marta bo'lsa "like" (Instagram kabi)
  function handleImageTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (productId) addWishlist(productId);
      setBurst(true);
      window.setTimeout(() => setBurst(false), 800);
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }

  // Rasmlar — primary birinchi, keyin sort_order
  // (Supabase embed tartibi kafolatlanmagan, shuning uchun o'zimiz saralaymiz)
  const images = useMemo(() => {
    const arr = [...(product?.images ?? [])];
    arr.sort(
      (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order
    );
    return arr;
  }, [product]);

  // Mavjud ranglar va o'lchamlar
  const colors = useMemo(() => {
    if (!product?.variants) return [];
    const map = new Map<string, ProductVariant>();
    product.variants.forEach((v) => {
      if (!map.has(v.color)) map.set(v.color, v);
    });
    return Array.from(map.values());
  }, [product]);

  const sizes = useMemo(() => {
    if (!product?.variants) return [];
    const filtered = selectedColor
      ? product.variants.filter((v) => v.color === selectedColor)
      : product.variants;
    // Rang tanlanmaganda bir o'lcham bir marta ko'rinsin (ko'p rangda takrorlanadi)
    const seen = new Set<string>();
    return filtered.filter((v) => {
      if (seen.has(v.size)) return false;
      seen.add(v.size);
      return true;
    });
  }, [product, selectedColor]);

  // Tanlangan variant
  const selectedVariant = useMemo(() => {
    if (!product?.variants || !selectedSize) return null;
    return product.variants.find(
      (v) =>
        v.size === selectedSize &&
        (selectedColor ? v.color === selectedColor : true)
    );
  }, [product, selectedSize, selectedColor]);

  // Stok holati
  const availableStock = useMemo(() => {
    if (!selectedVariant) return null;
    return variantStock(selectedVariant);
  }, [selectedVariant]);

  // ─── Ishqalanishni kamaytirish: yagona variantni avtomatik tanlash ───
  useEffect(() => {
    if (colors.length === 1 && !selectedColor) setSelectedColor(colors[0].color);
  }, [colors, selectedColor]);

  useEffect(() => {
    // Faqat bitta (mavjud) o'lcham bo'lsa — avtomatik tanlaymiz
    const inStock = sizes.filter((v) => variantStock(v) !== 0);
    if (inStock.length === 1 && selectedSize !== inStock[0].size) {
      setSelectedSize(inStock[0].size);
    }
  }, [sizes, selectedSize]);

  // Variant o'zgarsa miqdorni 1 ga qaytaramiz (stokdan oshmasin)
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?.id]);

  // Rasm tanlash: rang bo'lsa — mos surat, bo'lmasa — primary (0)
  // (bitta model — har rang o'z rasmida)
  useEffect(() => {
    if (!images.length) return;
    if (!selectedColor) {
      setActiveImage(0);
      return;
    }
    const idx = images.findIndex((im) => im.color === selectedColor);
    setActiveImage(idx >= 0 ? idx : 0);
  }, [selectedColor, images]);

  // Mobil yopishqoq panel — asosiy "Savatga" tugmasi ekrandan chiqsa ko'rsatamiz
  useEffect(() => {
    const el = buyRowRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowStickyBuy(!entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [product?.id]);

  // Yopishqoq panel chiqqanda suzuvchi tugmalar (chat, tepaga) u bilan
  // to'qnashmasligi uchun body'ga belgi qo'yamiz (index.css'da ko'tariladi)
  useEffect(() => {
    if (showStickyBuy) document.body.dataset.stickyBuy = "1";
    else delete document.body.dataset.stickyBuy;
    return () => {
      delete document.body.dataset.stickyBuy;
    };
  }, [showStickyBuy]);

  // Yaqinda ko'rilgan mahsulotlarga qo'shish
  useEffect(() => {
    if (!product) return;
    const primary = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
    addRecent({
      id: product.id,
      name: pick(product, "name"),
      price: product.base_price,
      salePrice: product.sale_price,
      imageUrl: getStorageUrl(primary?.url ?? null),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Native share (Web Share API) yoki havolani nusxalash
  async function handleShare() {
    haptic("light");
    const url = window.location.href;
    const title = product ? pick(product, "name") : "Kaster.uz";
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `${title} — Kaster.uz`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t("product.linkCopied"));
      }
    } catch {
      /* foydalanuvchi bekor qildi */
    }
  }

  if (isLoading) {
    return (
      <div className="container-page grid grid-cols-1 gap-10 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-muted-foreground">{t("common.noResults")}</p>
        <Button variant="link" asChild className="mt-4">
          <Link to="/catalog">{t("nav.catalog")}</Link>
        </Button>
      </div>
    );
  }

  const name = pick(product, "name");
  const description = pick(product, "description");
  const basePrice = getVariantPrice(
    product.base_price,
    selectedVariant?.price_override ?? null
  );
  const hasDiscount =
    product.sale_price != null && product.sale_price < product.base_price;
  const displayPrice = hasDiscount ? product.sale_price! : basePrice;

  function handleAddToCart() {
    if (!selectedVariant) return;
    const img = getStorageUrl((images[activeImage] ?? images[0])?.url ?? null);
    addItem({
      variantId: selectedVariant.id,
      productId: product!.id,
      productName: name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      colorHex: selectedVariant.color_hex,
      imageUrl: img,
      price: displayPrice,
      quantity,
    });
    setAdded(true);
    toast.cart(t("product.addedToCart"), {
      subtitle: `${name} · ${selectedVariant.size}`,
      imageUrl: img ?? undefined,
      action: { label: t("cart.viewCart"), to: "/cart" },
    });
    setTimeout(() => setAdded(false), 2000);
  }

  const canAddToCart = selectedVariant && (availableStock === null || availableStock > 0);
  const maxQty = availableStock ?? 99;

  return (
    <div className="container-page py-5 sm:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground sm:mb-6 sm:text-xs">
        <Link to="/" className="hover:text-gold">{t("nav.home")}</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/catalog" className="hover:text-gold">{t("nav.catalog")}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-charcoal">{name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-7 sm:gap-10 lg:grid-cols-2">
        {/* ─── Galereya ─────────────────────────────────── */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          {/* Thumbnaillar */}
          {images.length > 1 && (
            <div className="flex gap-2 sm:flex-col">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "tap h-20 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all duration-300",
                    activeImage === i
                      ? "border-gold shadow-glass-sm"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img
                    src={getStorageUrl(img.url)!}
                    alt={img.alt ?? name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Asosiy rasm — ikki marta bosilsa "like" (Instagram kabi) */}
          <div
            className="group relative aspect-[3/4] flex-1 cursor-pointer select-none overflow-hidden rounded-[0.7rem] bg-white/5 shadow-glass"
            onClick={handleImageTap}
          >
            {images[activeImage] ? (
              <img
                src={getStorageUrl(images[activeImage].url)!}
                alt={name}
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-charcoal-300">
                <span className="font-serif">Kaster</span>
              </div>
            )}

            {/* Diagonal porlash (sheen) */}
            <div className="pointer-events-none absolute inset-0 z-10 -translate-x-[130%] skew-x-[20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-[130%]" />

            {hasDiscount && (
              <Badge variant="destructive" className="absolute left-4 top-4">
                -{discountPercent(product.base_price, product.sale_price!)}%
              </Badge>
            )}

            {/* Like tugmasi (rasm ustida) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (productId) toggleWishlist(productId);
              }}
              className="tap absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full glass shadow-glass-sm"
              aria-label={t("product.addToWishlist")}
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isWishlisted ? "scale-110 fill-rose-500 text-rose-500" : "text-charcoal"
                )}
              />
            </button>

            {/* Double-tap yurak portlashi */}
            {burst && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Heart className="animate-heart-pop h-28 w-28 fill-white text-white drop-shadow-lg" />
              </div>
            )}
          </div>
        </div>

        {/* ─── Ma'lumot ─────────────────────────────────── */}
        <div className="lg:pt-4">
          <p className="flex items-center gap-2.5 text-[0.7rem] uppercase tracking-[0.3em] text-gold">
            <span className="h-px w-7 bg-gold" />
            {product.fit_type === "slim"
              ? "Slim fit"
              : product.fit_type === "regular"
              ? "Regular fit"
              : product.fit_type === "comfort"
              ? "Comfort fit"
              : "Kaster"}
          </p>
          <div className="mt-4 flex items-start justify-between gap-3">
            <h1 className="font-serif text-[1.65rem] font-medium leading-[1.05] text-charcoal sm:text-4xl lg:text-5xl">
              {name}
            </h1>
            <button
              onClick={handleShare}
              className="tap mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full glass shadow-glass-sm transition-transform hover:scale-105"
              aria-label={t("product.share")}
            >
              <Share2 className="h-4 w-4 text-charcoal" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-xs text-muted-foreground">
              {t("product.sku")}: {product.sku}
            </p>
            {reviews.length > 0 && (
              <a href="#reviews" className="flex items-center gap-1.5 text-xs text-charcoal transition-colors hover:text-gold">
                <span className="inline-flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i <= Math.round(reviewAvg) ? "fill-gold text-gold" : "fill-transparent text-charcoal-300"
                      )}
                    />
                  ))}
                </span>
                <span className="font-medium">{reviewAvg.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews.length})</span>
              </a>
            )}
          </div>

          {/* Narx — serif, klassik luxury */}
          <div className="mt-4 flex items-baseline gap-3 sm:mt-6">
            <span className={cn("font-serif text-2xl font-medium tracking-tight sm:text-4xl", hasDiscount ? "text-gold" : "text-charcoal")}>
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-muted-foreground line-through sm:text-lg">
                {formatPrice(product.base_price)}
              </span>
            )}
          </div>

          {/* Rang tanlash */}
          {colors.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest">
                {t("product.selectColor")}
                {selectedColor && (
                  <span className="ml-2 font-normal normal-case text-muted-foreground">
                    {selectedColor}
                  </span>
                )}
              </h4>
              <div className="flex gap-2">
                {colors.map((variant) => (
                  <button
                    key={variant.color}
                    onClick={() => {
                      setSelectedColor(variant.color);
                      setSelectedSize(null);
                    }}
                    className={cn(
                      "h-10 w-10 rounded-full border-2 transition-all duration-300 hover:scale-110",
                      selectedColor === variant.color
                        ? "scale-110 border-charcoal ring-2 ring-gold ring-offset-2"
                        : "border-border"
                    )}
                    style={{ backgroundColor: variant.color_hex ?? "#ccc" }}
                    title={variant.color}
                    aria-label={variant.color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* O'lcham tanlash */}
          <div className="mt-6 sm:mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-widest">
                {t("product.selectSize")}
              </h4>
              <SizeGuide triggerClassName="text-gold" />
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((variant) => {
                const stock = variantStock(variant);
                const oos = stock === 0;
                return (
                  <button
                    key={variant.id}
                    onClick={() => !oos && setSelectedSize(variant.size)}
                    disabled={oos}
                    title={oos ? t("product.outOfStock") : undefined}
                    className={cn(
                      "tap relative flex h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium transition-all duration-300 sm:h-12 sm:min-w-12",
                      oos
                        ? "cursor-not-allowed text-charcoal-400 line-through opacity-45"
                        : selectedSize === variant.size
                        ? "bg-gold text-white shadow-glass-sm"
                        : "glass text-charcoal hover:border-gold/40"
                    )}
                  >
                    {variant.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stok holati */}
          {selectedVariant && availableStock !== null && (
            <p className="mt-4 text-sm">
              {availableStock > 5 ? (
                <span className="flex items-center gap-1.5 text-green-600">
                  <Check className="h-4 w-4" /> {t("product.inStock")}
                </span>
              ) : availableStock > 0 ? (
                <span className="text-gold">
                  {t("product.lastItems", { count: availableStock })}
                </span>
              ) : (
                <span className="text-destructive">{t("product.outOfStock")}</span>
              )}
            </p>
          )}

          {/* Miqdor + savatga */}
          <div ref={buyRowRef} className="mt-6 flex flex-wrap gap-3 sm:mt-8">
            <div className="flex items-center rounded-md glass">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="tap flex h-12 w-12 items-center justify-center rounded-l-md transition-colors hover:bg-black/5 disabled:opacity-40"
                aria-label={t("product.decrease")}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-12 w-12 items-center justify-center text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty}
                className="tap flex h-12 w-12 items-center justify-center rounded-r-md transition-colors hover:bg-black/5 disabled:opacity-40"
                aria-label={t("product.increase")}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="min-w-[55%] flex-1 text-xs font-semibold uppercase tracking-wider"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  {t("common.success")}
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {selectedVariant ? t("product.addToCart") : t("product.selectSize")}
                </>
              )}
            </Button>
          </div>

          {/* Kafolat / ishonch chiplari */}
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {[
              { icon: Truck, label: t("product.fastDelivery") },
              { icon: RotateCcw, label: t("footer.returns") },
              { icon: ShieldCheck, label: t("product.warranty") },
            ].map((g) => (
              <div key={g.label} className="glass-card flex flex-col items-center gap-1.5 rounded-2xl py-3 sm:gap-2 sm:py-4">
                <g.icon className="h-4 w-4 text-gold" strokeWidth={1.7} />
                <span className="text-[0.62rem] uppercase tracking-wider text-charcoal-400">{g.label}</span>
              </div>
            ))}
          </div>

          {/* Tavsif */}
          {description && (
            <div className="mt-10 border-t border-border pt-6">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest">
                {t("product.description")}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          )}

          {/* Xususiyatlar — premium chip kartalar */}
          <div className="mt-8 border-t border-border pt-6">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest">
              {t("product.characteristics")}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {product.fabric && (
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">{t("product.fabric")}</p>
                  <p className="mt-1.5 text-sm font-medium text-charcoal">{product.fabric}</p>
                </div>
              )}
              {product.season && (
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">{t("product.season")}</p>
                  <p className="mt-1.5 text-sm font-medium text-charcoal">{product.season}</p>
                </div>
              )}
              {product.fit_type && (
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">{t("product.fit")}</p>
                  <p className="mt-1.5 text-sm font-medium text-charcoal">
                    {product.fit_type === "slim" ? "Slim fit" : product.fit_type === "regular" ? "Regular fit" : "Comfort fit"}
                  </p>
                </div>
              )}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">{t("product.warranty")}</p>
                <p className="mt-1.5 text-sm font-medium text-charcoal">{t("product.warrantyValue")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sharhlar */}
      <div id="reviews" className="mx-auto mt-4 max-w-3xl scroll-mt-24">
        <ProductReviews productId={product.id} />
      </div>

      {/* Kolleksiyadan — kubik-mozaika uslubida boshqa mahsulotlar */}
      <Reveal>
        <RelatedMosaic currentId={product.id} categorySlug={product.category?.slug} />
      </Reveal>

      {/* Yaqinda ko'rilgan (joriydan tashqari) */}
      <Reveal className="-mx-4 mt-12 sm:-mx-6 lg:-mx-8">
        <RecentlyViewed excludeId={product.id} />
      </Reveal>

      {/* ─── Mobil yopishqoq "Savatga" paneli (tab bar ustida) ─── */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-[5.25rem] z-30 px-4 transition-all duration-300 lg:hidden",
          showStickyBuy ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        )}
      >
        <div className="glass-strong mx-auto flex max-w-md items-center gap-3 rounded-ios-lg p-2.5 shadow-float">
          <div className="min-w-0 pl-2">
            <p className="truncate text-[0.6rem] uppercase tracking-wider text-muted-foreground">
              {selectedVariant ? `${selectedVariant.color} · ${selectedVariant.size}` : t("product.selectSize")}
            </p>
            <p className="text-base font-semibold text-charcoal">{formatPrice(displayPrice)}</p>
          </div>
          <Button
            size="lg"
            className="ml-auto min-w-0 flex-1 text-xs font-semibold uppercase tracking-wider"
            disabled={!canAddToCart}
            onClick={handleAddToCart}
          >
            {added ? (
              <><Check className="mr-2 h-4 w-4" />{t("common.success")}</>
            ) : (
              <><ShoppingBag className="mr-2 h-4 w-4" />{t("product.addToCartShort")}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
