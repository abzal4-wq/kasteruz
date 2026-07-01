import { Check, Package, ShoppingBag, Truck, Home, XCircle } from "lucide-react";
import type { OrderStatus } from "@/types/database";
import { cn } from "@/lib/utils";

// Buyurtma bosqichlari (oddiy yo'l)
const STEPS: { status: OrderStatus; label: string; icon: typeof Check }[] = [
  { status: "new", label: "Qabul qilindi", icon: ShoppingBag },
  { status: "confirmed", label: "Tasdiqlandi", icon: Check },
  { status: "packed", label: "Tayyorlandi", icon: Package },
  { status: "shipped", label: "Yo'lda", icon: Truck },
  { status: "delivered", label: "Yetkazildi", icon: Home },
];

const ORDER_INDEX: Record<OrderStatus, number> = {
  new: 0, confirmed: 1, packed: 2, shipped: 3, delivered: 4,
  cancelled: -1, returned: -1, refunded: -1,
};

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const current = ORDER_INDEX[status];
  const cancelled = current === -1;

  if (cancelled) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 px-4 py-3">
        <XCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
        <p className="text-sm font-medium text-rose-300">
          {status === "cancelled" ? "Buyurtma bekor qilindi" : status === "returned" ? "Qaytarildi" : "Pul qaytarildi"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <div key={step.status} className="relative flex flex-1 flex-col items-center">
            {/* Bog'lovchi chiziq */}
            {i > 0 && (
              <span
                className={cn(
                  "absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2",
                  i <= current ? "bg-gold" : "bg-white/12"
                )}
              />
            )}
            {/* Nuqta */}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                done && "border-gold bg-gold text-white",
                active && "border-gold bg-gold text-white shadow-[0_0_0_4px_rgb(var(--brand-400)/0.25)]",
                !done && !active && "border-white/15 bg-charcoal-100/10 text-charcoal-400"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.4} />
              {active && (
                <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" />
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-center text-[0.6rem] font-medium leading-tight",
                i <= current ? "text-charcoal" : "text-charcoal-400"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
