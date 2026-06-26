import { STORAGE_KEYS } from "../constants/limits";
import { setPremiumSnapshot } from "../services/premiumStatus";
import { clearPaymentSession } from "./paymentState";
import { clearPendingSignup } from "./signupPersistence";
import { writeJson } from "./storage";
import { clearMemberApiHeaderCache } from "./memberApiAuth";

/** Clear member-local caches on intentional logout (keep theme + username index). */
export function clearMemberSessionCaches(): void {
  writeJson(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  localStorage.removeItem(STORAGE_KEYS.datingProfile);
  localStorage.removeItem(STORAGE_KEYS.matchPreferences);
  localStorage.removeItem(STORAGE_KEYS.onboardingStep);
  clearPaymentSession();
  clearPendingSignup();
  localStorage.removeItem(STORAGE_KEYS.premiumUntil);
  localStorage.removeItem(STORAGE_KEYS.firstDayJourney);
  setPremiumSnapshot({ isPremium: false, premiumUntil: null });
  clearMemberApiHeaderCache();
}
