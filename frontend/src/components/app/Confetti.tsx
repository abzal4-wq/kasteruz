import { useMemo } from "react";

// Xarid muvaffaqiyatli bo'lganda bir martalik konfetti yomg'iri.
// Hech qanday tashqi paketsiz — sof CSS animatsiya.
const COLORS = ["#B08D57", "#E8C88A", "#D4AF37", "#F5E6C8", "#9A7B3F", "#ffffff"];

export function Confetti({ count = 80 }: { count?: number }) {
  // Har bir bo'lakcha uchun tasodifiy parametrlarni bir marta hisoblaymiz
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100, // %
        cx: `${(Math.random() - 0.5) * 30}vw`, // yon siljish
        cr: `${Math.random() * 1080 + 360}deg`, // aylanish
        cd: `${2.4 + Math.random() * 1.8}s`, // davomiyligi
        cdelay: `${Math.random() * 0.5}s`, // kechikish
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        round: Math.random() > 0.7, // ba'zilari dumaloq
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            borderRadius: p.round ? "9999px" : "2px",
            ["--cx" as string]: p.cx,
            ["--cr" as string]: p.cr,
            ["--cd" as string]: p.cd,
            ["--cdelay" as string]: p.cdelay,
          }}
        />
      ))}
    </div>
  );
}
