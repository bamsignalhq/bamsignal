import { STORAGE_KEYS } from "../constants/limits";
import { setPremiumSnapshot } from "../services/premiumStatus";
import { clearOnboardingDrafts } from "./onboardingDrafts";
import { clearOpenAppOnboardingCache } from "./openAppOnboardingCache";
import { clearPaymentSession } from "./paymentState";
import { clearPendingSignup } from "./signupPersistence";
import { writeJson } from "./storage";
import { clearMemberApiHeaderCache } from "./memberApiAuth";

const OPEN_APP_SESSION_KEYS = [
  "bamsignal-opening-state",
  "bamsignal-go-to-app-pending",
  "bamsignal-restore-pending"
] as const;

const USER_LOCAL_KEYS = [
  STORAGE_KEYS.datingProfile,
  STORAGE_KEYS.matchPreferences,
  STORAGE_KEYS.onboardingStep,
  STORAGE_KEYS.premiumUntil,
  STORAGE_KEYS.firstDayJourney,
  "bamsignal-open-app-onboarding-confirmed"
] as const;

/** Clear member-local caches on intentional logout (keep theme + username index). */
export function clearMemberSessionCaches(): void {
  writeJson(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  clearOnboardingDrafts();
  clearOpenAppOnboardingCache();
  clearPaymentSession();
  clearPendingSignup();
  setPremiumSnapshot({ isPremium: false, premiumUntil: null });
  clearMemberApiHeaderCache();

  for (const key of USER_LOCAL_KEYS) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  for (const key of OPEN_APP_SESSION_KEYS) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
