/**
 * Legacy open-app completion cache — DISABLED for routing.
 * Onboarding completion is decided only by the database via /api/member/data?action=onboarding-status.
 * These helpers remain as no-ops / clearers so logout and old keys stay cleaned up.
 */

const CACHE_STORAGE_KEY = "bamsignal-open-app-onboarding-confirmed";

/** Always false — client cache must never confirm onboarding completion. */
export function readOpenAppOnboardingCache(_userId = ""): boolean {
  return false;
}

/** No-op — do not persist completion on the client. */
export function writeOpenAppOnboardingCache(_userId = ""): void {
  /* intentionally disabled */
}

export function clearOpenAppOnboardingCache(_userId = ""): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export const OPEN_APP_ONBOARDING_CACHE_TTL_MS = 0;
