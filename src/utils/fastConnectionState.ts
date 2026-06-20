import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile } from "../types";
import { isQuickiePassActive, quickiePassDays } from "./quickie";

export const FAST_CONNECTION_DAILY_SIGNALS = 30;
export const FAST_CONNECTION_SNOOZE_MS = 24 * 60 * 60 * 1000;

export function isFastConnectionInterested(profile: Pick<DatingProfile, "fastConnectionInterested">): boolean {
  return profile.fastConnectionInterested === true;
}

export function isFastConnectionActivationSnoozed(now = Date.now()): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(STORAGE_KEYS.fastConnectionActivationSnoozedUntil);
  const until = Number(raw);
  return Number.isFinite(until) && until > now;
}

export function snoozeFastConnectionActivation(now = Date.now()): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEYS.fastConnectionActivationSnoozedUntil,
    String(now + FAST_CONNECTION_SNOOZE_MS)
  );
}

export function shouldShowFastConnectionActivationPrompt(
  profile: Pick<DatingProfile, "fastConnectionInterested">
): boolean {
  if (!isFastConnectionInterested(profile)) return false;
  if (isQuickiePassActive()) return false;
  if (isFastConnectionActivationSnoozed()) return false;
  return true;
}

/** Reset daily Fast Signal counters when a pass is activated or renewed. */
export function activateFastConnectionEntitlements(passUntilIso?: string): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const passDays = quickiePassDays();
  const expiresAt =
    passUntilIso ||
    new Date(now + passDays * 24 * 60 * 60 * 1000).toISOString();

  localStorage.setItem(STORAGE_KEYS.fastConnectionStartsAt, new Date(now).toISOString());
  localStorage.setItem(STORAGE_KEYS.fastConnectionExpiresAt, expiresAt);
  localStorage.setItem(STORAGE_KEYS.fastSignalsUsedToday, "0");
  localStorage.setItem(STORAGE_KEYS.fastSignalsDailyLimit, String(FAST_CONNECTION_DAILY_SIGNALS));
  localStorage.setItem(
    STORAGE_KEYS.fastSignalsResetAt,
    new Date(now + 24 * 60 * 60 * 1000).toISOString()
  );
  localStorage.removeItem(STORAGE_KEYS.fastConnectionActivationSnoozedUntil);
}
