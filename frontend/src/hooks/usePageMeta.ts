import { useEffect } from "react";

const DEFAULT_TITLE = "Kaster.uz — Erkaklar Kiyimi";

// Har bir sahifa uchun <title> va meta description'ni yangilaydi (SEO + brauzer tab)
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      const m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", description);
    }
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description]);
}
