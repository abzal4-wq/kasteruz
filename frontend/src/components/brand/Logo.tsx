import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
}

export function Logo({ className, variant = "dark" }: LogoProps) {
  const color = variant === "dark" ? "text-charcoal" : "text-cream";

  return (
    <Link to="/" className={cn("inline-flex flex-col items-center leading-none", className)}>
      <span className={cn("font-serif text-xl font-semibold uppercase tracking-[0.32em]", color)}>
        Kaster
      </span>
      <span className={cn("mt-1 text-[0.55rem] uppercase tracking-[0.38em] text-gold")}>
        Menswear · Toshkent
      </span>
    </Link>
  );
}
