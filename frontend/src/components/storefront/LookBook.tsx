import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useLang } from "@/hooks/useLang";
import { Reveal } from "@/components/app/Reveal";
import { CardSlider } from "@/components/storefront/CardSlider";
import { SectionHeading } from "@/components/storefront/HomeSections";
import { formatPrice, getStorageUrl } from "@/lib/utils";
import type { Product } from "@/types/database";

// ─── Look retseptlari — kategoriya kombinatsiyalari ──────────
// Har bir look kategoriyalardan bittadan mahsulot yig'adi.
const RECIPES = [
  {
    id: "kiyov",
    numeral: "I",
    titleKey: "lookbook.looks.kiyov.title",
    taglineKey: "lookbook.looks.kiyov.tagline",
    slots: ["kostyumlar", "koylaklar", "aksessuarlar"],
  },
  {
    id: "biznes",
    numeral: "II",
    titleKey: "lookbook.looks.biznes.title",
    taglineKey: "lookbook.looks.biznes.tagline",
    slots: ["kostyumlar", "shimlar", "koylaklar"],
  },
  {
    id: "ziyofat",
    numeral: "III",
    titleKey: "lookbook.looks.ziyofat.title",
    taglineKey: "lookbook.looks.ziyofat.tagline",
    slots: ["shimlar", "koylaklar", "aksessuarlar"],
  },
];

// Kategoriyadan mahsulot tanlash — featured birinchi, offset bilan xilma-xillik
function pickForSlot(products: Product[], slug: string, offset: number): Product | null {
  const inCat = products.filter((p) => p.category?.slug === slug);
  if (inCat.length === 0) return null;
  const featured = inCat.filter((p) => p.is_featured);
  const pool = featured.length > 0 ? featured : inCat;
  return pool[offset % pool.length];
}

function productImage(p: Product): string | null {
  const primary = p.images?.find((img) => img.is_primary) ?? p.images?.[0];
  return getStorageUrl(primary?.url ?? null);
}

function productPrice(p: Product): number {
  return p.sale_price != null && p.sale_price < p.base_price ? p.sale_price : p.base_price;
}

interface Look {
  recipe: (typeof RECIPES)[number];
  items: Product[];
  total: number;
}

export function LookBook() {
  const { t } = useTranslation();
  const { pick } = useLang();
  const { data: products } = useProducts();

  const looks: Look[] = useMemo(() => {
    if (!products || products.length === 0) return [];
    return RECIPES.map((recipe, ri) => {
      const seen = new Set<string>();
      const items: Product[] = [];
      for (const slug of recipe.slots) {
        // offset = retsept indeksi → har look boshqa mahsulot oladi
        let p = pickForSlot(products, slug, ri);
        if (p && seen.has(p.id)) p = pickForSlot(products, slug, ri + 1);
        if (p && !seen.has(p.id)) {
          seen.add(p.id);
          items.push(p);
        }
      }
      return {
        recipe,
        items,
        total: items.reduce((sum, p) => sum + productPrice(p), 0),
      };
    }).filter((l) => l.items.length >= 2);
  }, [products]);

  if (looks.length === 0) return null;

  return (
    <section className="py-8 sm:py-14 lg:py-24" style={{ background: "rgb(var(--brand-500)/0.045)" }}>
      <div className="container-page">
        <Reveal className="mb-6 sm:mb-12 lg:mb-16">
          <SectionHeading
            numeral="✦"
            eyebrow={t("lookbook.eyebrow")}
            title={<>{t("lookbook.titleLead")} <em className="italic text-gold">{t("lookbook.titleAccent")}</em></>}
            sub={t("lookbook.sub")}
          />
        </Reveal>

        <CardSlider>
          {looks.map((look) => {
            const [main, ...rest] = look.items;
            return (
              <div key={look.recipe.id} className="group/card w-[76vw] flex-shrink-0 snap-start sm:w-[400px] lg:w-[430px]">
                <div className="frame-double flex h-full flex-col p-2.5 sm:p-4">
                  {/* Hoverda oltin ramka */}
                  <span className="pointer-events-none absolute inset-0 z-10 border border-transparent transition-colors duration-500 group-hover/card:border-gold/60" />

                  {/* Kolaj — katta surat + yon kubiklar + muhr */}
                  <div className="relative grid aspect-[4/3.4] grid-cols-3 grid-rows-2 gap-1.5">
                    {/* Retsept muhri — bordo surg'uch */}
                    <div
                      className="pointer-events-none absolute -right-1.5 -top-1.5 z-20 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition-transform duration-500 group-hover/card:rotate-12 sm:h-11 sm:w-11"
                      style={{ background: "rgb(var(--brand-600))" }}
                    >
                      <span className="absolute inset-1 rounded-full border border-white/40" />
                      <span className="font-serif text-xs italic sm:text-sm">{look.recipe.numeral}</span>
                    </div>

                    <Link
                      to={`/product/${main.id}`}
                      className={`group relative overflow-hidden bg-charcoal/5 ${rest.length > 0 ? "col-span-2" : "col-span-3"} row-span-2`}
                    >
                      {productImage(main) && (
                        <img
                          src={productImage(main)!}
                          alt={pick(main, "name")}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      {/* Pin — tarkib qatoriga mos raqam */}
                      <span
                        className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-charcoal/25 font-serif text-[0.6rem] italic text-charcoal shadow-sm sm:h-6 sm:w-6 sm:text-[0.68rem]"
                        style={{ background: "var(--bg-deep)" }}
                      >
                        i
                      </span>
                      <span className="absolute bottom-2 left-2.5 font-serif text-xs italic text-cream/90 sm:text-sm">
                        {pick(main, "name")}
                      </span>
                    </Link>
                    {rest.slice(0, 2).map((p, i) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        className={`group relative overflow-hidden bg-charcoal/5 ${rest.length === 1 ? "row-span-2" : ""}`}
                      >
                        {productImage(p) && (
                          <img
                            src={productImage(p)!}
                            alt={pick(p, "name")}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <span
                          className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-charcoal/25 font-serif text-[0.6rem] italic text-charcoal shadow-sm sm:h-6 sm:w-6 sm:text-[0.68rem]"
                          style={{ background: "var(--bg-deep)" }}
                        >
                          {["ii", "iii"][i]}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Sarlavha */}
                  <div className="mt-3 flex items-baseline justify-between gap-3 sm:mt-5">
                    <h3 className="font-serif text-lg font-medium text-charcoal sm:text-2xl">
                      {t(look.recipe.titleKey)}
                    </h3>
                    <span className="font-serif text-sm italic text-charcoal-300">{look.recipe.numeral}</span>
                  </div>
                  <p className="mt-0.5 font-serif text-[0.82rem] italic text-charcoal-500 sm:mt-1 sm:text-[0.95rem]">
                    {t(look.recipe.taglineKey)}
                  </p>

                  {/* Tarkib — reestr qatorlari */}
                  <div className="mt-3 flex-1 sm:mt-4">
                    {look.items.map((p, i) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        className="group flex items-baseline gap-2.5 border-t border-charcoal/10 py-1.5 sm:py-2.5"
                      >
                        <span className="font-serif text-[0.68rem] italic text-gold">{["i", "ii", "iii"][i]}</span>
                        <span className="min-w-0 flex-1 truncate text-[0.76rem] text-charcoal-600 transition-colors group-hover:text-gold sm:text-[0.86rem]">
                          {pick(p, "name")}
                        </span>
                        <span className="whitespace-nowrap text-[0.7rem] font-medium text-charcoal-400 sm:text-[0.78rem]">
                          {formatPrice(productPrice(p))}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Jami + CTA */}
                  <div className="mt-2 stitch-h" />
                  <div className="mt-2.5 flex items-center justify-between gap-3 sm:mt-3">
                    <div>
                      <div className="text-[0.5rem] uppercase tracking-[0.22em] text-charcoal-400 sm:text-[0.54rem] sm:tracking-[0.24em]">{t("lookbook.total")}</div>
                      <div className="font-serif text-base font-semibold text-gold sm:text-xl">{formatPrice(look.total)}</div>
                    </div>
                    <Link
                      to={`/product/${main.id}`}
                      className="btn-press tap group px-4 py-2.5 text-[0.54rem] font-semibold uppercase tracking-[0.18em] sm:px-6 sm:py-3 sm:text-[0.6rem] sm:tracking-[0.2em]"
                    >
                      {t("lookbook.assemble")}
                      <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </CardSlider>
      </div>
    </section>
  );
}
