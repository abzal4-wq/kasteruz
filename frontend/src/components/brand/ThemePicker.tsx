import { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { THEMES } from "@/lib/theme";
import { useThemeStore } from "@/store/theme";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";

// ─── Rang swatch'lari (5 ta) ─────────────────────────────────
export function ThemeSwatches({ size = "md" }: { size?: "md" | "lg" }) {
  const { theme, setTheme } = useThemeStore();
  const { lang } = useLang();
  const dim = size === "lg" ? "h-12 w-12" : "h-10 w-10";

  return (
    <div className="flex flex-wrap gap-3">
      {THEMES.map((t) => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="tap flex flex-col items-center gap-1.5"
            aria-label={t.name_uz}
          >
            <span
              className={cn(
                "relative flex items-center justify-center rounded-full transition-all duration-200",
                dim,
                active ? "ring-2 ring-gold ring-offset-2 ring-offset-transparent" : "",
                t.light ? "ring-1 ring-inset ring-black/10" : ""
              )}
              style={{ background: t.swatch }}
            >
              {active && (
                <Check className={cn("h-5 w-5", t.light ? "text-charcoal" : "text-white")} strokeWidth={2.6} />
              )}
            </span>
            <span className={cn("text-[0.65rem] font-medium", active ? "text-gold" : "text-muted-foreground")}>
              {lang === "ru" ? t.name_ru : t.name_uz}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── "Mavzular" pill + ochiluvchi panel (bosh sahifa uchun) ──
export function ThemePicker({ align = "center" }: { align?: "center" | "start" | "end" }) {
  const { theme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = THEMES.find((t) => t.id === theme);

  // Tashqariga bosilganda yopish
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="tap inline-flex items-center gap-2.5 rounded-full glass px-6 py-3 text-sm font-semibold text-charcoal shadow-glass-sm"
      >
        <Palette className="h-4 w-4 text-gold" />
        Mavzular
        <span
          className="h-4 w-4 rounded-full border border-white/70 shadow-sm"
          style={{ background: active?.swatch }}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-3 w-72 rounded-ios glass-strong p-4 shadow-float animate-scale-in",
            align === "center" && "left-1/2 -translate-x-1/2",
            align === "start" && "left-0",
            align === "end" && "right-0"
          )}
        >
          <p className="mb-3 px-1 text-xs uppercase tracking-wider text-muted-foreground">
            Mavzuni tanlang
          </p>
          <ThemeSwatches />
        </div>
      )}
    </div>
  );
}
