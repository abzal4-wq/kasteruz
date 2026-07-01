import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { haptic } from "@/lib/haptics";

// Pastga scroll qilganda paydo bo'ladigan suzuvchi tugma
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => {
        haptic("light");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      aria-label="Tepaga"
      className="glass-strong tap fixed bottom-28 right-4 z-40 flex h-11 w-11 animate-[scale-in_0.25s_ease-out] items-center justify-center rounded-full text-charcoal shadow-float lg:bottom-6"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
