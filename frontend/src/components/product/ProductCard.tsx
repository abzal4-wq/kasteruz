import { Link } from "react-router-dom";
import { Heart, ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/database";
import { useLang } from "@/hooks/useLang";
import { formatPrice, discountPercent, getStorageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
      {/* ─── Rasm kartasi ─── */}
      <Link to={`/product/${product.id}`} className="block">
        <div
          className="relative aspect-[3/4] overflow-hidden rounded-[0.6rem] bg-white/5 shadow-glass-sm
                     transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                     group-hover:-translate-y-2 group-hover:shadow-float
                     group-active:scale-[0.97]"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={primaryImage?.alt ?? name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-charcoal-300">
              <span className="font-serif text-sm">Kaster</span>
            </div>
          )}

          {/* Diagonal porlash (sheen) — hoverda o'tadi */}
          <div className="pointer-events-none absolute inset-0 z-10 -translate-x-[130%] skew-x-[20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-[1000ms] ease-out group-hover:translate-x-[130%]" />

          {/* Pastki gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Badge'lar — klassik to'rtburchak teglar */}
          <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5">
            {product.is_featured && (
              <span className="rounded-sm bg-gold/90 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white shadow-glass-sm backdrop-blur">
                Tavsiya
              </span>
            )}
            {hasDiscount && (
              <span className="rounded-sm bg-[#8B1A1A] px-2.5 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-white/95 shadow-glass-sm">
                −{discountPercent(product.base_price, product.sale_price!)}%
              </span>
            )}
          </div>

          {/* "Batafsil" — hoverda pastdan suzib chiqadi */}
          <div className="absolute inset-x-3 bottom-3 z-20 flex translate-y-4 items-center justify-between opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
            <span className="rounded-md bg-gold px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white shadow-glass-sm backdrop-blur">
              Ko'rish
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-charcoal shadow-glass-sm">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>

      {/* Wishlist (like) — kartada */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        className="tap absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full glass shadow-glass-sm transition-transform duration-300 hover:scale-110"
        aria-label="Sevimlilarga qo'shish"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-300",
            isWishlisted ? "scale-125 fill-rose-500 text-rose-500" : "text-charcoal"
          )}
        />
      </button>

      {/* ─── Ma'lumot ─── */}
      <Link to={`/product/${product.id}`} className="mt-3.5 block px-1">
        <div className="flex items-center justify-between gap-2">
          {product.fit_type && (
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-gold">
              {product.fit_type === "slim" ? "Slim fit" : product.fit_type === "regular" ? "Regular fit" : "Comfort fit"}
            </p>
          )}
          {/* Rang nuqtalari */}
          {colorDots.length > 0 && (
            <div className="flex items-center gap-1">
              {colorDots.map(([color, hex]) => (
                <span
                  key={color}
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-white/30"
                  style={{ background: hex ?? "#ccc" }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        <h3 className="mt-1.5 font-serif text-base font-light text-charcoal line-clamp-1 transition-colors group-hover:text-gold sm:text-[1.05rem]">
          {name}
        </h3>
        {/* Nafis oltin chiziqcha — hover'da o'sadi */}
        <span className="mt-1.5 block h-px w-0 bg-gold/70 transition-all duration-500 ease-out group-hover:w-9" />

        <div className="mt-2 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm font-semibold tracking-wide text-gold">{formatPrice(displayPrice)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.base_price)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold tracking-wide text-charcoal">{formatPrice(displayPrice)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
