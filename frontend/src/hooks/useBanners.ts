import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Banner } from "@/types/database";

export function useBanners(position: Banner["position"] = "hero") {
  return useQuery({
    queryKey: ["banners", position],
    queryFn: async (): Promise<Banner[]> => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("position", position)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data as Banner[];
    },
    staleTime: 1000 * 60 * 10,
  });
}
