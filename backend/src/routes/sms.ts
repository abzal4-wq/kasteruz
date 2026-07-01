import { Router } from "express";
import axios from "axios";

export const smsRouter = Router();

let eskizToken: string | null = null;
let eskizTokenExpiry: number = 0;

async function getEskizToken(): Promise<string> {
  if (eskizToken && Date.now() < eskizTokenExpiry) {
    return eskizToken;
  }

  const res = await axios.post<{ data: { token: string } }>(
    "https://notify.eskiz.uz/api/auth/login",
    {
      email: process.env.ESKIZ_EMAIL,
      password: process.env.ESKIZ_PASSWORD,
    }
  );

  eskizToken = res.data.data.token;
  eskizTokenExpiry = Date.now() + 28 * 24 * 60 * 60 * 1000; // 28 kun
  return eskizToken!;
}

export async function sendSms(phone: string, message: string): Promise<boolean> {
  try {
    const token = await getEskizToken();
    await axios.post(
      "https://notify.eskiz.uz/api/message/sms/send",
      {
        mobile_phone: phone.replace(/\D/g, ""),
        message,
        from: process.env.ESKIZ_SENDER_NAME ?? "4546",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return true;
  } catch (err) {
    console.error("SMS yuborishda xato:", err);
    return false;
  }
}

// POST /api/sms/otp — OTP yuborish (Supabase o'z OTP'sini ishlatadi,
// lekin custom SMS provayderiga yo'naltirish uchun)
smsRouter.post("/otp", async (req, res) => {
  const { phone } = req.body as { phone: string };
  if (!phone) return res.status(400).json({ error: "Telefon raqam kerak" });

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const message = `Kaster.uz: Tasdiqlash kodi: ${code}. 5 daqiqa amal qiladi.`;

  const sent = await sendSms(phone, message);
  if (!sent) return res.status(500).json({ error: "SMS yuborilmadi" });

  // Kodni vaqtinchalik saqlash (production'da Redis ishlatish kerak)
  // Bu yerda faqat demo uchun response'da yuboramiz
  return res.json({ success: true, code });
});

// POST /api/sms/order-notification — buyurtma xabari
smsRouter.post("/order-notification", async (req, res) => {
  const { phone, orderNumber, status } = req.body as {
    phone: string;
    orderNumber: string;
    status: string;
  };

  const statusMessages: Record<string, string> = {
    confirmed: `Buyurtmangiz #${orderNumber} tasdiqlandi. Tez orada yetkaziladi.`,
    shipped: `Buyurtmangiz #${orderNumber} yo'lda. Kuryerimiz siz bilan bog'lanadi.`,
    delivered: `Buyurtmangiz #${orderNumber} yetkazildi. Xarid uchun rahmat! Kaster.uz`,
    cancelled: `Buyurtmangiz #${orderNumber} bekor qilindi. Savollar uchun: +998 90 123 45 67`,
  };

  const message = statusMessages[status];
  if (!message) return res.status(400).json({ error: "Noma'lum status" });

  const sent = await sendSms(phone, message);
  return res.json({ success: sent });
});
