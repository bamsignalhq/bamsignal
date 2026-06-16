import { FREE_DAILY_SWIPES, STORAGE_KEYS } from "../constants/limits";
import type { UserProfile } from "../types";
import { getViewerBoostSummary } from "./activeBoosts";
import { getRemainingDaily, incrementDailyCount, readDailyCount } from "./storage";

export function getFreeSignalsRemaining(isPremium: boolean): number {
  if (isPremium) return FREE_DAILY_SWIPES;
  return getRemainingDaily(STORAGE_KEYS.dailySwipes, FREE_DAILY_SWIPES);
}

export function getFreeSignalsUsedToday(isPremium: boolean): number {
  if (isPremium) return 0;
  return Math.min(FREE_DAILY_SWIPES, FREE_DAILY_SWIPES - getFreeSignalsRemaining(false));
}

/** e.g. "4/5" for Home signal counter */
export function signalsLeftTodayDisplay(isPremium: boolean): string {
  if (isPremium) return "Unlimited";
  const left = getFreeSignalsRemaining(false);
  return `${left}/${FREE_DAILY_SWIPES}`;
}

export function signalsRemainingLabel(isPremium: boolean): string | null {
  if (isPremium) return null;
  const left = getFreeSignalsRemaining(false);
  if (left <= 0) return "No Signals left";
  return `${left} Signal${left === 1 ? "" : "s"} left`;
}

export function signalLimitReachedMessage(): string {
  return "You've used today's free signals.";
}

export function signalLimitReachedHint(): string {
  return "Signal Pass lets you keep connecting.";
}

export type SignalGateResult =
  | { allowed: true; usesDailySlot: boolean }
  | { allowed: false; reason: "limit" };

/** Whether the viewer may send a signal (regular or priority). */
export function evaluateSignalGate(
  isPremium: boolean,
  user: Pick<UserProfile, "email" | "phone" | "username">,
  options?: { priority?: boolean }
): SignalGateResult {
  if (isPremium) return { allowed: true, usesDailySlot: false };

  const remaining = getFreeSignalsRemaining(false);
  if (remaining > 0) return { allowed: true, usesDailySlot: true };

  if (options?.priority && getViewerBoostSummary(user).priorityPending) {
    return { allowed: true, usesDailySlot: false };
  }

  return { allowed: false, reason: "limit" };
}

export function recordSignalUsage(isPremium: boolean, usesDailySlot: boolean): void {
  if (isPremium || !usesDailySlot) return;
  incrementDailyCount(STORAGE_KEYS.dailySwipes);
}

export function isAtFreeSignalLimit(isPremium: boolean): boolean {
  if (isPremium) return false;
  return readDailyCount(STORAGE_KEYS.dailySwipes) >= FREE_DAILY_SWIPES;
}
