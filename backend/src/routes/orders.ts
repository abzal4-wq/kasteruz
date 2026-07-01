import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";

export const ordersRouter = Router();

// Buyurtma yaratish sxemasi
const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  channel: z.enum(["online", "offline", "pos", "instagram", "telegram"]).default("online"),
  items: z.array(
    z.object({
      variantId: z.string().uuid(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().int().positive(),
    })
  ).min(1),
  deliveryMethod: z.enum(["delivery", "pickup"]).default("delivery"),
  deliveryAddressId: z.string().uuid().optional(),
  paymentMethod: z.enum(["payme", "click", "uzum", "cash", "transfer"]),
  promoCodeId: z.string().uuid().optional(),
  note: z.string().optional(),
});

// POST /api/orders — buyurtma yaratish + stokni rezerv qilish
ordersRouter.post("/", async (req, res) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data = parsed.data;

  // Subtotal hisoblash
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  // Yetkazish narxini store_settings'dan olish
  const { data: settings } = await supabaseAdmin
    .from("store_settings")
    .select("key, value")
    .in("key", ["delivery_fee", "free_delivery_min"]);

  const deliveryFee = data.deliveryMethod === "pickup"
    ? 0
    : (() => {
        const fee = settings?.find((s) => s.key === "delivery_fee")?.value ?? "25000";
        const freeMin = settings?.find((s) => s.key === "free_delivery_min")?.value ?? "500000";
        return subtotal >= parseInt(freeMin) ? 0 : parseInt(fee);
      })();

  const total = subtotal + deliveryFee;

  // Buyurtma yaratish
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_id: data.customerId,
      channel: data.channel,
      status: "new",
      subtotal,
      discount_total: 0,
      delivery_fee: deliveryFee,
      total,
      payment_status: "pending",
      payment_method: data.paymentMethod,
      delivery_method: data.deliveryMethod,
      delivery_address_id: data.deliveryAddressId,
      promo_code_id: data.promoCodeId,
      note: data.note,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order yaratishda xato:", orderError);
    return res.status(500).json({ error: "Buyurtma yaratishda xato" });
  }

  // Order items yaratish
  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    variant_id: item.variantId,
    product_name_snapshot: "—", // Frontenddan to'liq nom yuborilishi kerak
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.unitPrice * item.quantity,
  }));

  await supabaseAdmin.from("order_items").insert(orderItems);

  // Status tarixi
  await supabaseAdmin.from("order_status_history").insert({
    order_id: order.id,
    status: "new",
    note: "Buyurtma yaratildi",
  });

  // Stokni rezerv qilish (asosiy ombor)
  const { data: mainWarehouse } = await supabaseAdmin
    .from("warehouses")
    .select("id")
    .eq("type", "store")
    .eq("is_active", true)
    .limit(1)
    .single();

  if (mainWarehouse) {
    for (const item of data.items) {
      await supabaseAdmin.rpc("reserve_stock", {
        p_variant_id: item.variantId,
        p_warehouse_id: mainWarehouse.id,
        p_quantity: item.quantity,
        p_order_id: order.id,
      });
    }
  }

  return res.status(201).json({ order });
});

// GET /api/orders/:id — buyurtma tafsilotlari
ordersRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      customer:customers(*),
      items:order_items(*, variant:product_variants(*, product:products(name_uz, name_ru))),
      payments(*),
      shipments(*),
      delivery_address:addresses(*)
    `)
    .eq("id", id)
    .single();

  if (error) return res.status(404).json({ error: "Buyurtma topilmadi" });
  return res.json(data);
});

// PATCH /api/orders/:id/status — holat o'zgartirish
ordersRouter.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body as { status: string; note?: string };

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error });

  await supabaseAdmin.from("order_status_history").insert({
    order_id: id,
    status,
    note,
  });

  return res.json(data);
});
