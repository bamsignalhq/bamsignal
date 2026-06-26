import { Capacitor } from "@capacitor/core";

export type MemberHapticPattern = "light" | "medium" | "heavy";

const VIBRATE_MS: Record<MemberHapticPattern, number> = {
  light: 12,
  medium: 22,
  heavy: 36
};

/** Light tap — button success, toggles. Gracefully no-ops when unsupported. */
export function hapticLight(): void {
  runHaptic("light");
}

/** Medium — signal sent, photo saved. */
export function hapticMedium(): void {
  runHaptic("medium");
}

/** Heavy — verification approved, major milestone. */
export function hapticHeavy(): void {
  runHaptic("heavy");
}

function runHaptic(pattern: MemberHapticPattern): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (!Capacitor.isNativePlatform() && !/Android/i.test(navigator.userAgent)) return;
  try {
    navigator.vibrate(VIBRATE_MS[pattern]);
  } catch {
    /* unsupported */
  }
}
