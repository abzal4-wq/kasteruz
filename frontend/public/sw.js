// Kaster.uz — SERVICE WORKER O'CHIRISH (kill-switch)
// PWA keshi "telefonda eski versiya qotib qoladi" muammosini bir necha bor
// keltirib chiqardi. Shuning uchun SW butunlay o'chiriladi: bu skript eski
// keshlarni tozalaydi, o'zini ro'yxatdan chiqaradi va ochiq sahifalarni
// eng so'nggi versiyaga qayta yuklaydi. Bundan keyin sayt to'g'ridan-to'g'ri
// tarmoqdan (Vercel CDN) ishlaydi — har doim eng yangi.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 1) Barcha eski keshlarni o'chiramiz
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* e'tiborsiz */
      }
      // 2) O'zimizni ro'yxatdan chiqaramiz (endi SW yo'q)
      try {
        await self.registration.unregister();
      } catch {
        /* e'tiborsiz */
      }
      // 3) Ochiq oynalarni eng so'nggi versiyaga yangilaymiz
      try {
        const clients = await self.clients.matchAll({ type: "window" });
        for (const c of clients) {
          try {
            await c.navigate(c.url);
          } catch {
            /* e'tiborsiz */
          }
        }
      } catch {
        /* e'tiborsiz */
      }
    })()
  );
});

// Fetch hodisasini ushlamaymiz — hamma so'rov to'g'ridan-to'g'ri tarmoqqa
// (hech narsa keshlanmaydi).
