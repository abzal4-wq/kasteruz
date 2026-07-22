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
  const { t, i18n } = useTranslation();
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
        new Notification("Kaster.uz", { body: t("settingsPage.notifOnBody"), icon: "/icon-192.png" });
        toast.success(t("settingsPage.notifOn"));
      } else {
        toast.error(t("settingsPage.notifDenied"));
      }
    } else {
      setNotifications(v);
    }
  }

  function clearCache() {
    haptic("warning");
    if (confirm(t("settingsPage.clearCacheConfirm"))) {
      try {
        if ("caches" in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)));
        localStorage.removeItem("kaster-recently-viewed");
        toast.success(t("settingsPage.cacheCleared"));
      } catch {
        toast.error(t("common.error"));
      }
    }
  }

  return (
    <div className="space-y-5">
      <SubPageHeader title={t("account.settings")} />

      {/* ── Til & ko'rinish ── */}
      <div>
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-charcoal-400">{t("settingsPage.appearance")}</p>
        <Group>
          <Row
            icon={<Languages className="h-5 w-5" />}
            label={t("settingsPage.language")}
            value={lang === "uz" ? "O'zbekcha" : "Русский"}
            onClick={toggleLang}
          />
          <div className="px-4 py-3.5">
            <div className="mb-3 flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Moon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-charcoal">{t("common.themeToggle")}</span>
            </div>
            <BgModeToggle />
          </div>
          <Row
            icon={<Sparkles className="h-5 w-5" />}
            label={t("settingsPage.reduceMotion")}
            right={<Switch checked={reduceMotion} onChange={setReduceMotion} aria-label={t("settingsPage.reduceMotion")} />}
          />
        </Group>
      </div>

      {/* ── Bildirishnoma & his ── */}
      <div>
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-charcoal-400">{t("settingsPage.notifSection")}</p>
        <Group>
          <Row
            icon={<Bell className="h-5 w-5" />}
            label={t("settingsPage.notifications")}
            right={<Switch checked={notifications} onChange={requestNotif} aria-label={t("settingsPage.notifications")} />}
          />
          <Row
            icon={<Vibrate className="h-5 w-5" />}
            label={t("settingsPage.haptics")}
            right={<Switch checked={haptics} onChange={setHaptics} aria-label={t("settingsPage.haptics")} />}
          />
        </Group>
      </div>

      {/* ── Ilova ── */}
      <div>
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-charcoal-400">{t("settingsPage.app")}</p>
        <Group>
          {!installed && (
            <Row
              icon={<Download className="h-5 w-5" />}
              label={canInstall ? t("settingsPage.installApp") : t("settingsPage.installToPhone")}
              onClick={async () => {
                const res = await promptInstall();
                if (res === "unavailable") {
                  toast.info(t("settingsPage.installManual"));
                }
              }}
            />
          )}
          {installed && (
            <Row icon={<Smartphone className="h-5 w-5" />} label={t("settingsPage.appInstalled")} value="✓" />
          )}
          <Row icon={<Trash2 className="h-5 w-5" />} label={t("settingsPage.clearCache")} onClick={clearCache} />
        </Group>
      </div>

      {/* ── Ma'lumot ── */}
      <div>
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-charcoal-400">{t("settingsPage.infoSection")}</p>
        <Group>
          <Row icon={<Info className="h-5 w-5" />} label={t("nav.about")} to="/about" />
          <Row icon={<Shield className="h-5 w-5" />} label={t("info.privacy.title")} to="/privacy" />
          <Row icon={<FileText className="h-5 w-5" />} label={t("info.terms.title")} to="/terms" />
        </Group>
      </div>

      <p className="pt-1 text-center text-[0.65rem] text-charcoal-400">
        Kaster.uz · {t("settingsPage.version")} 1.0.0 · Toshkent
      </p>
    </div>
  );
}
