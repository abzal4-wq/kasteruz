import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

// Uchqunlar (sparkle) joylashuvi — ikonka atrofida
const SPARKS = [
  { top: "8%", left: "18%", size: 10, delay: 0.5 },
  { top: "14%", left: "82%", size: 14, delay: 0.7 },
  { top: "60%", left: "8%", size: 12, delay: 0.9 },
  { top: "70%", left: "88%", size: 9, delay: 1.0 },
  { top: "30%", left: "92%", size: 8, delay: 1.2 },
  { top: "40%", left: "4%", size: 11, delay: 0.65 },
];

const LETTERS = "KASTER".split("");

// O'yin kabi kutib olish ekrani — ilk yuklanishda bir marta
export function SplashScreen() {
  const initialized = useAuthStore((s) => s.initialized);
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [forced, setForced] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeDone(true), 2600);
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
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden ${leaving ? "splash-out" : ""}`}
      style={{ background: "linear-gradient(165deg, var(--bg-deep) 0%, var(--bg-deep2) 100%)" }}
    >
      {/* Harakatlanuvchi fon nurlari */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(38rem 38rem at 20% 8%, rgb(var(--brand-400)/0.5), transparent 60%)," +
            "radial-gradient(42rem 42rem at 85% 92%, rgb(var(--brand-300)/0.45), transparent 60%)",
          animation: "splashFade 1s ease-out both",
        }}
      />
      {/* Vinetka */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 50% 42%, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />

      {/* Logo zonasi */}
      <div className="relative flex h-52 w-52 items-center justify-center">
        {/* Markaziy yorug'lik portlashi */}
        <div
          className="absolute h-40 w-40 rounded-full"
          style={{
            background: "radial-gradient(circle, rgb(var(--brand-300)/0.9), transparent 65%)",
            animation: "splashBurst 1.1s ease-out 0.15s both",
          }}
        />
        {/* Aylanuvchi konic shimmer */}
        <div
          className="absolute h-52 w-52 rounded-full opacity-50"
          style={{
            background: "conic-gradient(from 0deg, transparent, rgb(var(--brand-300)/0.65), transparent 38%)",
            animation: "splashSweep 2.6s linear infinite",
          }}
        />
        {/* Tarqaluvchi halqalar */}
        <span className="absolute h-36 w-36 rounded-full border border-gold/40" style={{ animation: "splashRing 2.3s ease-out infinite" }} />
        <span className="absolute h-36 w-36 rounded-full border border-gold/30" style={{ animation: "splashRing 2.3s ease-out 0.8s infinite" }} />

        {/* Uchqunlar */}
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="absolute text-gold"
            style={{ top: s.top, left: s.left, fontSize: s.size, animation: `splashSpark 1.6s ease-out ${s.delay}s infinite` }}
          >
            ✦
          </span>
        ))}

        {/* Kostyum ikonka + porlash */}
        <div
          className="relative h-36 w-36 overflow-hidden rounded-2xl shadow-float ring-1 ring-white/10"
          style={{ animation: "splashIconIn 1s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <img src="/icon-512.png" alt="Kaster" className="h-full w-full object-cover" />
          {/* Diagonal porlash (gloss) */}
          <div
            className="absolute inset-y-0 -left-1/2 w-1/2"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
              animation: "splashShine 1.8s ease-in-out 0.7s both",
            }}
          />
        </div>
      </div>

      {/* Brend nomi — harfma-harf */}
      <div className="mt-10 flex">
        {LETTERS.map((ch, i) => (
          <span
            key={i}
            className="font-serif text-4xl font-light text-cream"
            style={{
              letterSpacing: "0.08em",
              animation: `splashLetterPop 0.6s cubic-bezier(0.22,1,0.36,1) ${0.7 + i * 0.08}s both`,
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* Oltin chiziq (underline) */}
      <div
        className="mt-3 h-[2px] w-28 origin-center rounded-full bg-gold"
        style={{ animation: "splashUnderline 0.7s cubic-bezier(0.22,1,0.36,1) 1.25s both" }}
      />

      <p
        className="mt-3 text-[0.6rem] uppercase tracking-[0.45em] text-gold"
        style={{ animation: "splashFade 0.7s ease-out 1.5s both" }}
      >
        Menswear · Toshkent
      </p>

      {/* Pastki progress chizig'i */}
      <div className="absolute bottom-16 h-0.5 w-44 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full w-full origin-left rounded-full bg-gold"
          style={{ animation: "splashBar 2.5s cubic-bezier(0.5,0,0.2,1) forwards" }}
        />
      </div>

      {/* Chiqishdagi yorug'lik chaqnashi */}
      {leaving && (
        <div className="pointer-events-none absolute inset-0 bg-gold" style={{ animation: "splashFlash 0.6s ease-out both" }} />
      )}
    </div>
  );
}
