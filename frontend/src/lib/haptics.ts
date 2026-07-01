// Haptic feedback — mobil qurilmalarda yengil tebranish (native his)
// navigator.vibrate qo'llab-quvvatlanmasa, jim o'tadi.

type HapticKind = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "select";

const PATTERNS: Record<HapticKind, number | number[]> = {
  light: 8,
  medium: 14,
  heavy: 24,
  select: 5,
  success: [10, 40, 16],
  warning: [16, 50, 16],
  error: [24, 40, 24, 40, 24],
};

let enabled = true;

export function setHapticsEnabled(v: boolean) {
  enabled = v;
}

export function haptic(kind: HapticKind = "light") {
  if (!enabled) return;
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(PATTERNS[kind]);
    }
  } catch {
    /* ignore */
  }
}
