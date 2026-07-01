import { useQuery } from "@tanstack/react-query";
import { Users, Phone, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDateShort } from "@/lib/utils";
import { demoCustomers, demoOrders, IS_DEMO } from "@/lib/demo-data";

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export default function CustomersPage() {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async (): Promise<Customer[]> => {
      if (IS_DEMO) {
        // Demo: buyurtmalar sonini hisoblash
        return demoCustomers.map((c) => ({
          ...c,
          total_orders: demoOrders.filter((o) => o.customer_id === c.id).length,
          total_spent: demoOrders
            .filter((o) => o.customer_id === c.id)
            .reduce((sum, o) => sum + o.total, 0),
        }));
      }
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
  });

  const totalSpent = customers?.reduce((s, c) => s + (c.total_spent ?? 0), 0) ?? 0;
  const totalOrders = customers?.reduce((s, c) => s + (c.total_orders ?? 0), 0) ?? 0;

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-light text-charcoal">Mijozlar</h1>

      {/* Umumiy ko'rsatkichlar */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Jami mijozlar</p>
          <p className="mt-2 text-3xl font-semibold text-charcoal">{customers?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Jami buyurtmalar</p>
          <p className="mt-2 text-3xl font-semibold text-charcoal">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 col-span-2 lg:col-span-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Umumiy savdo</p>
          <p className="mt-2 text-2xl font-semibold text-charcoal">{formatPrice(totalSpent)}</p>
        </div>
      </div>

      {/* Mijozlar jadvali */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-cream-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mijoz</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Telefon</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Buyurtmalar</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Umumiy xarid</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ro'yxatdan o'tgan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : customers?.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-cream-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-semibold text-gold">
                            {c.full_name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="font-medium text-charcoal">{c.full_name || "—"}</p>
                            {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-charcoal">
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.phone || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="flex items-center justify-end gap-1.5">
                          <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.total_orders ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-charcoal">
                        {formatPrice(c.total_spent ?? 0)}
                      </td>
                      <td className="px-5 py-4 text-right text-muted-foreground">
                        {formatDateShort(c.created_at)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && (!customers || customers.length === 0) && (
          <div className="flex flex-col items-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
            <p className="mt-4 text-muted-foreground">Hali mijozlar yo'q</p>
          </div>
        )}
      </div>
    </div>
  );
}
