import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/types/database";

// Mijozning o'z buyurtmalari
export function useMyOrders(customerId: string | undefined) {
  return useQuery({
    queryKey: ["my-orders", customerId],
    enabled: !!customerId,
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(
            *,
            variant:product_variants(
              size, color,
              product:products(name_uz, name_ru, images:product_images(url, is_primary))
            )
          ),
          delivery_address:addresses(*),
          payments(*)
        `)
        .eq("customer_id", customerId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
}

// Bitta buyurtma
export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async (): Promise<Order> => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer:customers(*),
          items:order_items(*),
          delivery_address:addresses(*),
          payments(*),
          shipments(*)
        `)
        .eq("id", orderId!)
        .single();

      if (error) throw error;
      return data as Order;
    },
  });
}

// Admin: holat o'zgartirish
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      note,
    }: {
      orderId: string;
      status: string;
      note?: string;
    }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status,
        note: note ?? "Holat o'zgartirildi",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}
