import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Check, Truck, PartyPopper } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/app/Reveal";
import { Confetti } from "@/components/app/Confetti";
import { PurchaseHistory } from "@/components/cart/PurchaseHistory";
import { formatPrice } from "@/lib/utils";

const DELIVERY_FEE = 25000;
const FREE_DELIVERY_MIN = 500000;

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justOrdered = searchParams.get("ordered") === "1";
  const { items, updateQuantity, removeItem, getSubtotal, promoDiscount } =
    useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
  const total = subtotal - promoDiscount + deliveryFee;
  const freeDeliveryLeft = FREE_DELIVERY_MIN - subtotal;

  function handleCheckout() {
    // Kirmagan bo'lsa RequireUser /auth ga yo'naltiradi va keyin /checkout ga qaytaradi
    navigate("/checkout");
  }

  // ─── Bo'sh savat (+ xarid keyin rahmat + tarix) ─────────────
  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center py-16 text-center">
        {/* Konfetti — viewport bo'ylab tushishi uchun transformli Reveal'dan tashqarida */}
        {justOrdered && <Confetti />}

        {justOrdered ? (
          // Xarid muvaffaqiyatli — tabrik
          <Reveal direction="scale" className="w-full max-w-md">
            <div className="glass-card rounded-[0.7rem] p-8 shadow-float">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/15">
                <PartyPopper className="h-10 w-10 text-gold" />
              </div>
              <h1 className="mt-6 font-serif text-3xl font-light text-charcoal">
                {t("cart.thankYou")} 🎉
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("cart.orderReceived")}
              </p>
              <Button asChild size="lg" className="mt-7 w-full">
                <Link to="/catalog">{t("cart.continueShopping")}</Link>
              </Button>
            </div>
          </Reveal>
        ) : (
          // Oddiy bo'sh savat
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-foreground/5">
              <ShoppingBag className="h-12 w-12 text-charcoal-300" strokeWidth={1.2} />
            </div>
            <h1 className="mt-6 font-serif text-2xl font-light text-charcoal">{t("cart.empty")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("cart.emptyDescription")}</p>
            <Button asChild className="mt-8">
              <Link to="/catalog">{t("cart.continueShopping")}</Link>
            </Button>
          </div>
        )}

        {/* Xaridlar tarixi */}
        <PurchaseHistory />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-serif text-3xl font-light text-charcoal">
        {t("cart.title")}
      </h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* ─── Mahsulotlar ro'yxati ─────────────────────── */}
        <div className="lg:col-span-2">
          <div className="glass-card divide-y divide-white/8 rounded-[0.6rem] px-5">
            {items.map((item, i) => (
              <Reveal key={item.variantId} delay={i * 70} className="flex gap-4 py-6">
                {/* Rasm */}
                <Link
                  to={`/product/${item.productId}`}
                  className="group h-28 w-24 flex-shrink-0 overflow-hidden rounded-[0.5rem] bg-white/5 shadow-glass-sm"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-charcoal-300">
                      Kaster
                    </div>
                  )}
                </Link>

                {/* Ma'lumot */}
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-sans text-sm font-medium text-charcoal hover:text-gold"
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.color} · {t("filters.size")} {item.size}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={t("cart.remove")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-end justify-between">
                    {/* Miqdor */}
                    <div className="flex items-center rounded-full glass">
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        aria-label={t("product.decrease")}
                        className="tap flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="flex h-9 w-9 items-center justify-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        aria-label={t("product.increase")}
                        className="tap flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="price-main text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Button variant="link" asChild className="mt-6 px-0">
            <Link to="/catalog">← {t("cart.continueShopping")}</Link>
          </Button>
        </div>

        {/* ─── Xulosa ───────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 glass-card rounded-[0.6rem] p-6 shadow-glass-sm">
            <h2 className="font-serif text-lg font-medium text-charcoal">
              {t("cart.total")}
            </h2>

            {/* Bepul yetkazish progress */}
            {freeDeliveryLeft > 0 ? (
              <div className="mt-4 rounded-2xl bg-gold/12 p-3.5">
                <p className="flex items-center gap-1.5 text-xs text-charcoal">
                  <Truck className="h-3.5 w-3.5 text-gold" />
                  {t("cart.freeDeliveryLeft", { amount: formatPrice(freeDeliveryLeft) })}
                </p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_MIN) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-500/12 p-3.5 text-xs font-medium text-emerald-600">
                <Check className="h-4 w-4" /> {t("cart.freeDeliveryEarned")}
              </div>
            )}

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
                <dd className="text-charcoal">{formatPrice(subtotal)}</dd>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-gold">
                  <dt>{t("cart.discount")}</dt>
                  <dd>−{formatPrice(promoDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("cart.delivery")}</dt>
                <dd className="text-charcoal">
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">{t("cart.freeDelivery")}</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-serif text-base font-medium">
                {t("cart.total")}
              </span>
              <span className="font-serif text-2xl font-light tracking-tight text-gold">
                {formatPrice(total)}
              </span>
            </div>

            <Button size="lg" className="mt-6 w-full text-xs font-semibold uppercase tracking-[0.16em]" onClick={handleCheckout}>
              {t("cart.checkout")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
