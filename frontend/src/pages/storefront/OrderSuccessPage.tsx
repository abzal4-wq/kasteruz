import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/database";

export default function OrderSuccessPage() {
  const { t } = useTranslation();
  const { orderId } = useParams();

  const { data: order } = useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async (): Promise<Order> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("id", orderId!)
        .single();
      if (error) throw error;
      return data as Order;
    },
  });

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-600" strokeWidth={1.5} />
      <h1 className="mt-6 font-serif text-3xl font-light text-charcoal">
        {t("checkout.success")}
      </h1>

      {order && (
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          {t("checkout.successMessage", { orderNumber: order.order_number })}
        </p>
      )}

      {order && (
        <div className="mt-8 w-full max-w-sm glass-card rounded-ios p-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("account.orderNumber", { number: "" }).replace("#", "")}</span>
            <span className="font-medium text-charcoal">{order.order_number}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">{t("account.orderTotal")}</span>
            <span className="font-semibold text-charcoal">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="mt-10 flex gap-3">
        <Button variant="outline" asChild>
          <Link to="/account">{t("account.orders")}</Link>
        </Button>
        <Button asChild>
          <Link to="/catalog">{t("cart.continueShopping")}</Link>
        </Button>
      </div>
    </div>
  );
}
