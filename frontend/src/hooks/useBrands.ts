import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { demoBrands, IS_DEMO } from "@/lib/demo-data";

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  logo_blend_mode: string;
  bg_color: string;
  text_color: string;
  accent_color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export function useBrands(activeOnly = false) {
  return useQuery({
    queryKey: ["brands", activeOnly],
    queryFn: async (): Promise<Brand[]> => {
      if (IS_DEMO) {
        const list = [...demoBrands].sort((a, b) => a.sort_order - b.sort_order);
        return activeOnly ? list.filter((b) => b.is_active) : list;
      }
      let q = supabase.from("brands").select("*").order("sort_order");
      if (activeOnly) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Brand[];
    },
  });
}

export function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
