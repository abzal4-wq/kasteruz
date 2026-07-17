import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Gorizontal snap-slayder — swipe (mobil) + o'qlar (desktop) + avtomatik o'tish
export function CardSlider({
  children,
  className,
  autoPlay = true,
  interval = 3800,
}: {
  children: React.ReactNode;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }

  // Avtomatik o'tish — hover yoki teginishda to'xtaydi, oxiriga yetganda boshiga qaytadi.
  // MOBILDA O'CHIQ: telefonda slider o'zi surilib, kartalarni bosib bo'lmay qolardi.
  useEffect(() => {
    if (!autoPlay) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;

    let paused = false;
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });

    const id = window.setInterval(() => {
      if (paused || document.hidden) return;
      const max = el.scrollWidth - el.clientWidth - 4;
      if (el.scrollLeft >= max) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const card = el.firstElementChild as HTMLElement | null;
        const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.85;
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, interval);

    return () => {
      clearInterval(id);
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", resume);
      el.removeEventListener("touchstart", pause);
    };
  }, [autoPlay, interval]);

  return (
    <div className="group/slider relative">
      <div
        ref={ref}
        className={cn(
          "scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 sm:gap-5",
          className
        )}
      >
        {children}
      </div>

      {/* Desktop o'qlari — hover'da chiqadi */}
      <button
        type="button"
        aria-label="Oldingi"
        onClick={() => scroll(-1)}
        className="absolute -left-3 top-[40%] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full glass-strong text-charcoal opacity-0 shadow-float transition-all hover:text-gold group-hover/slider:opacity-100 lg:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Keyingi"
        onClick={() => scroll(1)}
        className="absolute -right-3 top-[40%] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full glass-strong text-charcoal opacity-0 shadow-float transition-all hover:text-gold group-hover/slider:opacity-100 lg:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
