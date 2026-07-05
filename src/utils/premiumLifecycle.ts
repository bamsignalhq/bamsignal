import { STORAGE_KEYS } from "../constants/limits";
import type { PremiumRenewalStage } from "./premiumRenewal";

function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function storageKeyForStage(stage: PremiumRenewalStage): string | null {
  switch (stage) {
    case "seven_days":
      return STORAGE_KEYS.premiumRenewalSevenDayDate;
    case "three_days":
      return STORAGE_KEYS.premiumRenewalThreeDayDate;
    case "one_day":
      return STORAGE_KEYS.premiumRenewalOneDayDate;
    case "expiry":
      return STORAGE_KEYS.premiumRenewalExpiryDate;
    case "grace":
      return STORAGE_KEYS.premiumRenewalGraceDate;
    default:
      return null;
  }
}

export function shouldShowPremiumRenewalBanner(stage: PremiumRenewalStage): boolean {
  if (typeof window === "undefined") return false;
  const key = storageKeyForStage(stage);
  if (!key) return false;

  const today = todayKey();
  if (localStorage.getItem(key) === today) return false;
  localStorage.setItem(key, today);
  return true;
}
