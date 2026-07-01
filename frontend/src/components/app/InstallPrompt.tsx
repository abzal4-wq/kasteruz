import { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";
import { useInstallPrompt } from "@/lib/pwa";
import { haptic } from "@/lib/haptics";

const DISMISS_KEY = "kaster-install-dismissed";

// Pastdan suzib chiqadigan "Ilovani o'rnating" banneri (mobil + desktop)
export function InstallPrompt() {
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (canInstall && !installed && !dismissed) {
      const t = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [canInstall, installed, dismissed]);

  if (!visible) return null;

  function close() {
    haptic("light");
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function install() {
    haptic("medium");
    const res = await promptInstall();
    if (res === "accepted" || res === "unavailable") setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] lg:pb-5">
      <div className="glass-strong flex w-full max-w-md animate-[sheet-up_0.4s_cubic-bezier(0.22,1,0.36,1)] items-center gap-3 rounded-ios-lg p-3 shadow-float">
        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#261C10] to-[#100C08]">
          <img src="/icon-192.png" alt="Kaster" className="h-full w-full object-cover" />
          <Sparkles className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 text-gold" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-charcoal">Kaster ilovasini o'rnating</p>
          <p className="text-xs text-charcoal-400">Tezroq kirish · offline ishlaydi · bildirishnomalar</p>
        </div>

        <button
          onClick={install}
          className="tap flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-xs font-semibold text-white shadow-glass-sm"
        >
          <Download className="h-4 w-4" />
          O'rnatish
        </button>

        <button
          onClick={close}
          className="tap flex-shrink-0 text-charcoal-300 hover:text-charcoal"
          aria-label="Yopish"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
