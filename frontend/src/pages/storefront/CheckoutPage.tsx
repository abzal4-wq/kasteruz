import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { formatPrice, cn } from "@/lib/utils";
import { getPaymentUrl, isPaymentConfigured } from "@/lib/payment";
import { IS_DEMO } from "@/lib/demo-data";
import { LocationPicker, type PickedLocation } from "@/components/checkout/LocationPicker";
import { Reveal } from "@/components/app/Reveal";
import { CreditCard, Truck, Store, Banknote } from "lucide-react";

const DELIVERY_FEE = 25000;
const FREE_DELIVERY_MIN = 500000;

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Ism familiya kiriting"),
  phone: z.string().min(9, "Telefon raqam kiriting"),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  region: z.string().optional(),
  district: z.string().optional(),
  addressLine: z.string().optional(),
  landmark: z.string().optional(),
  paymentMethod: z.enum(["cash", "payme", "click", "uzum"]),
  note: z.string().optional(),
}).refine(
  (data) => data.deliveryMethod === "pickup" || (data.addressLine && data.addressLine.length > 3),
  { message: "Manzilni kiriting", path: ["addressLine"] }
);

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, getSubtotal, promoDiscount, promoCode, clearCart } = useCartStore();
  const { customer, user, setCustomer } = useAuthStore();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<PickedLocation | null>(null);
  const [formError, setFormError] = useState("");

  const subtotal = getSubtotal();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: customer?.full_name ?? "",
      phone: customer?.phone ?? "",
      deliveryMethod: "delivery",
      region: "Toshkent",
      paymentMethod: "cash",
    },
  });

  const deliveryMethod = watch("deliveryMethod");
  const paymentMethod = watch("paymentMethod");
  const deliveryFee =
    deliveryMethod === "pickup" || subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
  const total = subtotal - promoDiscount + deliveryFee;

  // Mijoz yozuvini ta'minlash (yo'q bo'lsa yaratamiz — buyurtma biriktirish uchun)
  async function ensureCustomerId(data: CheckoutForm): Promise<string | null> {
    if (customer?.id) return customer.id;
    if (IS_DEMO) return "cust-demo-1";
    if (!user?.id) return null;

    // Mavjudmi?
    const { data: existing } = await supabase
      .from("customers").select("*").eq("auth_user_id", user.id).maybeSingle();
    if (existing) {
      setCustomer(existing);
      return existing.id;
    }
    // Yangi mijoz yaratamiz (formadagi ism/telefon bilan)
    const { data: created, error } = await supabase
      .from("customers")
      .insert({
        auth_user_id: user.id,
        full_name: data.fullName,
        phone: data.phone || user.email || "",
        email: user.email ?? null,
      })
      .select()
      .single();
    if (error) {
      console.warn("customer create:", error.message);
      return null;
    }
    setCustomer(created);
    return created.id;
  }

  async function onSubmit(data: CheckoutForm) {
    setSubmitting(true);
    setFormError("");

    try {
      const customerId = await ensureCustomerId(data);
      // Manzil yaratish (agar yetkazib berish bo'lsa)
      let addressId: string | null = null;
      if (data.deliveryMethod === "delivery") {
        const { data: addr } = await supabase
          .from("addresses")
          .insert({
            customer_id: customerId,
            region: data.region ?? "Toshkent",
            district: data.district,
            address_line: data.addressLine!,
            landmark: coords
              ? `${data.landmark ?? ""} (📍 ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`.trim()
              : data.landmark,
          })
          .select()
          .single();
        addressId = addr?.id ?? null;
      }

      // Buyurtma yaratish
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          channel: "online",
          status: "new",
          subtotal,
          discount_total: promoDiscount,
          delivery_fee: deliveryFee,
          total,
          payment_status: "pending",
          payment_method: data.paymentMethod,
          delivery_method: data.deliveryMethod,
          delivery_address_id: addressId,
          note: data.note,
        })
        .select()
        .single();

      if (orderError || !order) throw orderError;

      // Order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        variant_id: item.variantId,
        product_name_snapshot: item.productName,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.price,
        total: item.price * item.quantity,
      }));
      await supabase.from("order_items").insert(orderItems);

      // Buyurtmalar ro'yxati keshini yangilash (yangi buyurtma darhol ko'rinsin)
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });

      clearCart();

      // Onlayn to'lov — provayder sozlangan bo'lsagina yo'naltiramiz
      const isOnline =
        data.paymentMethod === "payme" ||
        data.paymentMethod === "click" ||
        data.paymentMethod === "uzum";

      if (!IS_DEMO && isOnline && isPaymentConfigured(data.paymentMethod)) {
        window.location.href = getPaymentUrl(
          data.paymentMethod as "payme" | "click" | "uzum",
          order.id,
          total
        );
        return;
      }

      // Naqd yoki sozlanmagan onlayn — savat (bo'sh) sahifasiga "rahmat" bilan qaytamiz
      navigate("/cart?ordered=1", { replace: true });
    } catch (err) {
      console.error("Buyurtma xato:", err);
      setFormError("Buyurtmani rasmiylashtirishda xatolik. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  }

  // Validatsiya o'tmasa — sababni ko'rsatamiz (jimgina to'xtab qolmasin)
  function onInvalid() {
    setFormError("Iltimos, barcha majburiy maydonlarni to'g'ri to'ldiring.");
  }

  if (items.length === 0) {
    navigate("/cart", { replace: true });
    return null;
  }

  // Faqat sozlangan to'lov usullarini ko'rsatamiz (cash doim mavjud).
  // Payme/Click/Uzum merchant ID kiritilgach avtomatik paydo bo'ladi.
  const paymentOptions = (
    [
      { value: "cash", label: t("checkout.cash"), icon: Banknote },
      { value: "payme", label: t("checkout.payme"), icon: CreditCard },
      { value: "click", label: t("checkout.click"), icon: CreditCard },
      { value: "uzum", label: t("checkout.uzum"), icon: CreditCard },
    ] as const
  ).filter((o) => isPaymentConfigured(o.value));

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-serif text-3xl font-light text-charcoal">
        {t("checkout.title")}
      </h1>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* ─── Forma ──────────────────────────────────── */}
          <div className="space-y-5 lg:col-span-2">
            {/* Aloqa */}
            <Reveal>
            <section className="glass-card rounded-[0.6rem] p-6 shadow-glass-sm">
              <h2 className="mb-4 font-serif text-lg font-medium">
                {t("checkout.contactInfo")}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                    {t("checkout.fullName")}
                  </label>
                  <Input {...register("fullName")} />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                    {t("checkout.phone")}
                  </label>
                  <Input {...register("phone")} type="tel" />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </section>
            </Reveal>

            {/* Yetkazib berish usuli */}
            <Reveal delay={80}>
            <section className="glass-card rounded-[0.6rem] p-6 shadow-glass-sm">
              <h2 className="mb-4 font-serif text-lg font-medium">
                {t("checkout.deliveryMethod")}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={cn(
                    "tap flex cursor-pointer items-center gap-3 rounded-xl p-4 transition-all",
                    deliveryMethod === "delivery"
                      ? "bg-gold text-white shadow-glass-sm"
                      : "glass text-charcoal"
                  )}
                >
                  <input type="radio" value="delivery" {...register("deliveryMethod")} className="sr-only" />
                  <Truck className="h-5 w-5" />
                  <span className="text-sm">{t("checkout.delivery")}</span>
                </label>
                <label
                  className={cn(
                    "tap flex cursor-pointer items-center gap-3 rounded-xl p-4 transition-all",
                    deliveryMethod === "pickup"
                      ? "bg-gold text-white shadow-glass-sm"
                      : "glass text-charcoal"
                  )}
                >
                  <input type="radio" value="pickup" {...register("deliveryMethod")} className="sr-only" />
                  <Store className="h-5 w-5" />
                  <span className="text-sm">{t("checkout.pickup")}</span>
                </label>
              </div>
            </section>
            </Reveal>

            {/* Manzil (faqat delivery) — xaritadan tanlash */}
            {deliveryMethod === "delivery" && (
              <section className="glass-card animate-fade-in rounded-[0.6rem] p-6 shadow-glass-sm">
                <h2 className="mb-4 font-serif text-lg font-medium">
                  {t("checkout.address")}
                </h2>

                {/* Leaflet xarita — joyni bosib tanlang */}
                <LocationPicker
                  onChange={(loc) => {
                    setCoords(loc);
                    setValue("addressLine", loc.address, { shouldValidate: true });
                  }}
                />

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                      Tanlangan manzil
                    </label>
                    <textarea
                      {...register("addressLine")}
                      rows={2}
                      placeholder="Xaritadan joy tanlang yoki manzilni yozing"
                      className="input-kaster resize-none"
                    />
                    {errors.addressLine && (
                      <p className="mt-1 text-xs text-destructive">{errors.addressLine.message}</p>
                    )}
                  </div>
                  <Input
                    {...register("landmark")}
                    placeholder="Qo'shimcha: kvartira, qavat, mo'ljal"
                  />
                </div>
              </section>
            )}

            {/* To'lov usuli */}
            <Reveal delay={120}>
            <section className="glass-card rounded-[0.6rem] p-6 shadow-glass-sm">
              <h2 className="mb-4 font-serif text-lg font-medium">
                {t("checkout.paymentMethod")}
              </h2>
              <div className="space-y-2">
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "tap flex cursor-pointer items-center gap-3 rounded-xl p-4 transition-all",
                      paymentMethod === opt.value
                        ? "glass-strong shadow-glass-sm ring-1 ring-gold/40"
                        : "glass"
                    )}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      {...register("paymentMethod")}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border",
                        paymentMethod === opt.value ? "border-gold" : "border-charcoal-300"
                      )}
                    >
                      {paymentMethod === opt.value && (
                        <span className="h-2 w-2 rounded-full bg-gold" />
                      )}
                    </span>
                    <opt.icon className="h-5 w-5 text-charcoal" />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>
            </Reveal>

            {/* Izoh */}
            <Reveal delay={160}>
            <section className="glass-card rounded-[0.6rem] p-6 shadow-glass-sm">
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                {t("checkout.orderNote")}
              </label>
              <textarea
                {...register("note")}
                rows={3}
                placeholder={t("checkout.orderNotePlaceholder")}
                className="input-kaster resize-none"
              />
            </section>
            </Reveal>
          </div>

          {/* ─── Xulosa ──────────────────────────────────── */}
          <div className="lg:col-span-1">
            <Reveal direction="left" delay={100}>
            <div className="sticky top-28 glass-card rounded-[0.6rem] p-6 shadow-glass-sm">
              <h2 className="font-serif text-lg font-medium">{t("cart.title")}</h2>

              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={item.variantId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-gold">
                    <dt>{promoCode}</dt>
                    <dd>−{formatPrice(promoDiscount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("cart.delivery")}</dt>
                  <dd>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">{t("cart.freeDelivery")}</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                <span className="font-serif font-medium">{t("cart.total")}</span>
                <span className="font-serif text-2xl font-light tracking-tight text-gold">{formatPrice(total)}</span>
              </div>

              {formError && (
                <p className="mt-4 rounded-md bg-destructive/15 px-3 py-2 text-center text-xs text-destructive">
                  {formError}
                </p>
              )}

              <Button type="submit" size="lg" className="mt-6 w-full text-xs font-semibold uppercase tracking-[0.16em]" disabled={submitting}>
                {submitting ? t("checkout.processing") : t("checkout.placeOrder")}
              </Button>
            </div>
            </Reveal>
          </div>
        </div>
      </form>
    </div>
  );
}
