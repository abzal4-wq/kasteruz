import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import type { ProductReview } from "@/types/database";

// Mahsulot sharhlari (yangi birinchi)
export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", productId],
    enabled: !!productId,
    queryFn: async (): Promise<ProductReview[]> => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductReview[];
    },
  });
}

// O'rtacha reyting
export function reviewAverage(reviews: ProductReview[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

// Sharh qoldirish
export function useSubmitReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      const customer = useAuthStore.getState().customer;
      if (!customer) throw new Error("Sharh qoldirish uchun tizimga kiring");
      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        customer_id: customer.id,
        rating,
        comment: comment.trim() || null,
        author_name: customer.full_name || "Mijoz",
      });
      if (error) {
        const m = (error.message ?? "").toLowerCase();
        if (m.includes("duplicate") || (error as { code?: string }).code === "23505") {
          throw new Error("Siz bu mahsulotga allaqachon sharh qoldirgansiz");
        }
        throw new Error(error.message || "Sharh saqlanmadi");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews", productId] }),
  });
}
