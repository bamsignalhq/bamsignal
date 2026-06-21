import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, UserProfile } from "../types";
import { clearPendingSignup } from "./signupPersistence";
import { clearFlowCompletionKeys } from "./flowWatchdog";
import { hasRequiredProfileBasics } from "./buildProfileLater";
import { isPersistablePhotoUrl, safePhotos, safeString } from "./safeProfile";
import { readJson } from "./storage";
import { normalizeDatingProfile } from "./profile";

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

export type OnboardingStatusSnapshot = {
  markedComplete: boolean;
  onboardingComplete: boolean;
  setupCompleted: boolean;
  profileCompletedAt?: string;
  onboardingCompletedAt?: string;
  completedAt?: string;
};

/** Normalize completion flags across camelCase and snake_case variants. */
export function normalizeOnboardingStatus(
  raw: Partial<DatingProfile> | Record<string, unknown> | null | undefined
): OnboardingStatusSnapshot {
  const profile = (raw ?? {}) as Record<string, unknown>;
  const onboardingComplete = Boolean(
    profile.onboardingComplete ?? profile.onboardingCompleted ?? profile.onboarding_completed
  );
  const setupCompleted = Boolean(profile.setupCompleted ?? profile.setup_completed);
  const profileCompletedAt =
    safeString(profile.profileCompletedAt ?? profile.profile_completed_at) || undefined;
  const onboardingCompletedAt =
    safeString(profile.onboardingCompletedAt ?? profile.onboarding_completed_at) || undefined;
  const completedAt = safeString(profile.completedAt ?? profile.completed_at) || undefined;
  const markedComplete = Boolean(
    onboardingComplete || setupCompleted || profileCompletedAt || onboardingCompletedAt || completedAt
  );

  return {
    markedComplete,
    onboardingComplete: markedComplete || onboardingComplete,
    setupCompleted: markedComplete || setupCompleted,
    profileCompletedAt,
    onboardingCompletedAt,
    completedAt
  };
}

export const PROFILE_TEMPLATE_DEFAULT_AGE = 25;
export const PROFILE_TEMPLATE_DEFAULT_STATE = "abia";
export const PROFILE_TEMPLATE_DEFAULT_GENDER = "man";

export function isPlaceholderName(name?: string): boolean {
  const value = safeString(name).trim().toLowerCase();
  return !value || value === "member";
}

export function isPlaceholderCity(city?: string): boolean {
  const value = safeString(city).trim().toLowerCase();
  return !value || value === "select city";
}

export function isTemplateProfileValue(
  field: "age" | "gender" | "state",
  value: unknown
): boolean {
  if (field === "age") return Number(value) === PROFILE_TEMPLATE_DEFAULT_AGE;
  if (field === "gender") return safeString(value).trim().toLowerCase() === PROFILE_TEMPLATE_DEFAULT_GENDER;
  if (field === "state") return safeString(value).trim().toLowerCase() === PROFILE_TEMPLATE_DEFAULT_STATE;
  return false;
}

export function looksLikeSavedOnboardingProgress(stored: Partial<DatingProfile>): boolean {
  if (isProfileOnboardingMarkedComplete(stored)) return true;
  if (safeString(stored.city) && !isPlaceholderCity(stored.city)) return true;
  if (safePhotos(stored.photos).filter(isPersistablePhotoUrl).length > 0) return true;
  if (safeString(stored.bio)) return true;
  if (stored.interestsTouched) return true;
  if (stored.age !== undefined && !isTemplateProfileValue("age", stored.age)) return true;
  if (stored.state && !isTemplateProfileValue("state", stored.state)) return true;
  if (stored.gender && !isTemplateProfileValue("gender", stored.gender)) return true;
  return false;
}

export function hasMinimumProfileData(
  profile: Partial<DatingProfile>,
  user?: Pick<UserProfile, "name">
): boolean {
  return hasRequiredProfileBasics(profile, user);
}

export function isProfileOnboardingMarkedComplete(profile: Partial<DatingProfile>): boolean {
  return normalizeOnboardingStatus(profile).markedComplete;
}

export function isOnboardingFullyComplete(
  profile: Partial<DatingProfile>,
  user?: Pick<UserProfile, "name">
): boolean {
  if (isProfileOnboardingMarkedComplete(profile)) return true;
  return hasMinimumProfileData(profile, user);
}

export function profileQualifiesForLegacyRepair(
  profile: Partial<DatingProfile>,
  user?: Pick<UserProfile, "name">
): boolean {
  if (isProfileOnboardingMarkedComplete(profile)) return false;
  return hasMinimumProfileData(profile, user);
}

export function repairCompletedProfile(
  profile: Partial<DatingProfile>,
  user?: Pick<UserProfile, "name">
): {
  profile: DatingProfile;
  repaired: boolean;
} {
  const normalized = normalizeDatingProfile(profile);
  if (!profileQualifiesForLegacyRepair(normalized, user)) {
    return { profile: normalized, repaired: false };
  }

  clearOnboardingDrafts();
  const now = new Date().toISOString();
  const status = normalizeOnboardingStatus(normalized);
  return {
    profile: normalizeDatingProfile({
      ...normalized,
      onboardingComplete: true,
      setupCompleted: true,
      onboardingCompletedAt: status.onboardingCompletedAt || now,
      profileCompletedAt: status.profileCompletedAt || now,
      completedAt: status.completedAt || now
    }),
    repaired: true
  };
}

export function mergeOnboardingCompleteFlag(
  local: Partial<DatingProfile>,
  remote: Partial<DatingProfile>
): boolean {
  return (
    normalizeOnboardingStatus(remote).markedComplete || normalizeOnboardingStatus(local).markedComplete
  );
}

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

export function logRouteDecision(
  user: Pick<UserProfile, "email" | "phone" | "name">,
  profile: Partial<DatingProfile>,
  route: "home" | "onboarding",
  extra?: Record<string, unknown>
): void {
  if (!import.meta.env.DEV) return;
  const normalized = normalizeDatingProfile(profile);
  const status = normalizeOnboardingStatus(normalized);
  const userId = user.email || user.phone || "unknown";
  const photos = safePhotos(normalized.photos).filter(isPersistablePhotoUrl);
  console.info("[route-decision] userId", userId);
  console.info("[route-decision] profile exists", Boolean(profile && Object.keys(profile).length));
  console.info("[route-decision] onboardingCompleted", status.onboardingComplete);
  console.info("[route-decision] setupCompleted", status.setupCompleted);
  console.info("[route-decision] profileCompletedAt", status.profileCompletedAt ?? null);
  console.info("[route-decision] photos count", photos.length);
  console.info("[route-decision] final route", route);
  if (extra && Object.keys(extra).length) {
    console.info("[route-decision] context", extra);
  }
}

export function shouldRouteToOnboarding(
  user: Pick<UserProfile, "name" | "email" | "phone">,
  profile?: Partial<DatingProfile>,
  options?: { forceOnboarding?: boolean }
): boolean {
  if (options?.forceOnboarding) return true;
  const resolved = profile ?? readJson<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {});
  // Server-synced completion flags only — never infer from template UI defaults (Member/25/Man/Abia).
  return !isProfileOnboardingMarkedComplete(resolved);
}
