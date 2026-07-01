import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, ShoppingCart, Package, AlertTriangle, ArrowUpRight, Wallet,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatNumber, formatDateShort } from "@/lib/utils";
import type { Order } from "@/types/database";

interface LowStock {
  variant_id: string;
  available: number;
  reorder_level: number;
  name_uz: string;
  size: string;
  color: string;
  warehouse_name: string;
}

const STATUS_LABEL: Record<string, string> = {
  new: "Yangi", confirmed: "Tasdiqlangan", packed: "Tayyorlandi", shipped: "Yo'lda",
  delivered: "Yetkazildi", cancelled: "Bekor", returned: "Qaytarildi", refunded: "Qaytarildi",
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [ordersRes, todayOrdersRes] = await Promise.all([
        supabase.from("orders").select("total, status, payment_status, created_at"),
        supabase.from("orders").select("total").gte("created_at", today.toISOString()),
      ]);
      const allOrders = ordersRes.data ?? [];
      const todayOrders = todayOrdersRes.data ?? [];
      const paidOrders = allOrders.filter((o) => o.payment_status === "paid" && o.status !== "cancelled");
      return {
        todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
        todayOrders: todayOrders.length,
        totalRevenue: paidOrders.reduce((s, o) => s + o.total, 0),
        totalOrders: allOrders.length,
        newOrders: allOrders.filter((o) => o.status === "new").length,
      };
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async (): Promise<Order[]> => {
      const { data } = await supabase
        .from("orders")
        .select("*, customer:customers(full_name, phone)")
        .order("created_at", { ascending: false })
        .limit(7);
      return (data ?? []) as Order[];
    },
  });

  const { data: lowStock } = useQuery({
    queryKey: ["admin-low-stock"],
    queryFn: async (): Promise<LowStock[]> => {
      const { data } = await supabase.from("low_stock_alert").select("*").limit(6);
      return (data ?? []) as LowStock[];
    },
  });

  const secondaryCards = [
    { label: "Bugungi buyurtmalar", value: stats ? formatNumber(stats.todayOrders) : "—", icon: ShoppingCart },
    { label: "Yangi buyurtmalar", value: stats ? formatNumber(stats.newOrders) : "—", icon: Package },
    { label: "Umumiy daromad", value: stats ? formatPrice(stats.totalRevenue) : "—", icon: Wallet },
  ];

  return (
    <div className="space-y-8">
      {/* ─── Sarlavha ─────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight" style={{ color: "var(--ad-text)" }}>
            Boshqaruv paneli
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--ad-text-3)" }}>
            {formatDateShort(new Date())} · Bugungi ko'rsatkichlar
          </p>
        </div>
        <span
          className="rounded-full px-4 py-2 text-xs font-semibold"
          style={{ background: "var(--ad-accent-soft)", color: "var(--ad-accent)" }}
        >
          ● Jonli
        </span>
      </div>

      {/* ─── Statistika ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Hero karta (urg'u) */}
        <div
          className="ad-card ad-card-hover relative overflow-hidden p-7 lg:col-span-1"
          style={{ background: "linear-gradient(150deg, var(--ad-accent), color-mix(in srgb, var(--ad-accent) 75%, #000))" }}
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.18)" }}>
                <TrendingUp className="h-5 w-5" style={{ color: "var(--ad-on-accent)" }} />
              </span>
              <ArrowUpRight className="h-5 w-5" style={{ color: "var(--ad-on-accent)", opacity: 0.7 }} />
            </div>
            <p className="mt-6 text-[0.7rem] uppercase tracking-wider" style={{ color: "var(--ad-on-accent)", opacity: 0.8 }}>
              Bugungi sotuv
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-32 bg-white/20" />
            ) : (
              <p className="mt-1.5 font-serif text-2xl font-semibold" style={{ color: "var(--ad-on-accent)" }}>
                {stats ? formatPrice(stats.todayRevenue) : "—"}
              </p>
            )}
          </div>
        </div>

        {/* Ikkilamchi kartalar */}
        {secondaryCards.map((card) => (
          <div key={card.label} className="ad-card ad-card-hover p-7">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: "var(--ad-accent-soft)", color: "var(--ad-accent)" }}
            >
              <card.icon className="h-5 w-5" />
            </span>
            <p className="mt-6 text-[0.7rem] uppercase tracking-wider" style={{ color: "var(--ad-text-3)" }}>
              {card.label}
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-28" />
            ) : (
              <p className="mt-1.5 font-serif text-2xl font-semibold" style={{ color: "var(--ad-text)" }}>
                {card.value}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ─── Pastki bo'lim ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Oxirgi buyurtmalar */}
        <div className="ad-card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-7 pt-6 pb-4">
            <h2 className="font-serif text-lg font-semibold" style={{ color: "var(--ad-text)" }}>
              Oxirgi buyurtmalar
            </h2>
            <span className="text-xs" style={{ color: "var(--ad-text-3)" }}>So'nggi 7 ta</span>
          </div>

          <div className="px-3 pb-3">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 rounded-2xl px-4 py-3 transition-colors"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ad-surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-semibold"
                    style={{ background: "var(--ad-accent-soft)", color: "var(--ad-accent)" }}
                  >
                    {(order.customer?.full_name?.[0] ?? "#").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold" style={{ color: "var(--ad-text)" }}>
                      {order.customer?.full_name ?? order.customer?.phone ?? "Mehmon"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--ad-text-3)" }}>{order.order_number}</p>
                  </div>
                  <span
                    className="hidden rounded-full px-2.5 py-1 text-[0.65rem] font-medium sm:inline"
                    style={{ background: "var(--ad-surface-2)", color: "var(--ad-text-2)" }}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--ad-text)" }}>
                    {formatPrice(order.total)}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-4 py-10 text-center text-sm" style={{ color: "var(--ad-text-3)" }}>
                Hozircha buyurtmalar yo'q
              </p>
            )}
          </div>
        </div>

        {/* Kam qolgan tovarlar */}
        <div className="ad-card overflow-hidden">
          <div className="flex items-center gap-2 px-7 pt-6 pb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(239,68,68,0.12)" }}>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </span>
            <h2 className="font-serif text-lg font-semibold" style={{ color: "var(--ad-text)" }}>Kam qolgan</h2>
          </div>
          <div className="px-3 pb-3">
            {lowStock && lowStock.length > 0 ? (
              lowStock.map((item) => (
                <div key={item.variant_id} className="flex items-center justify-between rounded-2xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--ad-text)" }}>{item.name_uz}</p>
                    <p className="text-xs" style={{ color: "var(--ad-text-3)" }}>{item.color} · {item.size}</p>
                  </div>
                  <span
                    className="flex-shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold"
                    style={
                      item.available === 0
                        ? { background: "rgba(239,68,68,0.12)", color: "#ef4444" }
                        : { background: "var(--ad-accent-soft)", color: "var(--ad-accent)" }
                    }
                  >
                    {item.available} dona
                  </span>
                </div>
              ))
            ) : (
              <p className="px-4 py-10 text-center text-sm" style={{ color: "var(--ad-text-3)" }}>
                Hammasi yetarli ✓
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
