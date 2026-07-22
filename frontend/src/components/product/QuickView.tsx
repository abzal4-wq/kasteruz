import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Check, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuickView } from "@/store/quickview";
import { useCartStore } from "@/store/cart";
import { useLang } from "@/hooks/useLang";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice, getStorageUrl, cn } from "@/lib/utils";
import { toast } from "@/store/toast";
import { haptic } from "@/lib/haptics";

export function QuickView() {
  const { t } = useTranslation();
  const { product, close } = useQuickView();
  const { pick } = useLang();
  const addItem = useCartStore((s) => s.addItem);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setColor(null);
    setSize(null);
    setAdded(false);
  }, [product?.id]);

  const variants = useMemo(() => product?.variants ?? [], [product]);
  const colors = useMemo(
    () => Array.from(new Map(variants.map((v) => [v.color, v.color_hex])).entries()),
    [variants]
  );
  // Rang tanlanmaganda bir o'lcham bir marta ko'rinsin (ko'p rangda takrorlanadi)
  const sizes = useMemo(() => {
    const filtered = variants.filter((v) => !color || v.color === color);
    const seen = new Set<string>();
    return filtered.filter((v) => {
      if (seen.has(v.size)) return false;
      seen.add(v.size);
      return true;
    });
  }, [variants, color]);
  const selected = variants.find((v) => v.size === size && (color ? v.color === color : true));

  // Bitta rang bo'lsa avtomatik tanlash
  useEffect(() => {
    if (colors.length === 1 && !color) setColor(colors[0][0]);
  }, [colors, color]);

  const name = product ? pick(product, "name") : "";
  // Tanlangan rang surati > asosiy surat > birinchi surat
  const img = getStorageUrl(
    (
      (color && product?.images?.find((i) => i.color === color)) ||
      product?.images?.find((i) => i.is_primary) ||
      product?.images?.[0]
    )?.url ?? null
  );
  const hasDiscount = !!product && product.sale_price != null && product.sale_price < product.base_price;
  const price = product ? product.sale_price ?? product.base_price : 0;

  function add() {
    if (!product || !selected) return;
    addItem({
      variantId: selected.id,
      productId: product.id,
      productName: name,
      size: selected.size,
      color: selected.color,
      colorHex: selected.color_hex,
      imageUrl: img,
      price,
      quantity: 1,
    });
    setAdded(true);
    haptic("success");
    toast.cart(t("product.addedToCart"), {
      subtitle: `${name} · ${selected.size}`,
      imageUrl: img ?? undefined,
      action: { label: t("cart.viewCart"), to: "/cart" },
    });
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        {product && (
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Rasm — mobilda balandligi cheklangan (butun ekranni egallamasin,
                narx/rang/o'lcham/tugma darhol ko'rinsin), desktopda 3:4 portret */}
            <div className="relative aspect-auto h-[38vh] w-full overflow-hidden bg-white/5 sm:aspect-[3/4] sm:h-auto">
              {img ? (
                <img src={img} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-charcoal-300">
                  Kaster
                </div>
              )}
            </div>

            {/* Ma'lumot */}
            <div className="flex flex-col p-6 lg:p-8">
              {product.fit_type && (
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-gold">
                  {product.fit_type === "slim" ? "Slim fit" : product.fit_type === "regular" ? "Regular fit" : "Comfort fit"}
                </p>
              )}
              <h2 className="mt-1 font-serif text-2xl font-light text-charcoal">{name}</h2>

              <div className="mt-3 flex items-baseline gap-2">
                <span className={cn("font-serif text-2xl font-light tracking-tight", hasDiscount ? "text-gold" : "text-charcoal")}>
                  {formatPrice(price)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(product.base_price)}</span>
                )}
              </div>

              {colors.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-charcoal">{t("filters.color")}</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(([c, hex]) => (
                      <button
                        key={c}
                        onClick={() => { setColor(c); setSize(null); }}
                        title={c}
                        aria-label={c}
                        className={cn(
                          "h-8 w-8 rounded-full border transition-all hover:scale-110",
                          color === c ? "scale-110 border-charcoal ring-2 ring-gold ring-offset-2" : "border-border"
                        )}
                        style={{ background: hex ?? "#ccc" }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-charcoal">{t("filters.size")}</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSize(v.size)}
                      className={cn(
                        "tap flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-medium transition-all",
                        size === v.size ? "bg-gold text-white shadow-glass-sm" : "glass text-charcoal hover:border-gold/40"
                      )}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <Button
                  size="lg"
                  className="w-full text-xs font-semibold uppercase tracking-[0.16em]"
                  disabled={!selected}
                  onClick={add}
                >
                  {added ? (
                    <><Check className="mr-2 h-4 w-4" /> {t("product.added")}</>
                  ) : (
                    <><ShoppingBag className="mr-2 h-4 w-4" /> {selected ? t("product.addToCartShort") : t("product.selectSize")}</>
                  )}
                </Button>
                <Link
                  to={`/product/${product.id}`}
                  onClick={close}
                  className="inline-flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.16em] text-charcoal transition-colors hover:text-gold"
                >
                  {t("common.details")} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
