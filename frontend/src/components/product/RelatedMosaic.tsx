import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useLang } from "@/hooks/useLang";
import { LogoCrest } from "@/components/brand/Logo";
import { SectionHeading } from "@/components/storefront/HomeSections";
import { formatPrice, getStorageUrl, cn } from "@/lib/utils";
import type { Product } from "@/types/database";

interface RelatedMosaicProps {
  currentId: string;
  categorySlug?: string | null;
}

function productImage(p: Product): string | null {
  const primary = p.images?.find((img) => img.is_primary) ?? p.images?.[0];
  return getStorageUrl(primary?.url ?? null);
}

// Kubik o'lchamlari — 1-tile katta (2x2), 5-tile keng (desktop)
const SPANS: Record<number, string> = {
  0: "col-span-2 row-span-2",
  4: "sm:col-span-2",
};

// ─── "Kolleksiyadan" — kubik-mozaika uslubidagi boshqa mahsulotlar ───
export function RelatedMosaic({ currentId, categorySlug }: RelatedMosaicProps) {
  const { pick } = useLang();
  const { data: products } = useProducts();

  const items = useMemo(() => {
    const all = (products ?? []).filter((p) => p.id !== currentId);
    // Avval shu kategoriya, keyin qolganlar
    const same = all.filter((p) => p.category?.slug === categorySlug);
    const rest = all.filter((p) => p.category?.slug !== categorySlug);
    return [...same, ...rest].slice(0, 7);
  }, [products, currentId, categorySlug]);

  if (items.length < 3) return null;

  // Mahsulot kubiklari + 4-o'ringa maison ornament kubigi
  const tiles: JSX.Element[] = items.map((p, i) => {
    const img = productImage(p);
    const price = p.sale_price != null && p.sale_price < p.base_price ? p.sale_price : p.base_price;
    const big = i === 0;
    return (
      <Link
        key={p.id}
        to={`/product/${p.id}`}
        className={cn(
          "group relative block overflow-hidden border border-charcoal/15 bg-charcoal/5 transition-colors duration-500 hover:border-gold/60",
          SPANS[i]
        )}
      >
        {img && (
          <img
            src={img}
            alt={pick(p, "name")}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
        <div className={cn("absolute inset-x-0 bottom-0", big ? "p-3.5 sm:p-5" : "p-2.5 sm:p-3")}>
          <h4
            className={cn(
              "font-serif font-medium text-cream line-clamp-1",
              big ? "text-lg sm:text-2xl" : "text-[0.86rem] sm:text-base"
            )}
          >
            {pick(p, "name")}
          </h4>
          <p
            className={cn("mt-0.5 font-medium text-cream/80", big ? "text-[0.8rem] sm:text-sm" : "text-[0.68rem] sm:text-xs")}
          >
            {formatPrice(price)}
          </p>
        </div>
      </Link>
    );
  });

  // Ornament kubigi — mozaikaga "maison" nafasi
  if (tiles.length >= 4) {
    tiles.splice(3, 0, (
      <div
        key="ornament"
        className="frame-double flex flex-col items-center justify-center gap-1.5 p-3 text-center sm:gap-2"
        style={{ background: "rgb(var(--brand-500)/0.05)" }}
      >
        <LogoCrest size={26} className="text-gold" />
        <span className="text-[0.46rem] uppercase tracking-[0.28em] text-charcoal-400 sm:text-[0.5rem]">
          Su Misura
        </span>
        <span className="font-serif text-[0.82rem] italic text-charcoal-600 sm:text-sm">Kaster Sartoria</span>
      </div>
    ));
  }

  return (
    <section className="mt-10 sm:mt-16 lg:mt-20">
      <SectionHeading
        numeral="✦"
        eyebrow="Kolleksiyadan"
        title={<>Boshqa <em className="italic text-gold">buyumlar</em></>}
        more={{ to: categorySlug ? `/catalog/${categorySlug}` : "/catalog", label: "Katalogga" }}
      />
      <div className="mt-5 grid auto-rows-[9.5rem] grid-flow-dense grid-cols-2 gap-2 sm:mt-9 sm:auto-rows-[11.5rem] sm:grid-cols-4 sm:gap-3">
        {tiles}
      </div>
    </section>
  );
}
