import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRecentlyViewedStore } from "@/store/recentlyViewed";
import { formatPrice } from "@/lib/utils";

// Yaqinda ko'rilgan mahsulotlar — gorizontal sirpanma lenta
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { t } = useTranslation();
  const items = useRecentlyViewedStore((s) => s.items).filter((p) => p.id !== excludeId);

  if (items.length < 2) return null;

  return (
    <section className="container-page py-8">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-gold" />
        <h2 className="font-serif text-xl font-light text-charcoal">{t("product.recentlyViewed")}</h2>
      </div>

      <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {items.map((p) => {
          const price = p.salePrice ?? p.price;
          return (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="tap group w-32 flex-shrink-0"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-ios bg-white/5 shadow-glass-sm">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-charcoal-300">
                    <span className="font-serif text-xs">Kaster</span>
                  </div>
                )}
              </div>
              <p className="mt-2 line-clamp-1 text-xs font-medium text-charcoal">{p.name}</p>
              <p className="text-xs font-semibold text-gold">{formatPrice(price)}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
