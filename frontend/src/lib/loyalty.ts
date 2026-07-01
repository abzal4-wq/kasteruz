// Loyallik / a'zolik darajalari — total_spent asosida
export interface Tier {
  id: string;
  name: string;
  min: number;
  next: number | null;
  gradient: string;
  accent: string;
  perk: string;
}

export const TIERS: Tier[] = [
  { id: "bronze",   name: "Bronza",   min: 0,         next: 3_000_000,  gradient: "linear-gradient(135deg,#6B4F35 0%,#3D2C1C 100%)", accent: "#C89B6B", perk: "Standart yetkazib berish" },
  { id: "silver",   name: "Kumush",   min: 3_000_000, next: 10_000_000, gradient: "linear-gradient(135deg,#8A8A92 0%,#4A4A52 100%)", accent: "#D8D8E0", perk: "5% doimiy chegirma" },
  { id: "gold",     name: "Oltin",    min: 10_000_000, next: 25_000_000, gradient: "linear-gradient(135deg,#C9A24B 0%,#7A5C1E 100%)", accent: "#F0D592", perk: "10% chegirma · bepul yetkazish" },
  { id: "platinum", name: "Platina",  min: 25_000_000, next: null,       gradient: "linear-gradient(135deg,#3A4A5A 0%,#1A2430 100%)", accent: "#A8C4DC", perk: "15% chegirma · VIP xizmat" },
];

export function getTier(totalSpent: number): Tier {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (totalSpent >= t.min) tier = t;
  }
  return tier;
}

// Ball: har 10 000 so'mga 1 ball
export function getPoints(totalSpent: number): number {
  return Math.floor(totalSpent / 10_000);
}

// Keyingi darajagacha progress (0..1)
export function tierProgress(totalSpent: number): number {
  const tier = getTier(totalSpent);
  if (tier.next == null) return 1;
  const span = tier.next - tier.min;
  return Math.min(1, Math.max(0, (totalSpent - tier.min) / span));
}
