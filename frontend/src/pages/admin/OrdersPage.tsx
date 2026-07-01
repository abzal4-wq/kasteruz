import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, formatDateShort, cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/database";

const STATUSES: OrderStatus[] = [
  "new", "confirmed", "packed", "shipped", "delivered", "cancelled",
];

const STATUS_VARIANT: Record<string, "default" | "gold" | "success" | "destructive" | "muted"> = {
  new: "muted",
  confirmed: "gold",
  packed: "gold",
  shipped: "gold",
  delivered: "success",
  cancelled: "destructive",
  returned: "destructive",
  refunded: "destructive",
};

export default function OrdersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: async (): Promise<Order[]> => {
      let query = supabase
        .from("orders")
        .select("*, customer:customers(full_name, phone), items:order_items(*)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Order[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      await supabase.from("order_status_history").insert({
        order_id: id,
        status,
        note: "Admin tomonidan o'zgartirildi",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-light text-charcoal">Buyurtmalar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders?.length ?? 0} ta buyurtma
          </p>
        </div>

        <div className="w-44">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`orderStatus.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-ios border border-black/5 bg-white shadow-glass-sm">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Raqam</th>
              <th className="px-4 py-3 font-medium">Sana</th>
              <th className="px-4 py-3 font-medium">Mijoz</th>
              <th className="px-4 py-3 font-medium">Mahsulot</th>
              <th className="px-4 py-3 font-medium">To'lov</th>
              <th className="px-4 py-3 text-right font-medium">Summa</th>
              <th className="px-4 py-3 font-medium">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-3">
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-cream-50">
                  <td className="px-4 py-3 font-medium text-charcoal">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateShort(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-charcoal">{order.customer?.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer?.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.items?.length ?? 0} dona
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs",
                        order.payment_status === "paid"
                          ? "text-green-600"
                          : "text-muted-foreground"
                      )}
                    >
                      {order.payment_status === "paid" ? "To'langan" : "Kutilmoqda"}
                    </span>
                    <p className="text-xs capitalize text-muted-foreground">
                      {order.payment_method}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-charcoal">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={order.status}
                      onValueChange={(status) =>
                        updateStatus.mutate({ id: order.id, status })
                      }
                    >
                      <SelectTrigger className="h-8 w-32 border-0 p-0">
                        <Badge variant={STATUS_VARIANT[order.status]}>
                          {t(`orderStatus.${order.status}`)}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`orderStatus.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Buyurtmalar topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
