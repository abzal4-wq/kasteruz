import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { haptic } from "@/lib/haptics";

// Sub-sahifa sarlavhasi — orqaga qaytish tugmasi bilan (mobil app his)
export function SubPageHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-16 z-20 -mx-4 mb-2 flex items-center gap-2 bg-transparent px-4 py-3 lg:top-0 lg:mx-0 lg:px-0">
      <button
        onClick={() => {
          haptic("light");
          navigate("/account");
        }}
        className="tap flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-charcoal lg:hidden"
        aria-label="Orqaga"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <Link
        to="/account"
        className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/10 text-charcoal lg:flex"
        aria-label="Orqaga"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <h1 className="flex-1 font-serif text-xl font-light text-charcoal">{title}</h1>
      {right}
    </div>
  );
}

// iOS uslubidagi sozlama qatori
export function Row({
  icon,
  label,
  value,
  onClick,
  to,
  danger,
  right,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  to?: string;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  const inner = (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${danger ? "bg-rose-500/15 text-rose-400" : "bg-gold/15 text-gold"}`}>
        {icon}
      </div>
      <span className={`flex-1 text-sm font-medium ${danger ? "text-rose-400" : "text-charcoal"}`}>{label}</span>
      {value && <span className="text-xs text-charcoal-400">{value}</span>}
      {right}
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={() => haptic("light")} className="tap block transition-colors hover:bg-white/5">
        {inner}
      </Link>
    );
  }
  // Bosiladigan qator (onClick bor)
  if (onClick) {
    return (
      <button
        onClick={() => {
          haptic("light");
          onClick();
        }}
        className="tap block w-full text-left transition-colors hover:bg-white/5"
      >
        {inner}
      </button>
    );
  }
  // Faqat ko'rsatuvchi qator (masalan Switch bilan) — tugma ichiga tugma bo'lmasligi uchun div
  return <div>{inner}</div>;
}

// Qatorlar guruhi (iOS list section)
export function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card overflow-hidden rounded-ios divide-y divide-white/8">{children}</div>
  );
}
