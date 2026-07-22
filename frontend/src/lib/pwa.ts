// PWA — service worker registratsiya + o'rnatish (install) hook
import { useEffect, useState } from "react";

// Service worker — FAQAT production'da. Dev rejimda SW kesh eski fayllarni
// ko'rsatib, o'zgarishlarni "yashirib" qo'yardi — shuning uchun dev'da mavjud
// SW'ni o'chirib, keshlarni tozalaymiz.
// PWA keshi qayta-qayta "eski versiya qotib qolish" muammosini keltirdi.
// Shuning uchun Service Worker BUTUNLAY o'chirilgan — sayt har doim
// to'g'ridan-to'g'ri Vercel CDN'dan eng so'nggi versiyani oladi.
// Mavjud (eski) SW'ni ro'yxatdan chiqaramiz va barcha keshlarni tozalaymiz.
export function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});

  if ("caches" in window) {
    caches
      .keys()
      .then((keys) => keys.forEach((k) => caches.delete(k)))
      .catch(() => {});
  }
}

// beforeinstallprompt hodisasini ushlash
interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BIPEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BIPEvent;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn());
  });
}

// Standalone (o'rnatilgan) rejimda ishlayaptimi?
export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(!!deferredPrompt);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const update = () => {
      setCanInstall(!!deferredPrompt);
      setInstalled(isStandalone());
    };
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return "unavailable";
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    listeners.forEach((fn) => fn());
    return outcome;
  };

  return { canInstall, installed, promptInstall };
}
