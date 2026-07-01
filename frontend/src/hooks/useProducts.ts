import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Product, Category } from "@/types/database";

export interface ProductFilters {
  categorySlug?: string;
  brand?: string;
  sizes?: string[];
  colors?: string[];
  fitType?: string;
  fabric?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  featuredOnly?: boolean;
}

const PRODUCT_SELECT = `
  *,
  category:categories(*),
  variants:product_variants(*),
  images:product_images(*)
`;

// Mahsulotlar ro'yxati (filtrlar bilan)
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("is_active", true);

      if (filters.featuredOnly) {
        query = query.eq("is_featured", true);
      }

      if (filters.fitType) {
        query = query.eq("fit_type", filters.fitType);
      }

      if (filters.fabric) {
        query = query.ilike("fabric", `%${filters.fabric}%`);
      }

      if (filters.minPrice != null) {
        query = query.gte("base_price", filters.minPrice);
      }

      if (filters.maxPrice != null) {
        query = query.lte("base_price", filters.maxPrice);
      }

      if (filters.search) {
        query = query.textSearch("search_vector", filters.search, {
          type: "websearch",
          config: "simple",
        });
      }

      // Saralash
      switch (filters.sort) {
        case "price_asc":
          query = query.order("base_price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("base_price", { ascending: false });
          break;
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      let products = (data ?? []) as Product[];

      // Kategoriya slug bo'yicha (client-side)
      if (filters.categorySlug) {
        products = products.filter(
          (p) => p.category?.slug === filters.categorySlug
        );
      }

      // Brend bo'yicha (client-side, demo va real rejimda ishlaydi)
      if (filters.brand) {
        products = products.filter(
          (p) => (p as any).brand?.toLowerCase() === filters.brand!.toLowerCase()
        );
      }

      // O'lcham/rang bo'yicha variantlar ichidan filtr
      if (filters.sizes?.length) {
        products = products.filter((p) =>
          p.variants?.some((v) => filters.sizes!.includes(v.size))
        );
      }
      if (filters.colors?.length) {
        products = products.filter((p) =>
          p.variants?.some((v) => filters.colors!.includes(v.color))
        );
      }

      return products;
    },
  });
}

// Bitta mahsulot
export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ["product", productId],
    enabled: !!productId,
    queryFn: async (): Promise<Product> => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*, inventory(*))
        `)
        .eq("id", productId!)
        .single();

      if (error) throw error;
      return data as Product;
    },
  });
}

// Kategoriyalar
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data as Category[];
    },
    staleTime: 1000 * 60 * 10,
  });
}
