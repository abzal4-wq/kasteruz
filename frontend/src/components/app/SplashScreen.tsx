import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { LogoCrest } from "@/components/brand/Logo";

const LETTERS = "KASTER".split("");

// Maison kutib olish ekrani — titul varaq uslubida, ilk yuklanishda bir marta
export function SplashScreen() {
  const initialized = useAuthStore((s) => s.initialized);
  // Splash .app-dark tashqarisida — dark rejimda matnni yorug'ga o'girish uchun
  const bgMode = useThemeStore((s) => s.bgMode);
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [forced, setForced] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeDone(true), 2400);
    // Xavfsizlik klapani: auth init osilib qolsa ham splash ~5s da albatta ketadi
    // (aks holda u butun saytni abadiy bloklab qo'yardi).
    const hard = setTimeout(() => setForced(true), 5000);
    return () => { clearTimeout(t); clearTimeout(hard); };
  }, []);

  useEffect(() => {
    if (((initialized && minTimeDone) || forced) && !leaving) {
      setLeaving(true);
      const t = setTimeout(() => setGone(true), 600);
      return () => clearTimeout(t);
    }
  }, [initialized, minTimeDone, forced, leaving]);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden ${bgMode === "dark" ? "nav-over-hero" : ""} ${leaving ? "splash-out" : ""}`}
      style={{ background: "linear-gradient(170deg, var(--bg-deep) 0%, var(--bg-deep2) 100%)" }}
    >
      {/* Titul varaq ramkasi — ikki qavat hairline */}
      <div
        className="pointer-events-none absolute inset-4 border border-charcoal/25 sm:inset-6"
        style={{ animation: "splashFade 0.9s ease-out 0.15s both" }}
      />
      <div
        className="pointer-events-none absolute inset-4 border border-charcoal/10 sm:inset-6"
        style={{ margin: 7, animation: "splashFade 0.9s ease-out 0.3s both" }}
      />

      {/* Gerb zonasi — aylanuvchi muhr halqasi ichida */}
      <div className="relative flex h-48 w-48 items-center justify-center">
        {/* Aylanuvchi nuqta-halqa (tikuv motifi) */}
        <div className="seal-spin absolute inset-0">
          <svg viewBox="0 0 100 100" className="h-full w-full text-charcoal">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" strokeDasharray="3 4" />
          </svg>
        </div>
        {/* Ichki statik halqa */}
        <span className="absolute inset-5 rounded-full border border-charcoal/15" style={{ animation: "splashFade 1s ease-out 0.4s both" }} />
        {/* Tarqaluvchi halqa */}
        <span className="absolute h-36 w-36 rounded-full border border-gold/30" style={{ animation: "splashRing 2.6s ease-out 1s infinite" }} />

        {/* Gerb */}
        <div style={{ animation: "splashIconIn 1s cubic-bezier(0.22,1,0.36,1) 0.2s both" }}>
          <LogoCrest size={86} className="text-gold" />
        </div>
      </div>

      {/* Brend nomi — harfma-harf, o'yma serif */}
      <div className="mt-9 flex">
        {LETTERS.map((ch, i) => (
          <span
            key={i}
            className="font-display text-3xl font-semibold text-charcoal sm:text-4xl"
            style={{
              letterSpacing: "0.24em",
              marginRight: i === LETTERS.length - 1 ? "-0.24em" : 0,
              animation: `splashLetterPop 0.6s cubic-bezier(0.22,1,0.36,1) ${0.6 + i * 0.09}s both`,
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* Ornament chiziq */}
      <div
        className="mt-4 flex items-center gap-2.5"
        style={{ animation: "splashUnderline 0.7s cubic-bezier(0.22,1,0.36,1) 1.3s both" }}
      >
        <span className="h-px w-10 bg-gold/60" />
        <span className="text-[0.5rem] text-gold">◆</span>
        <span className="h-px w-10 bg-gold/60" />
      </div>

      <p
        className="mt-4 text-[0.6rem] uppercase tracking-[0.45em] text-gold"
        style={{ animation: "splashFade 0.7s ease-out 1.5s both" }}
      >
        Sartoria · Toshkent
      </p>
      <p
        className="mt-2 font-serif text-xs italic text-charcoal-400"
        style={{ animation: "splashFade 0.7s ease-out 1.7s both" }}
      >
        Est. MMXXIV
      </p>

      {/* Pastki progress chizig'i — hairline */}
      <div className="absolute bottom-14 h-px w-44 overflow-hidden bg-charcoal/15">
        <div
          className="h-full w-full origin-left bg-gold"
          style={{ animation: "splashBar 2.4s cubic-bezier(0.5,0,0.2,1) forwards" }}
        />
      </div>
    </div>
  );
}
