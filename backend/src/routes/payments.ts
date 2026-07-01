import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase";

export const paymentsRouter = Router();

// ─── Payme webhook ───────────────────────────────────────────
paymentsRouter.post("/payme/webhook", async (req, res) => {
  try {
    const body = JSON.parse(req.body.toString());
    const { method, params } = body;

    if (method === "PerformTransaction") {
      const orderId = params.account?.order_id as string;

      await supabaseAdmin.from("payments").insert({
        order_id: orderId,
        provider: "payme",
        amount: params.amount,
        status: "completed",
        transaction_id: params.id,
        raw_payload: body,
      });

      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", orderId);

      return res.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          transaction: params.id,
          perform_time: Date.now(),
          state: 2,
        },
      });
    }

    return res.json({ jsonrpc: "2.0", id: body.id, result: {} });
  } catch (err) {
    console.error("Payme webhook xato:", err);
    return res.status(500).json({ error: "Webhook xato" });
  }
});

// ─── Click webhook ───────────────────────────────────────────
paymentsRouter.post("/click/webhook", async (req, res) => {
  try {
    const data = req.body as Record<string, string>;
    const orderId = data.merchant_trans_id;

    if (data.action === "2") {
      await supabaseAdmin.from("payments").insert({
        order_id: orderId,
        provider: "click",
        amount: parseInt(data.amount),
        status: "completed",
        transaction_id: data.click_trans_id,
        raw_payload: data,
      });

      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", orderId);
    }

    return res.json({ error: 0, error_note: "Success" });
  } catch (err) {
    console.error("Click webhook xato:", err);
    return res.status(500).json({ error: -1, error_note: "Internal error" });
  }
});

// ─── Uzum webhook ────────────────────────────────────────────
paymentsRouter.post("/uzum/webhook", async (req, res) => {
  try {
    const data = req.body as Record<string, unknown>;
    const orderId = data.merchant_order_id as string;
    const status = data.status as string;

    if (status === "CONFIRMED") {
      await supabaseAdmin.from("payments").insert({
        order_id: orderId,
        provider: "uzum",
        amount: data.amount as number,
        status: "completed",
        transaction_id: data.transaction_id as string,
        raw_payload: data,
      });

      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", orderId);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Uzum webhook xato:", err);
    return res.status(500).json({ success: false });
  }
});
