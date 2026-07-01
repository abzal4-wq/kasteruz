import { useNavigate } from "react-router-dom";

// ─── Brendlar ro'yxati ────────────────────────────────────────
export const BRANDS_LIST = [
  {
    id: "salvarini",
    name: "SALVARINI",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    logoColor: "#ffffff",
  },
  {
    id: "bugaso",
    name: "BUGASO",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    logoColor: "#D4A843",
  },
  {
    id: "saco",
    name: "SACO",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    logoColor: "#D4A843",
  },
  {
    id: "kaster",
    name: "KASTER",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    logoColor: "#C9A96E",
  },
];

// ─── Salvarini: Qaldirg'och silueti ──────────────────────────
function SalvariniLogo({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Qaldirg'och tanasi + qanotlar + shoxli dum */}
      <path
        d="
          M 50 6
          L 6 30
          C 18 31, 34 37, 40 50
          L 36 76
          L 50 62
          L 64 76
          L 60 50
          C 66 37, 82 31, 94 30
          Z
        "
        fill={color}
      />
    </svg>
  );
}

// ─── Bugaso: Script "B" harfi ─────────────────────────────────
function BugasoLogo({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 70 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <text
        x="4"
        y="70"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="76"
        fill={color}
        letterSpacing="-2"
      >
        B
      </text>
    </svg>
  );
}

// ─── Saco: Yarim kostyum silueti ─────────────────────────────
function SacoLogo({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Kostyum yoqasi va tanasi (yarmi) */}
      {/* Chap yelka → yoqa → lapel → pastki qism */}
      <path
        d="
          M 12 5
          L 38 5
          C 38 5, 42 14, 40 22
          L 52 32
          L 52 88
          L 12 88
          Z
        "
        fill={color}
        opacity="0.9"
      />
      {/* O'ng yoqa → lapel nozik chiziq */}
      <path
        d="
          M 38 5
          L 68 5
          L 68 88
          L 52 88
          L 52 32
          L 40 22
          C 42 14, 44 8, 44 5
        "
        fill={color}
        opacity="0.45"
      />
      {/* Lapel chizig'i */}
      <line x1="40" y1="22" x2="28" y2="50" stroke={color} strokeWidth="2" opacity="0.7"/>
      {/* Tugma chiziqlari */}
      <circle cx="40" cy="55" r="2" fill={color} opacity="0.6"/>
      <circle cx="40" cy="65" r="2" fill={color} opacity="0.6"/>
      <circle cx="40" cy="75" r="2" fill={color} opacity="0.6"/>
    </svg>
  );
}

// ─── Kaster: "K" harfi ───────────────────────────────────────
function KasterLogo({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 70 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <text
        x="4"
        y="68"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="normal"
        fontWeight="400"
        fontSize="72"
        fill={color}
        letterSpacing="-2"
      >
        K
      </text>
    </svg>
  );
}

const LOGO_MAP: Record<string, (color: string) => React.ReactNode> = {
  salvarini: (c) => <SalvariniLogo color={c} />,
  bugaso:    (c) => <BugasoLogo color={c} />,
  saco:      (c) => <SacoLogo color={c} />,
  kaster:    (c) => <KasterLogo color={c} />,
};

// ─── Bitta brend kartasi (1:1 kvadrat) ───────────────────────
function BrandCard({
  brand,
  onClick,
}: {
  brand: (typeof BRANDS_LIST)[0];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="tap group relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-ios"
      style={{
        background: brand.bg,
        border: `1px solid ${brand.border}`,
      }}
    >
      {/* Logo */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {LOGO_MAP[brand.id]?.(brand.logoColor)}
      </div>

      {/* Hover: brend nomi overlay */}
      <div className="absolute inset-0 flex items-end justify-center bg-black/60 pb-2 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100">
        <span className="font-sans text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-white">
          {brand.name}
        </span>
      </div>
    </button>
  );
}

// ─── Brendlar lentasi (hero ichiga joylashtiriladi) ───────────
export function BrandsSlider() {
  const navigate = useNavigate();
  const items = [...BRANDS_LIST, ...BRANDS_LIST, ...BRANDS_LIST];

  return (
    <div className="overflow-hidden">
      <div className="brand-marquee flex gap-3 pl-4">
        {items.map((brand, i) => (
          <BrandCard
            key={`${brand.id}-${i}`}
            brand={brand}
            onClick={() => navigate(`/catalog?brand=${brand.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
