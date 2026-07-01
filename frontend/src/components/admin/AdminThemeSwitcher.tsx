import { useState, useRef, useEffect } from "react";
import { Check, Palette } from "lucide-react";
import { useThemeStore } from "@/store/theme";
import type { ThemeId } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface Vibe {
  id: ThemeId;
  name: string;
  vibe: string;
  sidebar: string;
  accent: string;
  bg: string;
}

// 5 ta yuqori darajali palitra
const VIBES: Vibe[] = [
  { id: "brown",    name: "Elegant Brown",  vibe: "Issiq teri, hashamat",      sidebar: "#241810", accent: "#A9743C", bg: "#F3EEE6" },
  { id: "navy",     name: "Classic Blue",   vibe: "Korporativ, ishonch",        sidebar: "#0A192F", accent: "#2952CC", bg: "#EEF2F8" },
  { id: "green",    name: "Old Money",      vibe: "Vintage boylik, meros",      sidebar: "#163024", accent: "#B8995A", bg: "#F4F1E8" },
  { id: "black",    name: "Classic Black",  vibe: "Minimalist, kontrast",       sidebar: "#000000", accent: "#111111", bg: "#FFFFFF" },
  { id: "platinum", name: "Luxury White",   vibe: "Galereya, benuqson",         sidebar: "#FFFFFF", accent: "#3A3A3C", bg: "#FBFBFC" },
];

export function AdminThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = VIBES.find((v) => v.id === theme) ?? VIBES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="ad-pressable flex items-center gap-2.5 rounded-full px-3 py-2 transition-colors"
        style={{ background: "var(--ad-surface-2)", border: "1px solid var(--ad-border)" }}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: current.sidebar }}>
          <span className="h-2 w-2 rounded-full" style={{ background: current.accent }} />
        </span>
        <span className="hidden text-xs font-medium sm:block" style={{ color: "var(--ad-text-2)" }}>
          {current.name}
        </span>
        <Palette className="h-3.5 w-3.5" style={{ color: "var(--ad-text-3)" }} />
      </button>

      {open && (
        <div
          className="ad-card absolute right-0 z-50 mt-2 w-72 animate-[scale-in_0.18s_ease-out] overflow-hidden p-2"
          style={{ transformOrigin: "top right" }}
        >
          <p className="px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: "var(--ad-text-3)" }}>
            Mavzu (vibe)
          </p>
          {VIBES.map((v) => (
            <button
              key={v.id}
              onClick={() => { setTheme(v.id); setOpen(false); }}
              className={cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors")}
              style={{ background: theme === v.id ? "var(--ad-accent-soft)" : "transparent" }}
            >
              {/* Mini preview */}
              <div
                className="flex h-10 w-14 flex-shrink-0 items-center overflow-hidden rounded-xl"
                style={{ background: v.bg, border: "1px solid var(--ad-border)" }}
              >
                <span className="h-full w-4" style={{ background: v.sidebar }} />
                <span className="ml-1.5 h-4 w-4 rounded-md" style={{ background: v.accent }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--ad-text)" }}>{v.name}</p>
                <p className="truncate text-xs" style={{ color: "var(--ad-text-3)" }}>{v.vibe}</p>
              </div>
              {theme === v.id && <Check className="h-4 w-4 flex-shrink-0" style={{ color: "var(--ad-accent)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
