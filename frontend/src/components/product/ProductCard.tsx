import { Link } from "react-router-dom";
import { Heart, ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/database";
import { useLang } from "@/hooks/useLang";
import { formatPrice, discountPercent, getStorageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist";

interface ProductCardProps {
  product: Product;
  /** Editorial raqamlash — "Nº 01" (ixtiyoriy) */
  index?: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { pick } = useLang();
  const isWishlisted = useWishlistStore((s) => s.ids.includes(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const name = pick(product, "name");
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const imageUrl = getStorageUrl(primaryImage?.url ?? null);

  const hasDiscount = product.sale_price != null && product.sale_price < product.base_price;
  const displayPrice = product.sale_price ?? product.base_price;

  // Rang nuqtalari (variantlardan)
  const colorDots = Array.from(
    new Map((product.variants ?? []).map((v) => [v.color, v.color_hex])).entries()
  ).slice(0, 4);

  return (
    <div className="group relative">
      {/* ─── Rasm — o'yma hairline ramka ichida ─── */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative border border-charcoal/15 p-1.5 transition-colors duration-500 group-hover:border-gold/60 sm:p-2">
          <div className="relative aspect-[3/4] overflow-hidden bg-charcoal/5 group-active:scale-[0.985] transition-transform duration-300">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={primaryImage?.alt ?? name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-charcoal-300">
                <span className="font-serif text-base italic">Kaster</span>
              </div>
            )}

            {/* Pastki gradient — hoverda */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Teglar — letterpress yorliqlar */}
            <div className="absolute left-0 top-3 z-20 flex flex-col items-start gap-1.5">
              {product.is_featured && (
                <span className="bg-charcoal-900/85 px-3 py-1 text-[0.54rem] font-medium uppercase tracking-[0.2em] text-cream backdrop-blur-sm">
                  Tavsiya
                </span>
              )}
              {hasDiscount && (
                <span className="bg-gold px-3 py-1 text-[0.54rem] font-semibold uppercase tracking-[0.2em] text-white">
                  −{discountPercent(product.base_price, product.sale_price!)}%
                </span>
              )}
            </div>

            {/* "Ko'rish" — hoverda pastdan */}
            <div className="absolute inset-x-4 bottom-4 z-20 flex translate-y-4 items-center justify-between opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
              <span className="border border-cream/50 px-4 py-2 text-[0.56rem] font-medium uppercase tracking-[0.22em] text-cream backdrop-blur-sm">
                Ko'rish
              </span>
              <span className="flex h-8 w-8 items-center justify-center border border-cream/50 text-cream backdrop-blur-sm">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Wishlist (like) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        className="tap absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full glass transition-transform duration-300 hover:scale-110 sm:right-4 sm:top-4 sm:h-9 sm:w-9"
        aria-label="Sevimlilarga qo'shish"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-300",
            isWishlisted ? "scale-125 fill-gold text-gold" : "text-charcoal"
          )}
          strokeWidth={1.6}
        />
      </button>

      {/* ─── Ma'lumot — markazlashgan editorial ─── */}
      <Link to={`/product/${product.id}`} className="mt-2.5 block px-1 text-center sm:mt-4 sm:px-2">
        <div className="flex items-center justify-center gap-2 text-[0.52rem] uppercase tracking-[0.2em] text-charcoal-400 sm:gap-2.5 sm:text-[0.56rem] sm:tracking-[0.24em]">
          {index != null && <span className="font-serif italic text-gold">Nº {String(index + 1).padStart(2, "0")}</span>}
          {index != null && product.fit_type && <span className="text-gold/50">·</span>}
          {product.fit_type && (
            <span>
              {product.fit_type === "slim" ? "Slim fit" : product.fit_type === "regular" ? "Regular fit" : "Comfort fit"}
            </span>
          )}
        </div>

        <h3 className="mt-1 font-serif text-[0.95rem] font-medium text-charcoal line-clamp-1 transition-colors group-hover:text-gold sm:mt-1.5 sm:text-xl">
          {name}
        </h3>

        {/* Ornament chiziqcha — hover'da kengayadi */}
        <span className="mx-auto mt-1.5 block h-px w-8 bg-gold/50 transition-all duration-500 ease-out group-hover:w-16 sm:mt-2" />

        <div className="mt-1.5 flex items-baseline justify-center gap-2 sm:mt-2">
          {hasDiscount ? (
            <>
              <span className="font-serif text-[0.88rem] font-semibold text-gold sm:text-base">{formatPrice(displayPrice)}</span>
              <span className="text-[0.66rem] text-muted-foreground line-through sm:text-xs">{formatPrice(product.base_price)}</span>
            </>
          ) : (
            <span className="font-serif text-[0.88rem] font-semibold text-charcoal sm:text-base">{formatPrice(displayPrice)}</span>
          )}
        </div>

        {/* Rang nuqtalari */}
        {colorDots.length > 0 && (
          <div className="mt-2 flex items-center justify-center gap-1.5 sm:mt-2.5">
            {colorDots.map(([color, hex]) => (
              <span
                key={color}
                className="h-2 w-2 rounded-full ring-1 ring-charcoal/20"
                style={{ background: hex ?? "#ccc" }}
                title={color}
              />
            ))}
          </div>
        )}
      </Link>
    </div>
  );
}
