import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Clock, TrendingUp, ArrowUpLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSearchStore } from "@/store/search";
import { useLang } from "@/hooks/useLang";
import { haptic } from "@/lib/haptics";
import { formatPrice, getStorageUrl } from "@/lib/utils";
import type { Product } from "@/types/database";

const POPULAR = ["Kostyum", "Shim", "Ko'ylak", "Bugaso", "Salvarini", "Galstuk"];

export function SearchOverlay() {
  const navigate = useNavigate();
  const { pick } = useLang();
  const { open, setOpen, history, addHistory, removeHistory, clearHistory } = useSearchStore();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Ochilganda fokus
  useEffect(() => {
    if (open) {
      setTerm("");
      setDebounced("");
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(t);
  }, [term]);

  // Esc bilan yopish
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const { data: results, isFetching } = useQuery({
    queryKey: ["search", debounced],
    enabled: open && debounced.length >= 2,
    queryFn: async (): Promise<Product[]> => {
      const { data } = await supabase
        .from("products")
        .select("*, images:product_images(*)")
        .eq("is_active", true)
        .or(`name_uz.ilike.%${debounced}%,name_ru.ilike.%${debounced}%,brand.ilike.%${debounced}%`)
        .limit(8);
      return (data ?? []) as Product[];
    },
  });

  if (!open) return null;

  function submit(q: string) {
    const query = q.trim();
    if (!query) return;
    haptic("light");
    addHistory(query);
    setOpen(false);
    navigate(`/catalog?search=${encodeURIComponent(query)}`);
  }

  function goProduct(id: string, name: string) {
    haptic("light");
    addHistory(name);
    setOpen(false);
    navigate(`/product/${id}`);
  }

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#100C08]/95 backdrop-blur-xl animate-[fade-in_0.2s_ease-out]">
      {/* Qidiruv qatori */}
      <div className="flex items-center gap-2 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <form
          onSubmit={(e) => { e.preventDefault(); submit(term); }}
          className="glass-strong flex flex-1 items-center gap-2.5 rounded-full px-4 py-3"
        >
          <Search className="h-5 w-5 flex-shrink-0 text-gold" />
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Mahsulot, brend qidiring..."
            className="flex-1 bg-transparent text-sm text-charcoal outline-none placeholder:text-charcoal-400"
          />
          {term && (
            <button type="button" onClick={() => setTerm("")} className="tap text-charcoal-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
        <button
          onClick={() => { haptic("light"); setOpen(false); }}
          className="tap px-1 text-sm font-medium text-charcoal-400"
        >
          Bekor
        </button>
      </div>

      {/* Kontent */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Jonli natijalar */}
        {debounced.length >= 2 ? (
          <div>
            {isFetching && (
              <p className="py-3 text-center text-xs text-charcoal-400">Qidirilmoqda...</p>
            )}
            {results && results.length > 0 ? (
              <ul className="space-y-2">
                {results.map((p) => {
                  const img = getStorageUrl((p.images?.find((i) => i.is_primary) ?? p.images?.[0])?.url ?? null);
                  const price = p.sale_price ?? p.base_price;
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => goProduct(p.id, pick(p, "name"))}
                        className="tap glass-card flex w-full items-center gap-3 rounded-ios p-2.5 text-left"
                      >
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
                          {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-charcoal">{pick(p, "name")}</p>
                          {p.brand && <p className="text-xs uppercase tracking-wider text-charcoal-400">{p.brand}</p>}
                          <p className="text-sm font-semibold text-gold">{formatPrice(price)}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button onClick={() => submit(debounced)} className="tap mt-1 w-full rounded-ios border border-white/10 py-3 text-center text-sm text-gold">
                    "{debounced}" bo'yicha barcha natijalar →
                  </button>
                </li>
              </ul>
            ) : (
              !isFetching && (
                <p className="py-8 text-center text-sm text-charcoal-400">Hech narsa topilmadi</p>
              )
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tarix */}
            {history.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-charcoal-400">
                    <Clock className="h-3.5 w-3.5" /> Tarix
                  </span>
                  <button onClick={() => { haptic("light"); clearHistory(); }} className="text-xs text-charcoal-400 hover:text-gold">Tozalash</button>
                </div>
                <ul className="space-y-1">
                  {history.map((h) => (
                    <li key={h} className="flex items-center gap-2">
                      <button onClick={() => submit(h)} className="tap flex flex-1 items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-white/5">
                        <Clock className="h-4 w-4 text-charcoal-400" />
                        <span className="flex-1 text-sm text-charcoal">{h}</span>
                        <ArrowUpLeft className="h-4 w-4 text-charcoal-400" />
                      </button>
                      <button onClick={() => removeHistory(h)} className="tap p-1 text-charcoal-400"><X className="h-3.5 w-3.5" /></button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mashhur */}
            <div>
              <span className="mb-2.5 flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wider text-charcoal-400">
                <TrendingUp className="h-3.5 w-3.5" /> Mashhur qidiruvlar
              </span>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <button
                    key={p}
                    onClick={() => submit(p)}
                    className="tap glass-card rounded-full px-4 py-2 text-sm text-charcoal"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
