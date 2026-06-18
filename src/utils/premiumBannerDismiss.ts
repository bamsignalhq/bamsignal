import { STORAGE_KEYS } from "../constants/limits";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function isHomePremiumBannerDismissed(): boolean {
  const raw = localStorage.getItem(STORAGE_KEYS.premiumBannerDismissedUntil);
  if (!raw) return false;
  const until = Number(raw);
  if (!Number.isFinite(until)) {
    localStorage.removeItem(STORAGE_KEYS.premiumBannerDismissedUntil);
    return false;
  }
  if (Date.now() >= until) {
    localStorage.removeItem(STORAGE_KEYS.premiumBannerDismissedUntil);
    return false;
  }
  return true;
}

export function dismissHomePremiumBanner(): void {
  localStorage.setItem(
    STORAGE_KEYS.premiumBannerDismissedUntil,
    String(Date.now() + SEVEN_DAYS_MS)
  );
}
