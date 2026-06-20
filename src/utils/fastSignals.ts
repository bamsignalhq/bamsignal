import { STORAGE_KEYS } from "../constants/limits";
import { FAST_CONNECTION_DAILY_SIGNALS } from "./fastConnectionState";

export type FastSignalStatus = {
  passActive: boolean;
  expired?: boolean;
  expiresAt?: string | null;
  startsAt?: string | null;
  expiryReminder?: "tomorrow" | "today" | null;
  usedToday: number;
  dailyLimit: number;
  remaining: number;
  resetAt: string | null;
  freshDailyReset?: boolean;
};

export function syncFastSignalStatusFromServer(status: Partial<FastSignalStatus>): FastSignalStatus {
  const dailyLimit = Math.max(1, Number(status.dailyLimit) || FAST_CONNECTION_DAILY_SIGNALS);
  const usedToday = Math.max(0, Number(status.usedToday) || 0);
  const remaining = Math.max(0, Number(status.remaining ?? dailyLimit - usedToday));
  const resetAt = status.resetAt ? String(status.resetAt) : null;

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.fastSignalsUsedToday, String(usedToday));
    localStorage.setItem(STORAGE_KEYS.fastSignalsDailyLimit, String(dailyLimit));
    if (resetAt) localStorage.setItem(STORAGE_KEYS.fastSignalsResetAt, resetAt);
    if (status.expiresAt) {
      localStorage.setItem(STORAGE_KEYS.fastConnectionExpiresAt, String(status.expiresAt));
    }
  }

  return {
    passActive: Boolean(status.passActive),
    expired: Boolean(status.expired),
    expiresAt: status.expiresAt ?? null,
    startsAt: status.startsAt ?? null,
    expiryReminder: status.expiryReminder ?? null,
    usedToday,
    dailyLimit,
    remaining,
    resetAt,
    freshDailyReset: Boolean(status.freshDailyReset)
  };
}

export function readLocalFastSignalStatus(): FastSignalStatus {
  if (typeof window === "undefined") {
    return {
      passActive: false,
      usedToday: 0,
      dailyLimit: FAST_CONNECTION_DAILY_SIGNALS,
      remaining: FAST_CONNECTION_DAILY_SIGNALS,
      resetAt: null
    };
  }

  const now = Date.now();
  const resetRaw = localStorage.getItem(STORAGE_KEYS.fastSignalsResetAt);
  const resetMs = resetRaw ? new Date(resetRaw).getTime() : 0;
  if (resetMs && resetMs <= now) {
    localStorage.setItem(STORAGE_KEYS.fastSignalsUsedToday, "0");
    localStorage.setItem(
      STORAGE_KEYS.fastSignalsResetAt,
      new Date(now + 24 * 60 * 60 * 1000).toISOString()
    );
  }

  const dailyLimit = Math.max(
    1,
    Number(localStorage.getItem(STORAGE_KEYS.fastSignalsDailyLimit)) || FAST_CONNECTION_DAILY_SIGNALS
  );
  const usedToday = Math.max(0, Number(localStorage.getItem(STORAGE_KEYS.fastSignalsUsedToday)) || 0);

  return {
    passActive: true,
    usedToday,
    dailyLimit,
    remaining: Math.max(0, dailyLimit - usedToday),
    resetAt: localStorage.getItem(STORAGE_KEYS.fastSignalsResetAt)
  };
}

export function fastSignalsLeftLabel(remaining: number): string {
  const count = Math.max(0, Math.round(remaining));
  return count === 1 ? "1 Fast Signal left" : `${count} Fast Signals left`;
}

export function fastSignalsStatusLabel(
  remaining: number,
  dailyLimit: number,
  usedToday: number
): string {
  if (usedToday <= 0 && remaining >= dailyLimit) {
    return `${dailyLimit} Fast Signals available today.`;
  }
  return fastSignalsLeftLabel(remaining);
}
