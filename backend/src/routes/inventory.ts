import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";

export const inventoryRouter = Router();

// GET /api/inventory — ombordagi tovar holati
inventoryRouter.get("/", async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("inventory_available")
    .select("*")
    .order("name_uz");

  if (error) return res.status(500).json({ error });
  return res.json(data);
});

// POST /api/inventory/movement — stok harakati (kirim/chiqim/ko'chirish)
const MovementSchema = z.object({
  variantId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  toWarehouseId: z.string().uuid().optional(),
  type: z.enum(["in", "out", "transfer", "adjustment"]),
  quantity: z.number().int().positive(),
  note: z.string().optional(),
});

inventoryRouter.post("/movement", async (req, res) => {
  const parsed = MovementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { variantId, warehouseId, toWarehouseId, type, quantity, note } = parsed.data;

  if (type === "transfer") {
    if (!toWarehouseId) {
      return res.status(400).json({ error: "Ko'chirish uchun manzil ombor kerak" });
    }

    // Chiqim
    await supabaseAdmin.from("inventory").upsert({
      variant_id: variantId,
      warehouse_id: warehouseId,
      quantity: 0,
    });

    const { data: fromInv } = await supabaseAdmin
      .from("inventory")
      .select("quantity")
      .eq("variant_id", variantId)
      .eq("warehouse_id", warehouseId)
      .single();

    if (!fromInv || fromInv.quantity < quantity) {
      return res.status(400).json({ error: "Yetarli tovar yo'q" });
    }

    // Stok yangilash
    await Promise.all([
      supabaseAdmin
        .from("inventory")
        .update({ quantity: fromInv.quantity - quantity })
        .eq("variant_id", variantId)
        .eq("warehouse_id", warehouseId),
      supabaseAdmin.rpc("upsert_inventory", {
        p_variant_id: variantId,
        p_warehouse_id: toWarehouseId,
        p_delta: quantity,
      }),
    ]);

    // Harakat yozuvi
    await supabaseAdmin.from("stock_movements").insert([
      {
        variant_id: variantId,
        warehouse_id: warehouseId,
        type: "out",
        quantity: -quantity,
        reference_type: "transfer",
        note,
      },
      {
        variant_id: variantId,
        warehouse_id: toWarehouseId,
        type: "in",
        quantity,
        reference_type: "transfer",
        note,
      },
    ]);
  } else {
    const delta = type === "out" ? -quantity : quantity;

    await supabaseAdmin.rpc("upsert_inventory", {
      p_variant_id: variantId,
      p_warehouse_id: warehouseId,
      p_delta: delta,
    });

    await supabaseAdmin.from("stock_movements").insert({
      variant_id: variantId,
      warehouse_id: warehouseId,
      type,
      quantity: delta,
      note,
    });
  }

  return res.json({ success: true });
});
