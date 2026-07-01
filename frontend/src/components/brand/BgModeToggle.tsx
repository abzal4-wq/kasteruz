import { Sun, Moon } from "lucide-react";
import { BG_MODES, type BgMode } from "@/lib/theme";
import { useThemeStore } from "@/store/theme";
import { useLang } from "@/hooks/useLang";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const ICONS: Record<BgMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
};

const ORDER: BgMode[] = ["dark", "light"];

// Header uchun ixcham tugma — bir bosishda rejimlarni aylantiradi
export function BgModeQuickButton({ className }: { className?: string }) {
  const { bgMode, setBgMode } = useThemeStore();
  const Icon = ICONS[bgMode];
  const next = ORDER[(ORDER.indexOf(bgMode) + 1) % ORDER.length];
  return (
    <button
      onClick={() => { haptic("select"); setBgMode(next); }}
      aria-label="Orqa fon rejimi"
      title="Orqa fon rejimi"
      className={cn(
        "tap flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold",
        className
      )}
    >
      <Icon className="h-[1.15rem] w-[1.15rem]" />
    </button>
  );
}

// Fon rejimi tanlagich — Qora / Oq (segmented control)
export function BgModeToggle() {
  const { bgMode, setBgMode } = useThemeStore();
  const { lang } = useLang();

  return (
    <div className="flex gap-1.5 rounded-2xl bg-black/10 p-1.5 dark:bg-white/5">
      {BG_MODES.map((m) => {
        const Icon = ICONS[m.id];
        const active = bgMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => { haptic("select"); setBgMode(m.id); }}
            aria-pressed={active}
            className={cn(
              "tap flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition-all duration-300",
              active
                ? "bg-gold text-white shadow-glass-sm scale-[1.02]"
                : "text-charcoal-400 hover:text-charcoal"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
            {lang === "ru" ? m.name_ru : m.name_uz}
          </button>
        );
      })}
    </div>
  );
}
