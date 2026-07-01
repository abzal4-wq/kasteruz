import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";

export function LangSwitch({ className }: { className?: string }) {
  const { lang, toggleLang } = useLang();

  return (
    <button
      onClick={toggleLang}
      className={cn(
        "flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors hover:text-gold",
        className
      )}
      aria-label="Tilni almashtirish"
    >
      <span className={lang === "uz" ? "text-gold" : "text-current opacity-50"}>UZ</span>
      <span className="opacity-30">/</span>
      <span className={lang === "ru" ? "text-gold" : "text-current opacity-50"}>RU</span>
    </button>
  );
}
