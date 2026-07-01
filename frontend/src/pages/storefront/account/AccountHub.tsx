import { useQuery } from "@tanstack/react-query";
import {
  Package, Heart, MapPin, User as UserIcon, Settings,
  Headphones, LogOut, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useWishlistStore } from "@/store/wishlist";
import { useStoreContact, telHref } from "@/hooks/useStoreContact";
import { supabase } from "@/lib/supabase";
import { IS_DEMO } from "@/lib/demo-data";
import { haptic } from "@/lib/haptics";
import { LoyaltyCard } from "@/components/account/LoyaltyCard";
import { Group, Row } from "./AccountUI";
import type { Customer } from "@/types/database";

export default function AccountHub() {
  const { customer, user, profile, signOut } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const { data: contact } = useStoreContact();

  // Mijoz statistikasi (jami xarid, buyurtmalar)
  const { data: stats } = useQuery({
    queryKey: ["account-stats", user?.id, customer?.id],
    enabled: !!(user?.id || customer?.id),
    queryFn: async (): Promise<Pick<Customer, "full_name" | "total_spent" | "total_orders" | "phone">> => {
      let c = customer;
      if (!c && user?.id) {
        const { data } = await supabase
          .from("customers")
          .select("full_name, total_spent, total_orders, phone")
          .eq("auth_user_id", user.id)
          .maybeSingle();
        c = data as Customer | null;
      }
      if (!c && IS_DEMO) {
        return { full_name: "Mehmon", total_spent: 1410000, total_orders: 2, phone: "" };
      }
      return {
        full_name: c?.full_name ?? null,
        total_spent: c?.total_spent ?? 0,
        total_orders: c?.total_orders ?? 0,
        phone: c?.phone ?? "",
      };
    },
  });

  const displayName =
    stats?.full_name || customer?.full_name || profile?.full_name || user?.email?.split("@")[0] || "Mehmon";

  return (
    <div className="space-y-5">
      {/* ── A'zolik kartasi ── */}
      <LoyaltyCard
        name={displayName}
        totalSpent={stats?.total_spent ?? 0}
        totalOrders={stats?.total_orders ?? 0}
      />

      {/* ── Asosiy menyu ── */}
      <Group>
        <Row
          icon={<Package className="h-5 w-5" />}
          label="Buyurtmalarim"
          to="/account/orders"
          right={<ChevronRight className="h-4 w-4 text-charcoal-300" />}
        />
        <Row
          icon={<Heart className="h-5 w-5" />}
          label="Sevimlilar"
          to="/wishlist"
          value={wishlistCount > 0 ? String(wishlistCount) : undefined}
          right={<ChevronRight className="h-4 w-4 text-charcoal-300" />}
        />
        <Row
          icon={<MapPin className="h-5 w-5" />}
          label="Manzillarim"
          to="/account/addresses"
          right={<ChevronRight className="h-4 w-4 text-charcoal-300" />}
        />
      </Group>

      {/* ── Profil & sozlamalar ── */}
      <Group>
        <Row
          icon={<UserIcon className="h-5 w-5" />}
          label="Profil ma'lumotlari"
          to="/account/profile"
          right={<ChevronRight className="h-4 w-4 text-charcoal-300" />}
        />
        <Row
          icon={<Settings className="h-5 w-5" />}
          label="Sozlamalar"
          to="/account/settings"
          right={<ChevronRight className="h-4 w-4 text-charcoal-300" />}
        />
      </Group>

      {/* ── Yordam & chiqish ── */}
      <Group>
        <Row
          icon={<Headphones className="h-5 w-5" />}
          label="Yordam va aloqa"
          onClick={() => { if (contact?.phone) window.location.href = telHref(contact.phone); }}
          right={<ChevronRight className="h-4 w-4 text-charcoal-300" />}
        />
        <Row
          icon={<LogOut className="h-5 w-5" />}
          label="Chiqish"
          danger
          onClick={() => { haptic("warning"); void signOut(); }}
        />
      </Group>

      <p className="pt-1 text-center text-[0.65rem] text-charcoal-400">
        Kaster.uz · v1.0.0
      </p>
    </div>
  );
}
