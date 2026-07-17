import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";

// Internet uzilganda yuqorida chiziq ko'rsatadi, qaytganda qisqa "ulandi" xabari
export function OfflineIndicator() {
  const { t } = useTranslation();
  const [online, setOnline] = useState(navigator.onLine);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const goOffline = () => setOnline(false);
    const goOnline = () => {
      setOnline(true);
      setShowBack(true);
      setTimeout(() => setShowBack(false), 2200);
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (online && !showBack) return null;

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[110] flex items-center justify-center gap-2 py-2 text-center text-xs font-medium text-white transition-colors ${
        online ? "bg-emerald-600" : "bg-charcoal-900/95 backdrop-blur"
      }`}
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
    >
      {online ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          {t("common.backOnline")}
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          {t("common.offline")}
        </>
      )}
    </div>
  );
}
