import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
}

// Maison gerbi — romb ichida "K" monogrami (o'yma uslub)
export function LogoCrest({ className, size = 34 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* Tashqi romb */}
      <rect x="6.5" y="6.5" width="27" height="27" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1" />
      {/* Ichki romb (hairline) */}
      <rect x="9.5" y="9.5" width="21" height="21" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="0.6" opacity="0.55" />
      {/* K monogram */}
      <text
        x="20"
        y="25.6"
        textAnchor="middle"
        fontFamily="Cinzel, Cormorant Garamond, Georgia, serif"
        fontSize="15"
        fontWeight="600"
        fill="currentColor"
      >
        K
      </text>
    </svg>
  );
}

export function Logo({ className, variant = "dark" }: LogoProps) {
  const color = variant === "dark" ? "text-charcoal" : "text-cream";

  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5 leading-none sm:gap-3", className)}>
      <LogoCrest size={22} className="flex-shrink-0 text-gold transition-transform duration-500 group-hover:scale-110 sm:h-[34px] sm:w-[34px]" />
      <span className="flex flex-col">
        <span className={cn("font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] sm:text-lg sm:tracking-[0.3em]", color)}>
          Kaster
        </span>
        <span className="mt-0.5 whitespace-nowrap text-[0.38rem] uppercase tracking-[0.16em] text-gold sm:mt-1 sm:text-[0.48rem] sm:tracking-[0.3em]">
          Sartoria · Toshkent
        </span>
      </span>
    </Link>
  );
}
