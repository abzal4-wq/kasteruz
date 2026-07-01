import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { IS_DEMO } from "@/lib/demo-data";
import { formatPrice, formatDateShort } from "@/lib/utils";
import { SubPageHeader } from "./AccountUI";
import type { Order, OrderStatus } from "@/types/database";

const STATUS_VARIANT: Record<OrderStatus, "default" | "gold" | "success" | "destructive" | "muted"> = {
  new: "muted", confirmed: "gold", packed: "gold", shipped: "gold",
  delivered: "success", cancelled: "destructive", returned: "destructive", refunded: "destructive",
};

export default function OrdersPage() {
  const { t } = useTranslation();
  const { customer, user } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", customer?.id, user?.id],
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
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  return (
    <div>
      <SubPageHeader title="Buyurtmalarim" />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-ios" />)}
        </div>
      ) : orders && orders.length > 0 ? (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="glass-card rounded-ios p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-charcoal">{order.order_number}</p>
                  <p className="text-xs text-charcoal-400">{formatDateShort(order.created_at)}</p>
                </div>
                <Badge variant={STATUS_VARIANT[order.status]}>{t(`orderStatus.${order.status}`)}</Badge>
              </div>

              {/* Kuzatuv timeline */}
              <div className="mt-5">
                <OrderTimeline status={order.status} />
              </div>

              <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                <p className="text-xs text-charcoal-400">
                  {order.items?.length ?? 0} {t("common.pieces")}
                </p>
                <p className="font-semibold text-charcoal">{formatPrice(order.total)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="glass-card rounded-ios-lg py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-charcoal-300" strokeWidth={1} />
          <p className="mt-4 text-charcoal-400">{t("account.noOrders")}</p>
          <Button asChild className="mt-6">
            <Link to="/catalog">{t("cart.continueShopping")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
