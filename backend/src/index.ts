import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ordersRouter } from "./routes/orders";
import { paymentsRouter } from "./routes/payments";
import { smsRouter } from "./routes/sms";
import { inventoryRouter } from "./routes/inventory";

const app = express();
const PORT = process.env.PORT ?? 4000;

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? ["https://kaster.uz", "https://www.kaster.uz"]
      : ["http://localhost:5173"],
    credentials: true,
  })
);

// To'lov webhook'lari raw body talab qiladi
app.use("/api/payments/payme/webhook", express.raw({ type: "*/*" }));
app.use("/api/payments/click/webhook", express.raw({ type: "*/*" }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/sms", smsRouter);
app.use("/api/inventory", inventoryRouter);

// ─── Health check ────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ─── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ─── Global error handler ────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`Kaster.uz backend: http://localhost:${PORT}`);
});

export default app;
