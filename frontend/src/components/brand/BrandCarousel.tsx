import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBrands, isLightColor, type Brand } from "@/hooks/useBrands";

// ─── Fallback (logo_url bo'lmasa) — elegant serif monogram ───
function Monogram({ letter, color, small = false }: { letter: string; color: string; small?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span
        className="font-serif font-medium"
        style={{ color, lineHeight: 1, fontSize: small ? "0.95rem" : "clamp(2.75rem, 7vw, 4.25rem)" }}
      >
        {letter}
      </span>
    </div>
  );
}

function BrandLogo({ brand, color, small = false }: { brand: Brand; color: string; small?: boolean }) {
  if (brand.logo_url) {
    return (
      <img
        src={brand.logo_url}
        alt={brand.name}
        className="h-full w-full object-contain"
        style={{
          mixBlendMode: (brand.logo_blend_mode ?? "normal") as React.CSSProperties["mixBlendMode"],
          filter: small ? "none" : "drop-shadow(0 2px 12px rgba(0,0,0,0.15))",
        }}
      />
    );
  }
  return <Monogram letter={(brand.name || "K").charAt(0).toUpperCase()} color={color} small={small} />;
}

// ═══ BRENDLAR — ixcham, nafis slayd-shou ══════════════════════
export function BrandCarousel() {
  const navigate = useNavigate();
  const { data: brands, isLoading } = useBrands(true);
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const count = brands?.length ?? 0;

  const go = useCallback((idx: number) => {
    setActive(idx);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % (brands?.length ?? 1));
    }, 5000);
  }, [brands]);

  useEffect(() => {
    if (!count) return;
    timerRef.current = setInterval(() => setActive((a) => (a + 1) % count), 5000);
    return () => clearInterval(timerRef.current);
  }, [count]);

  if (isLoading || !brands?.length) {
    return (
      <div className="container-page">
        <div className="aspect-[16/7] animate-pulse rounded-ios-lg bg-muted" />
      </div>
    );
  }

  const safeActive = Math.min(active, brands.length - 1);
  const brand = brands[safeActive];
  const muted = brand.text_color + "85";
  const btnText = isLightColor(brand.accent_color) ? "#1A1A1A" : "#FFFFFF";

  return (
    <div className="container-page">
      <div className="overflow-hidden rounded-ios-lg shadow-float">
        {/* ── Asosiy slayd (ixcham) ─────────────────────────────── */}
        <div
          className="relative flex cursor-pointer select-none flex-col items-center justify-center
                     h-[38vh] min-h-[260px] lg:h-[44vh] lg:min-h-[380px] transition-colors duration-700"
          style={{ background: brand.bg_color }}
          onClick={() => navigate(`/catalog?brand=${brand.id}`)}
        >
          {/* Nozik urg'u nuri */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 50% 42%, ${brand.accent_color}1f 0%, transparent 62%)` }}
          />

          {/* Logo / monogram */}
          <div
            className="relative z-10 transition-all duration-500"
            style={{ width: "clamp(72px, 12vw, 120px)", height: "clamp(72px, 12vw, 120px)" }}
          >
            <BrandLogo brand={brand} color={brand.text_color} />
          </div>

          {/* Matn */}
          <div className="relative z-10 mt-4 px-4 text-center lg:mt-6">
            <h3
              className="font-serif font-medium tracking-[0.22em] text-2xl sm:text-3xl lg:text-4xl"
              style={{ color: brand.text_color }}
            >
              {brand.name}
            </h3>
            {brand.tagline && (
              <p
                className="mt-2 text-[0.58rem] uppercase tracking-[0.28em] sm:text-[0.7rem]"
                style={{ color: muted }}
              >
                {brand.tagline}
              </p>
            )}
            <button
              className="mt-5 rounded-md text-[0.58rem] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-80 active:scale-95
                         px-8 py-3 sm:text-[0.62rem] lg:mt-6"
              style={{ background: brand.accent_color, color: btnText }}
              onClick={(e) => { e.stopPropagation(); navigate(`/catalog?brand=${brand.id}`); }}
            >
              Mahsulotlarni ko'rish
            </button>
          </div>

          {/* Prev / Next */}
          <button
            aria-label="Oldingi"
            className="tap absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:scale-105 lg:left-5 lg:h-10 lg:w-10"
            style={{ background: `${brand.text_color}14`, border: `1px solid ${brand.text_color}22`, color: brand.text_color }}
            onClick={(e) => { e.stopPropagation(); go((safeActive - 1 + brands.length) % brands.length); }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Keyingi"
            className="tap absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:scale-105 lg:right-5 lg:h-10 lg:w-10"
            style={{ background: `${brand.text_color}14`, border: `1px solid ${brand.text_color}22`, color: brand.text_color }}
            onClick={(e) => { e.stopPropagation(); go((safeActive + 1) % brands.length); }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Nuqtalar */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {brands.map((_, i) => (
              <button
                key={i}
                aria-label={`Slayd ${i + 1}`}
                onClick={(e) => { e.stopPropagation(); go(i); }}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === safeActive ? "22px" : "6px",
                  background: i === safeActive ? brand.text_color : `${brand.text_color}40`,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Thumbnail lentasi ─────────────────────────────────── */}
        <div className="flex bg-[#0d0d0d]">
          {brands.map((b, i) => (
            <button
              key={b.id}
              onClick={() => go(i)}
              className={`tap flex flex-1 items-center justify-center gap-2 py-3 transition-all duration-300 ${
                i === safeActive ? "opacity-100" : "opacity-35 hover:opacity-70"
              }`}
              style={{ borderTop: i === safeActive ? `2px solid ${b.accent_color}` : "2px solid transparent" }}
            >
              <div className="h-5 w-5 flex-shrink-0 lg:h-6 lg:w-6">
                <BrandLogo brand={b} color={i === safeActive ? b.accent_color : "#777"} small />
              </div>
              <span
                className="hidden font-serif text-[0.62rem] uppercase tracking-[0.16em] sm:block lg:text-[0.68rem]"
                style={{ color: i === safeActive ? b.accent_color : "#666" }}
              >
                {b.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
