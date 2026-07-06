import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useLang } from "@/hooks/useLang";
import { useSiteSettings, SITE_DEFAULTS, type SectionId } from "@/hooks/useSiteSettings";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { BrandCarousel } from "@/components/brand/BrandCarousel";
import { CardSlider } from "@/components/storefront/CardSlider";
import { Reveal } from "@/components/app/Reveal";
import { KasterStandard, BrandStory, CustomerReviews, Newsletter, SectionLabel } from "@/components/storefront/HomeSections";
import { getStorageUrl } from "@/lib/utils";

export default function HomePage() {
  const { t } = useTranslation();
  const { pick } = useLang();
  const { data: featured, isLoading } = useProducts({ featuredOnly: true });
  const { data: categories } = useCategories();
  const { data: site } = useSiteSettings();
  const cfg = site ?? SITE_DEFAULTS;

  // ─── Bo'limlar (admin tartibi/ko'rinishi uchun registry) ───
  const featuredSection = (
    <section className="container-page py-14 lg:py-24">
      <Reveal>
        <div className="mb-7 flex items-end justify-between">
          <div>
            <SectionLabel>01 / Tanlangan</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-light text-charcoal sm:text-4xl lg:text-5xl">
              Tavsiya <em className="italic text-gold">etilgan</em>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Mavsumning eng nafis va talabgir kostyumlari — tanlab olindi.
            </p>
          </div>
          <Link to="/catalog" className="group hidden items-center gap-2 text-xs uppercase tracking-[0.18em] text-charcoal hover:text-gold sm:flex">
            Barchasi
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
      </Reveal>

      <div className="mb-9 h-px w-full bg-gradient-to-r from-gold/45 via-gold/15 to-transparent" />

      {isLoading ? (
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[64vw] flex-shrink-0 sm:w-[290px]"><ProductCardSkeleton /></div>
          ))}
        </div>
      ) : featured && featured.length > 0 ? (
        <CardSlider>
          {featured.slice(0, 10).map((p) => (
            <div key={p.id} className="w-[64vw] flex-shrink-0 snap-start sm:w-[290px] lg:w-[300px]">
              <ProductCard product={p} />
            </div>
          ))}
        </CardSlider>
      ) : (
        <p className="py-12 text-center text-muted-foreground">{t("common.noResults")}</p>
      )}
    </section>
  );

  const categoriesSection = (
    <section className="container-page py-14 lg:py-20">
      <Reveal>
        <SectionLabel>02 / Kategoriyalar</SectionLabel>
        <h2 className="mt-3 font-serif text-3xl font-light text-charcoal sm:text-4xl lg:text-5xl">Kolleksiyalar</h2>
      </Reveal>

      <CardSlider className="mt-8 lg:mt-10">
        {categories?.map((cat, i) => (
          <div key={cat.id} className="w-[68vw] flex-shrink-0 snap-start sm:w-[300px] lg:w-[300px]">
            <Link
              to={`/catalog/${cat.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-[0.6rem] bg-white/5 shadow-glass-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-float"
            >
              {cat.image_url && (
                <img
                  src={getStorageUrl(cat.image_url)!}
                  alt={pick(cat, "name")}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="pointer-events-none absolute inset-0 -translate-x-[130%] skew-x-[20deg] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-[130%]" />
              <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
                <span className="font-serif text-xs italic text-gold/80">0{i + 1}</span>
                <h3 className="mt-1 font-serif text-xl font-light text-cream transition-transform duration-500 group-hover:-translate-y-0.5 lg:text-2xl">
                  {pick(cat, "name")}
                </h3>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-cream/70 transition-colors group-hover:text-gold">
                  Ko'rish
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </div>
        ))}
      </CardSlider>
    </section>
  );

  const brandsSection = (
    <section className="py-14 lg:py-20">
      <Reveal className="container-page mb-7 lg:mb-10">
        <SectionLabel>03 / Brendlar</SectionLabel>
        <h2 className="mt-3 font-serif text-3xl font-light text-charcoal sm:text-4xl lg:text-5xl">Brendlar</h2>
      </Reveal>
      <BrandCarousel />
    </section>
  );

  const registry: Record<SectionId, JSX.Element> = {
    featured: featuredSection,
    standard: <KasterStandard />,
    categories: categoriesSection,
    story: <BrandStory />,
    brands: brandsSection,
    reviews: <CustomerReviews />,
    newsletter: <Newsletter />,
  };

  const heroTitle = [cfg.heroTitle1, cfg.heroTitle2];

  return (
    <div className="overflow-hidden">
      {/* ════════ HERO — kino sahna, fonda kostyumdagi model ════════ */}
      <section
        className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden"
        style={{ backgroundColor: "#0c0a07" }}
      >
        <img
          src={cfg.heroImage}
          alt="Kaster — premium kostyum"
          loading="eager"
          decoding="async"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[72%_center] sm:object-center"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(105deg, rgba(8,7,5,0.92) 0%, rgba(8,7,5,0.55) 46%, rgba(8,7,5,0.12) 100%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(8,7,5,0.9) 0%, transparent 52%)" }}
        />

        <div className="container-page relative z-10 pt-24">
          <p
            className="flex items-center gap-3 font-sans text-[0.7rem] uppercase tracking-[0.4em] text-gold"
            style={{ animation: "splashFade 0.8s ease-out 0.1s both" }}
          >
            <span className="h-px w-10 bg-gold" />
            Premium Menswear · Toshkent
          </p>

          <h1 className="mt-6 font-serif font-light leading-[0.92] text-cream">
            {heroTitle.map((word, i) => (
              <span key={i} className="block overflow-hidden">
                <span
                  className="inline-block text-[13vw] sm:text-[11vw] lg:text-[7.5rem]"
                  style={{ animation: `kineticUp 0.9s cubic-bezier(0.22,1,0.36,1) ${0.2 + i * 0.18}s both` }}
                >
                  {i === 1 ? <em className="italic text-gold">{word}</em> : word}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="mt-7 max-w-md font-sans text-base leading-relaxed text-cream/55"
            style={{ animation: "splashFade 0.9s ease-out 0.5s both" }}
          >
            {cfg.heroSubtitle}
          </p>

          <div
            className="mt-8 flex flex-wrap items-center gap-3"
            style={{ animation: "splashFade 0.9s ease-out 0.65s both" }}
          >
            <Link
              to="/catalog"
              className="tap group inline-flex items-center gap-2.5 rounded-md bg-gold px-8 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_40px_-12px_rgb(var(--brand-500))] transition-transform hover:scale-[1.02] sm:px-10 sm:text-xs"
            >
              Kolleksiya
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/catalog"
              className="tap inline-flex items-center rounded-md border border-cream/30 px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-cream transition-colors hover:border-cream/70 sm:px-10 sm:text-xs"
            >
              Brendlar
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-9 z-10">
          <div className="container-page">
            <div
              className="h-px w-full"
              style={{ background: "linear-gradient(90deg, rgb(var(--brand-400)/0.55), transparent)" }}
            />
            <div className="flex flex-wrap items-center gap-x-10 gap-y-3 pt-6">
              {cfg.heroStats.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-serif text-xl font-light text-gold">{s.val}</span>
                  <span className="text-[0.7rem] uppercase tracking-wider text-cream/55">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Bo'limlar — admin belgilagan tartib + ko'rinish ════════ */}
      {cfg.sections
        .filter((s) => s.visible)
        .map((s) => (
          <Fragment key={s.id}>{registry[s.id]}</Fragment>
        ))}
    </div>
  );
}
