import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { IS_DEMO } from "@/lib/demo-data";
import { useWishlistStore } from "@/store/wishlist";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { Reveal } from "@/components/app/Reveal";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/database";

const PRODUCT_SELECT = `
  *,
  category:categories(*),
  variants:product_variants(*),
  images:product_images(*)
`;

// Haqiqiy Supabase'da mahsulot id'lari UUID. Eski/demo id'lar (mas. "prod-1")
// UUID ustuniga to'g'ri kelmay, butun so'rovni 400 bilan yiqitadi —
// shuning uchun real rejimda faqat UUID shaklidagilarni so'rovga yuboramiz.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const prune = useWishlistStore((s) => s.prune);

  const { data: products, isLoading, isSuccess } = useQuery({
    queryKey: ["wishlist-products", ids],
    enabled: ids.length > 0,
    queryFn: async (): Promise<Product[]> => {
      // Real rejimda noto'g'ri (UUID bo'lmagan) id'larni so'rovdan chiqaramiz
      const queryIds = IS_DEMO ? ids : ids.filter((id) => UUID_RE.test(id));
      if (queryIds.length === 0) return [];
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .in("id", queryIds);
      if (error) throw error;
      // Tartibni wishlist tartibida saqlash
      const list = (data ?? []) as Product[];
      return ids
        .map((id) => list.find((p) => p.id === id))
        .filter((p): p is Product => !!p);
    },
  });

  // O'z-o'zini tozalash: so'rov muvaffaqiyatli tugagach, topilmagan
  // (o'chirilgan yoki eski demo) ID'larni wishlist'dan olib tashlaymiz —
  // shunda sanoq ("N ta mahsulot") haqiqiy ko'rsatkichga to'g'ri keladi.
  useEffect(() => {
    if (isSuccess && products) {
      prune(products.map((p) => p.id));
    }
  }, [isSuccess, products, prune]);

  // ─── Bo'sh holat ────────────────────────────────────────────
  if (ids.length === 0) {
    return (
      <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
        <Heart className="h-16 w-16 text-charcoal-300" strokeWidth={1} />
        <h1 className="mt-6 font-serif text-2xl font-light text-charcoal">
          Sevimlilar bo'sh
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Yoqqan mahsulotlaringizni yurak belgisini bosib shu yerga saqlang.
        </p>
        <Button asChild className="mt-8">
          <Link to="/catalog">Katalogga o'tish</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      {/* Sarlavha */}
      <div className="mb-7 flex items-center gap-3">
        <Heart className="h-6 w-6 fill-rose-500 text-rose-500" />
        <div>
          <h1 className="font-serif text-3xl font-light text-charcoal md:text-4xl">
            Sevimlilar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ids.length} ta mahsulot
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: Math.min(ids.length, 8) }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : products?.map((product, i) => (
              <Reveal key={product.id} delay={Math.min(i, 7) * 60} direction="up">
                <ProductCard product={product} />
              </Reveal>
            ))}
      </div>
    </div>
  );
}
