import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// UZS formatida narx ko'rsatish: 1290000 → "1 290 000 so'm"
export function formatPrice(amount: number): string {
  return (
    new Intl.NumberFormat("uz-UZ", {
      maximumFractionDigits: 0,
    }).format(amount) + " so'm"
  );
}

// Qisqa format: 1290000 → "1 290 000"
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 0,
  }).format(amount);
}

// Telefon raqamni formatlash: +998901234567 → +998 (90) 123-45-67
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("998")) {
    return `+998 (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
  }
  return phone;
}

// Sana formatlab ko'rsatish
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

// Chegirma foizini hisoblash
export function discountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

// Supabase Storage URL'ni to'liq URL'ga aylantirish
export function getStorageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) return path;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
}

// Telefon raqamni normalize qilish: 901234567 → +998901234567
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("998")) return `+${cleaned}`;
  if (cleaned.length === 9) return `+998${cleaned}`;
  return `+${cleaned}`;
}

// Mahsulot narxini olish (price_override ni hisobga olgan holda)
export function getVariantPrice(
  basePrice: number,
  priceOverride: number | null
): number {
  return priceOverride ?? basePrice;
}
