import { STORAGE_KEYS } from "../constants/limits";
import { clearPendingSignup } from "./signupPersistence";
import { clearFlowCompletionKeys } from "./flowWatchdog";

const STALE_ONBOARDING_KEYS = [
  STORAGE_KEYS.onboardingStep,
  STORAGE_KEYS.pendingSignup,
  "bamsignal-onboarding-draft",
  "bamsignal-signup-draft",
  "bamsignal-setup-step",
  "bamsignal_onboarding_draft",
  "bamsignal_signup_draft",
  "bamsignal_setup_step",
  "bamsignal_onboarding_step",
  "bamsignal_current_step",
  "bamsignal_profile_draft",
  "bamsignal_flow_state"
] as const;

export function clearOnboardingDrafts(): void {
  for (const key of STALE_ONBOARDING_KEYS) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  clearPendingSignup();
  clearFlowCompletionKeys();
}
