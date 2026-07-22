import { Crown, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTier, getPoints, tierProgress, TIERS } from "@/lib/loyalty";
import { formatPrice } from "@/lib/utils";

// Premium a'zolik kartasi — kredit karta uslubida
export function LoyaltyCard({
  name,
  totalSpent,
  totalOrders,
}: {
  name: string;
  totalSpent: number;
  totalOrders: number;
}) {
  const { t } = useTranslation();
  const tier = getTier(totalSpent);
  const points = getPoints(totalSpent);
  const progress = tierProgress(totalSpent);
  const nextTier = TIERS.find((tr) => tr.min === tier.next);

  return (
    <div
      className="relative overflow-hidden rounded-ios-lg p-5 text-white shadow-float"
      style={{ background: tier.gradient }}
    >
      {/* Dekorativ doiralar */}
      <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-black/20 blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.25em] opacity-70">Kaster Club</p>
            <div className="mt-1 flex items-center gap-1.5">
              <Crown className="h-4 w-4" style={{ color: tier.accent }} />
              <span className="text-lg font-semibold" style={{ color: tier.accent }}>
                {t(`loyalty.tiers.${tier.id}`)}
              </span>
            </div>
          </div>
          <img src="/icon-192.png" alt="" className="h-9 w-9 rounded-lg opacity-90" />
        </div>

        <p className="mt-5 font-serif text-xl font-light tracking-wide">{name}</p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-current" style={{ color: tier.accent }} />
              <span className="text-2xl font-bold tabular-nums">{points.toLocaleString()}</span>
              <span className="text-xs opacity-70">{t("loyalty.points")}</span>
            </div>
            <p className="mt-0.5 text-[0.65rem] opacity-60">{totalOrders} {t("loyalty.orders")}</p>
          </div>
          <p className="text-right text-xs opacity-70">
            {t("loyalty.totalSpent")}
            <br />
            <span className="font-semibold opacity-100">{formatPrice(totalSpent)}</span>
          </p>
        </div>

        {/* Keyingi darajagacha progress */}
        {tier.next != null && nextTier && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[0.65rem] opacity-75">
              <span>{t(`loyalty.tiers.${tier.id}`)}</span>
              <span>{t("loyalty.until", { tier: t(`loyalty.tiers.${nextTier.id}`), amount: formatPrice(tier.next - totalSpent) })}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/25">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress * 100}%`, background: tier.accent }}
              />
            </div>
          </div>
        )}
        {tier.next == null && (
          <p className="mt-4 text-[0.7rem]" style={{ color: tier.accent }}>
            ✦ {t("loyalty.topTier")}
          </p>
        )}
      </div>
    </div>
  );
}
