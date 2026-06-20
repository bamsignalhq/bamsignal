import { STORAGE_KEYS } from "../constants/limits";

export type FastConnectionExpiryReminder = "tomorrow" | "today" | null;

function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function shouldShowFastConnectionExpiryBanner(
  reminder: FastConnectionExpiryReminder
): boolean {
  if (!reminder || typeof window === "undefined") return false;

  const key = todayKey();
  if (reminder === "tomorrow") {
    const shown = localStorage.getItem(STORAGE_KEYS.fastConnectionExpiryReminderDate);
    if (shown === key) return false;
    localStorage.setItem(STORAGE_KEYS.fastConnectionExpiryReminderDate, key);
    return true;
  }

  const shown = localStorage.getItem(STORAGE_KEYS.fastConnectionExpiryTodayReminderDate);
  if (shown === key) return false;
  localStorage.setItem(STORAGE_KEYS.fastConnectionExpiryTodayReminderDate, key);
  return true;
}

export function expiryBannerCopy(reminder: FastConnectionExpiryReminder): string | null {
  if (reminder === "tomorrow") return "Fast Connection expires tomorrow.";
  if (reminder === "today") return "Fast Connection ends today.";
  return null;
}
