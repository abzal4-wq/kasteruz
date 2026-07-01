import { useTranslation } from "react-i18next";
import {
  Vibrate, Bell, Sparkles, Languages, Download,
  Trash2, Info, Shield, FileText, Smartphone, Moon,
} from "lucide-react";
import { useSettingsStore } from "@/store/settings";
import { useInstallPrompt } from "@/lib/pwa";
import { haptic } from "@/lib/haptics";
import { toast } from "@/store/toast";
import { Switch } from "@/components/ui/switch";
import { BgModeToggle } from "@/components/brand/BgModeToggle";
import { Group, Row, SubPageHeader } from "./AccountUI";

export default function SettingsPage() {
  const { i18n } = useTranslation();
  const { haptics, notifications, reduceMotion, setHaptics, setNotifications, setReduceMotion } = useSettingsStore();
  const { canInstall, installed, promptInstall } = useInstallPrompt();

  const lang = i18n.language.startsWith("ru") ? "ru" : "uz";

  function toggleLang() {
    const next = lang === "uz" ? "ru" : "uz";
    haptic("select");
    i18n.changeLanguage(next);
  }

  async function requestNotif(v: boolean) {
    if (v && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setNotifications(true);
        new Notification("Kaster.uz", { body: "Bildirishnomalar yoqildi ✓", icon: "/icon-192.png" });
        toast.success("Bildirishnomalar yoqildi");
      } else {
        toast.error("Ruxsat berilmadi");
      }
    } else {
      setNotifications(v);
    }
  }

  function clearCache() {
    haptic("warning");
    if (confirm("Vaqtinchalik ma'lumotlar (cache) tozalansinmi?")) {
      try {
        if ("caches" in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)));
        localStorage.removeItem("kaster-recently-viewed");
        toast.success("Cache tozalandi");
      } catch {
        toast.error("Xatolik");
      }
    }
  }

  return (
    <div className="space-y-5">
      <SubPageHeader title="Sozlamalar" />

      {/* ── Til & ko'rinish ── */}
      <div>
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-charcoal-400">Ko'rinish</p>
        <Group>
          <Row
            icon={<Languages className="h-5 w-5" />}
            label="Til"
            value={lang === "uz" ? "O'zbekcha" : "Русский"}
            onClick={toggleLang}
          />
          <div className="px-4 py-3.5">
            <div className="mb-3 flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Moon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-charcoal">Orqa fon rejimi</span>
            </div>
            <BgModeToggle />
          </div>
          <Row
            icon={<Sparkles className="h-5 w-5" />}
            label="Animatsiyalarni kamaytirish"
            right={<Switch checked={reduceMotion} onChange={setReduceMotion} aria-label="Animatsiya" />}
          />
        </Group>
      </div>

      {/* ── Bildirishnoma & his ── */}
      <div>
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-charcoal-400">Bildirishnoma & His</p>
        <Group>
          <Row
            icon={<Bell className="h-5 w-5" />}
            label="Bildirishnomalar"
            right={<Switch checked={notifications} onChange={requestNotif} aria-label="Bildirishnoma" />}
          />
          <Row
            icon={<Vibrate className="h-5 w-5" />}
            label="Tebranish (haptic)"
            right={<Switch checked={haptics} onChange={setHaptics} aria-label="Tebranish" />}
          />
        </Group>
      </div>

      {/* ── Ilova ── */}
      <div>
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-charcoal-400">Ilova</p>
        <Group>
          {!installed && (
            <Row
              icon={<Download className="h-5 w-5" />}
              label={canInstall ? "Ilovani o'rnatish" : "Telefonga o'rnatish"}
              onClick={async () => {
                const res = await promptInstall();
                if (res === "unavailable") {
                  toast.info("Brauzer menyusidan 'Bosh ekranga qo'shish'ni tanlang");
                }
              }}
            />
          )}
          {installed && (
            <Row icon={<Smartphone className="h-5 w-5" />} label="Ilova o'rnatilgan" value="✓" />
          )}
          <Row icon={<Trash2 className="h-5 w-5" />} label="Cache tozalash" onClick={clearCache} />
        </Group>
      </div>

      {/* ── Ma'lumot ── */}
      <div>
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-charcoal-400">Ma'lumot</p>
        <Group>
          <Row icon={<Info className="h-5 w-5" />} label="Biz haqimizda" to="/about" />
          <Row icon={<Shield className="h-5 w-5" />} label="Maxfiylik siyosati" to="/privacy" />
          <Row icon={<FileText className="h-5 w-5" />} label="Foydalanish shartlari" to="/terms" />
        </Group>
      </div>

      <p className="pt-1 text-center text-[0.65rem] text-charcoal-400">
        Kaster.uz · Versiya 1.0.0 · Toshkent
      </p>
    </div>
  );
}
