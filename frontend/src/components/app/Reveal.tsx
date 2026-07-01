import { useEffect, useRef, useState } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale";

// Nozik + sekin (klassik luxury) — kichik siljish, uzunroq davomiylik
const OFFSET: Record<Direction, string> = {
  up: "translateY(20px)",
  down: "translateY(-20px)",
  left: "translateX(24px)",
  right: "translateX(-24px)",
  scale: "scale(0.975)",
};

// Scrollda chiroyli paydo bo'ladigan o'rab oluvchi (IntersectionObserver)
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Birinchi ekrandagi (above-the-fold) element — observer'ni kutmasdan darhol
    // ko'rsatamiz. Aks holda ilk yuklanishda hero "ko'rinmay" qolardi.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
      setShown(true);
      if (once) return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : OFFSET[direction],
        transition: `opacity 1.1s cubic-bezier(0.33,1,0.4,1) ${delay}ms, transform 1.1s cubic-bezier(0.33,1,0.4,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
