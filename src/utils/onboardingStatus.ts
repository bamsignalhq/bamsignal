import { STORAGE_KEYS } from "../constants/limits";
import { MIN_PROFILE_PHOTOS } from "../constants/photos";
import type { DatingProfile, UserProfile } from "../types";
import { clearPendingSignup } from "./signupPersistence";
import { clearFlowCompletionKeys } from "./flowWatchdog";
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
  "bamsignal_profile_draft"
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
  const onboardingComplete = Boolean(profile.onboardingComplete ?? profile.onboarding_completed);
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

export function hasMinimumProfileData(
  profile: Partial<DatingProfile>,
  user?: Pick<UserProfile, "name">
): boolean {
  const normalized = normalizeDatingProfile(profile);
  const photos = safePhotos(normalized.photos).filter(isPersistablePhotoUrl);
  const mainPhotoUrl = safeString(normalized.mainPhotoUrl);
  const hasPhotos =
    photos.length >= MIN_PROFILE_PHOTOS ||
    Boolean(mainPhotoUrl && isPersistablePhotoUrl(mainPhotoUrl));
  const hasLocation = Boolean(safeString(normalized.state) && safeString(normalized.city));
  const hasGender = Boolean(
    normalized.gender && normalized.gender !== ("Prefer not to say" as DatingProfile["gender"])
  );
  const hasAge = normalized.age >= 17;
  const hasName = user ? Boolean(safeString(user.name)?.trim()) : true;
  return hasName && hasAge && hasGender && hasLocation && hasPhotos;
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
  const resolved = normalizeDatingProfile(profile ?? readJson(STORAGE_KEYS.datingProfile, {}));
  return !isOnboardingFullyComplete(resolved, user);
}
