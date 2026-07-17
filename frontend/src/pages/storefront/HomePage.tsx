import { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useLang } from "@/hooks/useLang";
import { useSiteSettings, SITE_DEFAULTS, type SectionId } from "@/hooks/useSiteSettings";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { BrandCarousel } from "@/components/brand/BrandCarousel";
import { LogoCrest } from "@/components/brand/Logo";
import { CardSlider } from "@/components/storefront/CardSlider";
import { Reveal } from "@/components/app/Reveal";
import { KasterStandard, BrandStory, CustomerReviews, Newsletter, SectionHeading } from "@/components/storefront/HomeSections";
import { LookBook } from "@/components/storefront/LookBook";
import { getStorageUrl, cn } from "@/lib/utils";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// ─── Aylanuvchi maison muhri (seal) ──────────────────────────
function HeritageSeal({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative h-full w-full">
        <div className="seal-spin absolute inset-0">
          <svg viewBox="0 0 120 120" className="h-full w-full text-charcoal">
            <defs>
              <path id="sealTextPath" d="M 60,60 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0" />
            </defs>
            <circle cx="60" cy="60" r="59" style={{ fill: "var(--bg-deep)" }} stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
            <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.7" />
            <text fontSize="9" fontWeight="500" letterSpacing="2.6" fill="currentColor" fillOpacity="0.8" style={{ fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}>
              <textPath href="#sealTextPath">
                Kaster Sartoria · Est. MMXXIV · Toshkent ·
              </textPath>
            </text>
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <LogoCrest size={30} className="text-gold" />
        </div>
      </div>
    </div>
  );
}

// ─── Siyoh lenta (marquee) — sartorial so'zlar ───────────────
// Sartoria / Bespoke / Su Misura — brend terminlari, tarjima qilinmaydi
const MARQUEE_ITEMS: { labelKey?: string; label?: string }[] = [
  { labelKey: "home.marqueeSuit" },
  { labelKey: "home.marqueePants" },
  { label: "Sartoria" },
  { label: "Bespoke" },
  { label: "Su Misura" },
  { labelKey: "home.marqueeTashkent" },
];

function InkMarquee() {
  const { t } = useTranslation();
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="scene-dark relative overflow-hidden py-3 sm:py-5 lg:py-6">
      <div className="pointer-events-none absolute inset-x-0 top-2 stitch-h opacity-40" style={{ backgroundImage: "linear-gradient(90deg, rgba(250,248,244,0.5) 42%, transparent 42%)" }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-2 stitch-h opacity-40" style={{ backgroundImage: "linear-gradient(90deg, rgba(250,248,244,0.5) 42%, transparent 42%)" }} />
      <div className="marquee-track flex w-max items-center whitespace-nowrap">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center">
            {row.map((w, i) => (
              <span key={`${half}-${i}`} className="flex items-center">
                <span className="px-4 font-serif text-base font-light italic text-cream/85 sm:px-6 sm:text-2xl lg:px-9 lg:text-3xl">
                  {w.labelKey ? t(w.labelKey) : w.label}
                </span>
                <span className="text-[0.55rem] text-gold">◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const { pick, lang } = useLang();
  const { data: featured, isLoading } = useProducts({ featuredOnly: true });
  const { data: categories } = useCategories();
  const { data: allProducts } = useProducts();
  const { data: site } = useSiteSettings();
  const cfg = site ?? SITE_DEFAULTS;

  // RU rejimda ruscha hero matnlari (bo'sh bo'lsa — uz)
  const heroTitle1 = lang === "ru" && cfg.heroTitle1Ru ? cfg.heroTitle1Ru : cfg.heroTitle1;
  const heroTitle2 = lang === "ru" && cfg.heroTitle2Ru ? cfg.heroTitle2Ru : cfg.heroTitle2;
  const heroSubtitle = lang === "ru" && cfg.heroSubtitleRu ? cfg.heroSubtitleRu : cfg.heroSubtitle;
  const statLabel = (s: { label: string; label_ru?: string }) =>
    lang === "ru" && s.label_ru ? s.label_ru : s.label;

  // Har kategoriyadagi buyumlar soni (ark kartalarda ko'rsatiladi)
  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of allProducts ?? []) {
      const slug = p.category?.slug;
      if (slug) m.set(slug, (m.get(slug) ?? 0) + 1);
    }
    return m;
  }, [allProducts]);

  // ─── Bo'limlar (admin tartibi/ko'rinishi uchun registry) ───
  const featuredSection = (
    <section className="container-page py-8 sm:py-14 lg:py-24">
      <Reveal>
        <SectionHeading
          numeral="I"
          eyebrow={t("home.featuredEyebrow")}
          title={<>{t("home.featuredTitleLead")} <em className="italic text-gold">{t("home.featuredTitleAccent")}</em></>}
          sub={t("home.featuredSub")}
          more={{ to: "/catalog", label: t("home.viewAll") }}
        />
      </Reveal>

      {isLoading ? (
        <div className="mt-6 flex gap-5 overflow-hidden sm:mt-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[52vw] flex-shrink-0 sm:w-[290px]"><ProductCardSkeleton /></div>
          ))}
        </div>
      ) : featured && featured.length > 0 ? (
        <CardSlider className="mt-6 sm:mt-10">
          {featured.slice(0, 10).map((p, i) => (
            <div key={p.id} className="w-[52vw] flex-shrink-0 snap-start sm:w-[290px] lg:w-[300px]">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </CardSlider>
      ) : (
        <p className="py-12 text-center text-muted-foreground">{t("common.noResults")}</p>
      )}
    </section>
  );

  const categoriesSection = (
    <section className="container-page py-8 sm:py-14 lg:py-20">
      <Reveal>
        <SectionHeading
          numeral="II"
          eyebrow={t("home.categoriesEyebrow")}
          title={<>{t("home.categoriesTitleLead")} <em className="italic text-gold">{t("home.categoriesTitleAccent")}</em></>}
        />
      </Reveal>

      <CardSlider className="mt-6 pt-4 sm:mt-10">
        {categories?.map((cat, i) => {
          const count = catCounts.get(cat.slug) ?? 0;
          return (
            <div
              key={cat.id}
              className={cn("w-[52vw] flex-shrink-0 snap-start sm:w-[300px]", i % 2 === 1 && "lg:mt-10")}
            >
              <Link to={`/catalog/${cat.slug}`} className="group block">
                {/* Ark oyna — o'yma ramka + toshtosh (keystone) olmosi */}
                <div className="relative">
                  <div className="pointer-events-none absolute -inset-2 rounded-t-[999px] border border-charcoal/20 transition-colors duration-500 group-hover:border-gold/70" />
                  <span className="pointer-events-none absolute -top-[15px] left-1/2 -translate-x-1/2 text-[0.55rem] text-gold transition-transform duration-700 group-hover:rotate-180">
                    ◆
                  </span>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] bg-charcoal/5">
                    {cat.image_url && (
                      <img
                        src={getStorageUrl(cat.image_url)!}
                        alt={pick(cat, "name")}
                        className="absolute inset-0 h-full w-full object-cover grayscale-[0.35] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07] group-hover:grayscale-0"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />

                    {/* Osilgan "Bob" tegi — tikuvchi yorlig'i */}
                    <div className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 flex-col items-center">
                      <span className="h-4 w-px bg-cream/50 sm:h-5" />
                      <span className="border border-cream/40 bg-black/35 px-2 py-0.5 font-serif text-[0.6rem] italic text-cream backdrop-blur-sm transition-colors duration-500 group-hover:border-gold/70 sm:px-2.5 sm:text-[0.68rem]">
                        {t("home.chapter")} {ROMAN[i] ?? i + 1}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 text-center sm:p-6">
                      <h3 className="font-serif text-lg font-medium text-cream transition-transform duration-500 group-hover:-translate-y-0.5 sm:text-2xl lg:text-[1.7rem]">
                        {pick(cat, "name")}
                      </h3>
                      <div className="mt-1.5 flex items-center justify-center gap-2 sm:mt-2">
                        <span className="h-px w-4 bg-gold/70 transition-all duration-500 group-hover:w-7 sm:w-5" />
                        <span className="text-[0.5rem] text-gold">◆</span>
                        <span className="h-px w-4 bg-gold/70 transition-all duration-500 group-hover:w-7 sm:w-5" />
                      </div>
                      {count > 0 && (
                        <p className="mt-1.5 text-[0.52rem] uppercase tracking-[0.26em] text-cream/70 sm:text-[0.58rem]">
                          {count} {t("home.items")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* "{t("home.openChapter")}" — o'suvchi ostki chiziq bilan */}
                <div className="mt-3 flex justify-center sm:mt-4">
                  <span className="relative inline-flex items-center gap-2 pb-1 text-[0.56rem] uppercase tracking-[0.24em] text-charcoal-400 transition-colors group-hover:text-gold sm:text-[0.6rem] sm:tracking-[0.28em]">
                    {t("home.openChapter")}
                    <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gold transition-all duration-500 group-hover:w-full" />
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </CardSlider>
    </section>
  );

  const brandsSection = (
    <section className="py-8 sm:py-14 lg:py-20">
      <Reveal className="container-page">
        <SectionHeading
          numeral="III"
          eyebrow={t("home.brandsEyebrow")}
          title={<>{t("home.brandsTitleLead")} <em className="italic text-gold">{t("home.brandsTitleAccent")}</em></>}
        />
      </Reveal>
      <div className="mt-6 sm:mt-8 lg:mt-10">
        <BrandCarousel />
      </div>
    </section>
  );

  const registry: Record<SectionId, JSX.Element> = {
    featured: featuredSection,
    looks: <LookBook />,
    standard: <KasterStandard />,
    categories: categoriesSection,
    story: <BrandStory />,
    brands: brandsSection,
    reviews: <CustomerReviews />,
    newsletter: <Newsletter />,
  };

  return (
    <div className="overflow-hidden">
      {/* ════════ HERO — "titul varaq": qog'oz, o'yma ramka, ark surat ════════ */}
      <section className="relative">
        {/* Sahifa ramkasi — ikki qavat hairline (kitob muqovasi) */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 top-1 z-20 border border-charcoal/25 sm:inset-x-5 sm:bottom-5" style={{ animation: "splashFade 1.2s ease-out 0.1s both" }} />
        <div className="pointer-events-none absolute inset-x-[19px] bottom-[19px] top-2 z-20 hidden border border-charcoal/10 sm:block" style={{ animation: "splashFade 1.2s ease-out 0.25s both" }} />
        {/* Burchak belgilari (+) — bichuvchi chizmasi */}
        <span className="corner-mark left-[13px] top-[3px] z-20 sm:left-[21px]" style={{ transform: "translate(-50%,-50%)" }} />
        <span className="corner-mark right-[13px] top-[3px] z-20 sm:right-[21px]" style={{ transform: "translate(50%,-50%)" }} />
        <span className="corner-mark bottom-[3px] left-[13px] z-20 sm:bottom-[11px] sm:left-[21px]" style={{ transform: "translate(-50%,50%)" }} />
        <span className="corner-mark bottom-[3px] right-[13px] z-20 sm:bottom-[11px] sm:right-[21px]" style={{ transform: "translate(50%,50%)" }} />

        {/* Yon relslar — vertikal smallcaps (faqat keng ekran) */}
        <div className="pointer-events-none absolute left-9 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
          <span className="block rotate-180 text-[0.58rem] uppercase tracking-[0.5em] text-charcoal-300" style={{ writingMode: "vertical-rl" }}>
            Est. MMXXIV — Toshkent
          </span>
        </div>
        <div className="pointer-events-none absolute right-9 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
          <span className="block text-[0.58rem] uppercase tracking-[0.5em] text-charcoal-300" style={{ writingMode: "vertical-rl" }}>
            Su Misura — Bespoke
          </span>
        </div>

        <div className="container-page relative z-10 px-6 pb-8 pt-5 sm:px-12 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-14 xl:px-16">
          <div className="grid items-center gap-7 lg:grid-cols-[1.05fr_0.9fr] lg:gap-14">
            {/* Chap — titul matni */}
            <div className="text-center lg:text-left">
              <p
                className="flex items-center justify-center gap-2.5 text-[0.56rem] uppercase tracking-[0.32em] text-gold sm:gap-3 sm:text-[0.62rem] sm:tracking-[0.4em] lg:justify-start"
                style={{ animation: "splashFade 0.8s ease-out 0.2s both" }}
              >
                <span className="hidden h-px w-9 bg-gold/60 sm:block" />
                <span className="text-[0.5rem]">◆</span>
                {t("home.heroEyebrow")}
                <span className="text-[0.5rem]">◆</span>
                <span className="hidden h-px w-9 bg-gold/60 sm:block" />
              </p>

              <h1 className="mt-4 font-serif font-medium leading-[0.98] text-charcoal sm:mt-6">
                <span className="block overflow-hidden">
                  <span
                    className="inline-block text-[12vw] sm:text-[12vw] lg:text-[6.8rem] xl:text-[7.6rem]"
                    style={{ animation: "kineticUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s both" }}
                  >
                    {heroTitle1}
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span
                    className="inline-block pr-2 text-[12vw] font-light italic text-gold sm:text-[12vw] lg:text-[6.8rem] xl:text-[7.6rem]"
                    style={{ animation: "kineticUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.48s both" }}
                  >
                    {heroTitle2}
                  </span>
                </span>
              </h1>

              <p
                className="mx-auto mt-4 max-w-md font-serif text-[0.95rem] font-light italic leading-relaxed text-charcoal-500 sm:mt-6 sm:text-lg lg:mx-0 lg:text-xl"
                style={{ animation: "splashFade 0.9s ease-out 0.62s both" }}
              >
                {heroSubtitle}
              </p>

              <div
                className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-9 sm:flex sm:flex-row sm:items-center sm:justify-center sm:gap-3 lg:justify-start"
                style={{ animation: "splashFade 0.9s ease-out 0.75s both" }}
              >
                <Link
                  to="/catalog"
                  className="btn-press tap group px-2 py-3 text-[0.56rem] font-semibold uppercase tracking-[0.16em] sm:px-11 sm:py-4 sm:text-[0.66rem] sm:tracking-[0.24em]"
                >
                  {t("home.heroCta")}
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1 sm:h-3.5 sm:w-3.5" />
                </Link>
                <Link
                  to="/about"
                  className="btn-hairline tap px-2 py-3 text-[0.56rem] font-medium uppercase tracking-[0.16em] sm:px-11 sm:py-4 sm:text-[0.66rem] sm:tracking-[0.24em]"
                >
                  {t("footer.aboutMaison")}
                </Link>
              </div>

              {/* Reestr — statistika Rim raqamlari bilan */}
              <div className="mt-7 sm:mt-12 lg:mt-14" style={{ animation: "splashFade 1s ease-out 0.9s both" }}>
                <div className="stitch-h" />
                <div className="mt-4 grid grid-cols-3 gap-2.5 sm:mt-6 sm:gap-4">
                  {cfg.heroStats.slice(0, 3).map((s, i) => (
                    <div key={i} className="text-center lg:text-left">
                      <div className="font-serif text-xs italic text-gold">{ROMAN[i]}</div>
                      <div className="mt-1 font-serif text-lg font-medium text-charcoal sm:text-xl lg:text-2xl">{s.val}</div>
                      <div className="mt-0.5 text-[0.54rem] uppercase tracking-[0.18em] text-charcoal-400 sm:text-[0.56rem] sm:tracking-[0.2em]">{statLabel(s)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* O'ng — ark oyna surat + muhr */}
            <div className="relative mx-auto w-full max-w-[16rem] sm:max-w-[26rem] lg:max-w-none" style={{ animation: "splashFade 1.1s ease-out 0.5s both" }}>
              {/* Orqa ark hairline — surilgan soya-ramka */}
              <div className="pointer-events-none absolute -inset-x-3 -top-3 bottom-3 rounded-t-[999px] border border-charcoal/20" />
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] bg-charcoal/5">
                <img
                  src={cfg.heroImage}
                  alt={t("home.heroAlt")}
                  loading="eager"
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  className="h-full w-full select-none object-cover object-top"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>
              {/* Muhr — arkning chap pastki chetida */}
              <HeritageSeal className="absolute -left-4 bottom-6 h-16 w-16 drop-shadow-lg sm:-left-8 sm:bottom-10 sm:h-28 sm:w-28 lg:-left-12" />
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Siyoh lenta ════════ */}
      <InkMarquee />

      {/* ════════ Bo'limlar — admin belgilagan tartib + ko'rinish ════════ */}
      {cfg.sections
        .filter((s) => s.visible)
        .map((s) => (
          <Fragment key={s.id}>{registry[s.id]}</Fragment>
        ))}
    </div>
  );
}
