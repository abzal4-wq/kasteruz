import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useBrands, isLightColor, type Brand } from "@/hooks/useBrands";
import { cn } from "@/lib/utils";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const SLIDE_MS = 6000;

// ─── Romb monogram — o'yma muhr (logo bo'lmasa) ──────────────
function DiamondMonogram({ letter, color }: { letter: string; color: string }) {
  return (
    <span
      className="relative flex h-14 w-14 rotate-45 items-center justify-center border sm:h-16 sm:w-16"
      style={{ borderColor: `${color}55` }}
    >
      <span className="absolute inset-[4px] border" style={{ borderColor: `${color}2e` }} />
      <span className="-rotate-45 font-serif text-2xl font-medium sm:text-3xl" style={{ color }}>
        {letter}
      </span>
    </span>
  );
}

function BrandMark({ brand }: { brand: Brand }) {
  if (brand.logo_url) {
    return (
      <img
        src={brand.logo_url}
        alt={brand.name}
        className="h-14 w-14 object-contain sm:h-16 sm:w-16"
        style={{ mixBlendMode: (brand.logo_blend_mode ?? "normal") as React.CSSProperties["mixBlendMode"] }}
      />
    );
  }
  return <DiamondMonogram letter={(brand.name || "K").charAt(0).toUpperCase()} color={brand.text_color} />;
}

// ═══ BRENDLAR REESTRI — héritage sahna-slayder ═══
// Har slayd: brend fonida titul sahna — ulkan fon monogrami,
// romb muhr, kinetik nom, progress chizig'i. Pastda Rim raqamli
// reestr-paginatsiya. Svayp + strelkalar + autoplay (hoverda pauza).
export function BrandCarousel() {
  const navigate = useNavigate();
  const { data: brands, isLoading } = useBrands(true);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);

  const count = brands?.length ?? 0;

  const go = useCallback(
    (idx: number) => {
      if (!count) return;
      setActive(((idx % count) + count) % count);
    },
    [count]
  );

  // Autoplay — hover/teginishda to'xtaydi
  useEffect(() => {
    if (!count || paused) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % count), SLIDE_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  if (isLoading || !brands?.length) {
    return (
      <div className="container-page">
        <div className="aspect-[16/8] animate-pulse bg-muted sm:aspect-[16/6]" />
      </div>
    );
  }

  const safeActive = Math.min(active, brands.length - 1);
  const brand = brands[safeActive];
  const tx = brand.text_color;
  const btnText = isLightColor(brand.accent_color) ? "#1A1A1A" : "#FFFFFF";

  return (
    <div className="container-page">
      {/* ── Sahna ─────────────────────────────────────────────── */}
      <div
        className="group/stage relative cursor-pointer select-none overflow-hidden transition-colors duration-700"
        style={{ background: brand.bg_color }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
          setPaused(true);
        }}
        onTouchEnd={(e) => {
          setPaused(false);
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 42) {
            swiped.current = true;
            go(safeActive + (dx < 0 ? 1 : -1));
          }
        }}
        onClick={() => {
          if (swiped.current) {
            swiped.current = false;
            return;
          }
          navigate(`/catalog?brand=${brand.id}`);
        }}
      >
        {/* Ichki ikki qavat hairline ramka */}
        <div className="pointer-events-none absolute inset-2.5 z-20 border sm:inset-4" style={{ borderColor: `${tx}2e` }} />
        <div className="pointer-events-none absolute inset-2.5 z-20 hidden border sm:block sm:inset-4" style={{ margin: 6, borderColor: `${tx}17` }} />

        {/* Ink pardasi — yorqin brend ranglarini maison palitrasiga moslab yumshatadi */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "rgba(20, 15, 11, 0.24)" }}
        />

        {/* Nozik urg'u nuri */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{ background: `radial-gradient(ellipse at 50% 40%, ${brand.accent_color}24 0%, transparent 62%)` }}
        />

        {/* Ulkan fon monogrami — suzuvchi soya harf */}
        <span
          key={`ghost-${brand.id}`}
          aria-hidden
          className="brand-ghost pointer-events-none absolute -right-4 -top-8 z-0 select-none font-serif italic leading-none sm:-right-8 sm:-top-14"
          style={{
            color: tx,
            opacity: 0.06,
            fontSize: "clamp(13rem, 38vw, 26rem)",
          }}
        >
          {(brand.name || "K").charAt(0).toUpperCase()}
        </span>

        {/* Yon vertikal yozuvlar (faqat keng ekran) */}
        <span
          className="pointer-events-none absolute left-8 top-1/2 z-10 hidden -translate-y-1/2 rotate-180 text-[0.52rem] uppercase tracking-[0.5em] lg:block"
          style={{ color: `${tx}59`, writingMode: "vertical-rl" }}
        >
          Hamkor uylar reestri
        </span>
        <span
          className="pointer-events-none absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 text-[0.52rem] uppercase tracking-[0.5em] lg:block"
          style={{ color: `${tx}59`, writingMode: "vertical-rl" }}
        >
          Est. MMXXIV · Toshkent
        </span>

        {/* ── Slayd mazmuni — har almashishda qayta jonlanadi ── */}
        <div
          key={brand.id}
          className="relative z-10 flex min-h-[300px] flex-col items-center justify-center px-8 py-12 text-center sm:min-h-[380px] lg:min-h-[430px]"
        >
          <div style={{ animation: "splashIconIn 0.8s cubic-bezier(0.22,1,0.36,1) both" }}>
            <BrandMark brand={brand} />
          </div>

          <p
            className="mt-5 flex items-center gap-2.5 text-[0.52rem] uppercase tracking-[0.34em] sm:mt-6 sm:text-[0.6rem]"
            style={{ color: brand.accent_color, animation: "splashFade 0.7s ease-out 0.15s both" }}
          >
            <span className="h-px w-6 sm:w-8" style={{ background: `${brand.accent_color}88` }} />
            Reestr · {ROMAN[safeActive] ?? safeActive + 1}
            <span className="h-px w-6 sm:w-8" style={{ background: `${brand.accent_color}88` }} />
          </p>

          <h3 className="mt-3 overflow-hidden sm:mt-4">
            <span
              className="block font-serif text-4xl font-medium tracking-[0.14em] sm:text-5xl lg:text-6xl"
              style={{ color: tx, animation: "kineticUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}
            >
              {brand.name}
            </span>
          </h3>

          {brand.tagline && (
            <p
              className="mt-2.5 font-serif text-sm italic sm:mt-3 sm:text-lg"
              style={{ color: `${tx}a6`, animation: "splashFade 0.8s ease-out 0.35s both" }}
            >
              {brand.tagline}
            </p>
          )}

          <button
            className="tap group/btn relative mt-6 inline-flex items-center gap-2.5 px-8 py-3 text-[0.56rem] font-semibold uppercase tracking-[0.22em] transition-transform hover:scale-[1.03] sm:mt-8 sm:px-10 sm:py-3.5 sm:text-[0.62rem]"
            style={{ background: brand.accent_color, color: btnText, animation: "splashFade 0.8s ease-out 0.5s both" }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/catalog?brand=${brand.id}`);
            }}
          >
            <span className="pointer-events-none absolute inset-1 border" style={{ borderColor: `${btnText}4d` }} />
            Mahsulotlarni ko'rish
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-1 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>

        {/* Strelkalar — hairline kvadratlar (desktop) */}
        <button
          aria-label="Oldingi"
          className="tap absolute left-6 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border transition-all hover:scale-105 sm:flex lg:left-9"
          style={{ borderColor: `${tx}40`, color: tx, background: `${tx}0d` }}
          onClick={(e) => { e.stopPropagation(); go(safeActive - 1); }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          aria-label="Keyingi"
          className="tap absolute right-6 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border transition-all hover:scale-105 sm:flex lg:right-9"
          style={{ borderColor: `${tx}40`, color: tx, background: `${tx}0d` }}
          onClick={(e) => { e.stopPropagation(); go(safeActive + 1); }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Autoplay progress — ramka ichida, pastda */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-20 sm:inset-x-4 sm:bottom-4">
          <div className="h-px w-full" style={{ background: `${tx}26` }}>
            <div
              key={`bar-${safeActive}-${paused}`}
              className="h-full origin-left"
              style={{
                background: brand.accent_color,
                animation: `splashBar ${SLIDE_MS}ms linear forwards`,
                animationPlayState: paused ? "paused" : "running",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Reestr-paginatsiya — Rim raqamli daftar qatori ────── */}
      <div className="frame-double mt-2.5 sm:mt-3">
        <div className="flex">
          {brands.map((b, i) => {
            const isActive = i === safeActive;
            return (
              <button
                key={b.id}
                onClick={() => go(i)}
                className={cn(
                  "tap relative flex flex-1 flex-col items-center gap-0.5 overflow-hidden px-2 py-2.5 transition-colors duration-300 sm:flex-row sm:justify-center sm:gap-2.5 sm:py-3.5",
                  i > 0 && "border-l border-charcoal/10",
                  isActive ? "bg-[rgb(var(--brand-500)/0.06)]" : "hover:bg-[rgb(var(--brand-500)/0.04)]"
                )}
              >
                {/* Faol brend — tepada o'z rangidagi chiziq */}
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-[2.5px] origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isActive ? "scale-x-100" : "scale-x-0"
                  )}
                  style={{ background: b.accent_color }}
                />
                <span
                  className={cn(
                    "font-serif text-[0.68rem] italic transition-colors duration-300 sm:text-xs",
                    isActive ? "text-gold" : "text-charcoal-300"
                  )}
                >
                  {ROMAN[i] ?? i + 1}
                </span>
                <span
                  className={cn(
                    "max-w-full truncate text-[0.5rem] uppercase tracking-[0.14em] transition-colors duration-300 sm:text-[0.62rem] sm:tracking-[0.2em]",
                    isActive ? "text-charcoal" : "text-charcoal-400"
                  )}
                >
                  {b.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
