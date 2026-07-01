import { useQuery } from "@tanstack/react-query";
import { Clock, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { Reveal } from "@/components/app/Reveal";
import { IS_DEMO } from "@/lib/demo-data";
import { formatPrice, formatDateShort } from "@/lib/utils";
import type { Order } from "@/types/database";

// Bo'sh savat tagida — foydalanuvchining xaridlar tarixi
export function PurchaseHistory() {
  const { t } = useTranslation();
  const { customer, user } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["purchase-history", customer?.id, user?.id],
    enabled: !!(customer?.id || user?.id),
    queryFn: async (): Promise<Order[]> => {
      let customerId = customer?.id ?? null;
      if (!customerId && user?.id) {
        const { data: c } = await supabase
          .from("customers").select("id").eq("auth_user_id", user.id).maybeSingle();
        customerId = c?.id ?? null;
      }
      if (!customerId && IS_DEMO) customerId = "cust-demo-1";
      if (!customerId) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as Order[];
    },
  });

  if (!user) return null;
  if (!isLoading && (!orders || orders.length === 0)) return null;

  return (
    <div className="mx-auto mt-16 w-full max-w-2xl">
      <div className="mb-6 flex items-center gap-2.5">
        <Clock className="h-5 w-5 text-gold" />
        <h2 className="font-serif text-2xl font-light text-charcoal">Xaridlar tarixi</h2>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-[0.6rem]" />)}
        </div>
      ) : (
        <ul className="space-y-4 text-left">
          {orders?.map((order, i) => (
            <Reveal key={order.id} delay={i * 70}>
              <li className="glass-card rounded-[0.6rem] p-5 shadow-glass-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold">
                      <Package className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-charcoal">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{formatDateShort(order.created_at)}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-charcoal">{formatPrice(order.total)}</p>
                </div>

                <div className="mt-5">
                  <OrderTimeline status={order.status} />
                </div>

                <p className="mt-4 border-t border-white/10 pt-3 text-xs text-muted-foreground">
                  {order.items?.length ?? 0} {t("common.pieces")} ·{" "}
                  {t(`orderStatus.${order.status}`)}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
