// To'lov provayderlariga yo'naltirish URL'larini yaratish

// Merchant ID haqiqiy sozlanganmi? (placeholder yoki bo'sh emasmi)
function isSet(v: string | undefined): boolean {
  return !!v && !v.includes("your-") && v.trim() !== "";
}

// Onlayn to'lov usuli sozlanganmi?
export function isPaymentConfigured(method: "cash" | "payme" | "click" | "uzum"): boolean {
  switch (method) {
    case "cash":
      return true;
    case "payme":
      return isSet(import.meta.env.VITE_PAYME_MERCHANT_ID);
    case "click":
      return isSet(import.meta.env.VITE_CLICK_SERVICE_ID) && isSet(import.meta.env.VITE_CLICK_MERCHANT_ID);
    case "uzum":
      return isSet(import.meta.env.VITE_UZUM_MERCHANT_ID);
  }
}


// Payme: narx tiyinlarda (UZS × 100)
export function buildPaymeUrl(orderId: string, amountUzs: number): string {
  const merchantId = import.meta.env.VITE_PAYME_MERCHANT_ID ?? "";
  const amountTiyin = amountUzs * 100;
  const params = btoa(
    `m=${merchantId};ac.order_id=${orderId};a=${amountTiyin};l=uz`
  );
  return `https://checkout.paycom.uz/${params}`;
}

// Click: to'lov sahifasi
export function buildClickUrl(orderId: string, amountUzs: number): string {
  const serviceId = import.meta.env.VITE_CLICK_SERVICE_ID ?? "";
  const merchantId = import.meta.env.VITE_CLICK_MERCHANT_ID ?? "";
  return (
    `https://my.click.uz/services/pay?service_id=${serviceId}` +
    `&merchant_id=${merchantId}` +
    `&amount=${amountUzs}` +
    `&transaction_param=${orderId}` +
    `&return_url=${encodeURIComponent(window.location.origin + "/order-success/" + orderId)}`
  );
}

// Uzum (Apelsin): to'lov sahifasi
export function buildUzumUrl(orderId: string, amountUzs: number): string {
  const merchantId = import.meta.env.VITE_UZUM_MERCHANT_ID ?? "";
  return (
    `https://checkout.uzumbank.uz/open-api/checkout?` +
    `merchantId=${merchantId}&orderId=${orderId}&amount=${amountUzs * 100}`
  );
}

export function getPaymentUrl(
  method: "payme" | "click" | "uzum",
  orderId: string,
  amountUzs: number
): string {
  switch (method) {
    case "payme":
      return buildPaymeUrl(orderId, amountUzs);
    case "click":
      return buildClickUrl(orderId, amountUzs);
    case "uzum":
      return buildUzumUrl(orderId, amountUzs);
  }
}
