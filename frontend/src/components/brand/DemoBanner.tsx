import { useState } from "react";
import { X, Info } from "lucide-react";
import { IS_DEMO } from "@/lib/demo-data";

// Demo rejimda foydalanuvchiga ko'rsatiladigan ogohlantirish chizig'i
export function DemoBanner() {
  const [hidden, setHidden] = useState(false);
  if (!IS_DEMO || hidden) return null;

  return (
    <div className="relative z-50 bg-gold text-white">
      <div className="container-page flex items-center justify-center gap-2 py-2 text-center text-xs sm:text-sm">
        <Info className="h-4 w-4 flex-shrink-0" />
        <span>
          <strong>Demo rejim</strong> — namuna ma'lumotlar bilan ishlamoqda.
          Haqiqiy do'kon uchun <code className="rounded bg-white/20 px-1">SOZLASH.md</code> bo'yicha Supabase'ni ulang.
        </span>
        <button
          onClick={() => setHidden(true)}
          className="absolute right-4 opacity-80 hover:opacity-100"
          aria-label="Yopish"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
