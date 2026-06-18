import { STORAGE_KEYS } from "../constants/limits";
import { MIN_PROFILE_PHOTOS } from "../constants/photos";
import type { DatingProfile } from "../types";
import { clearPendingSignup } from "./signupPersistence";
import { isPersistablePhotoUrl, safePhotos, safeString } from "./safeProfile";
import { readJson } from "./storage";
import { normalizeDatingProfile } from "./profile";

const ONBOARDING_FINAL_STEP = 3;

export function hasMinimumProfileData(profile: Partial<DatingProfile>): boolean {
  const normalized = normalizeDatingProfile(profile);
  const photos = safePhotos(normalized.photos).filter(isPersistablePhotoUrl);
  const hasLocation = Boolean(safeString(normalized.state) && safeString(normalized.city));
  const hasGender = Boolean(normalized.gender && normalized.gender !== ("Prefer not to say" as DatingProfile["gender"]));
  const hasAge = normalized.age >= 17;
  return hasAge && hasGender && hasLocation && photos.length >= MIN_PROFILE_PHOTOS;
}

export function isProfileOnboardingMarkedComplete(profile: Partial<DatingProfile>): boolean {
  return Boolean(
    profile.onboardingComplete ||
      profile.setupCompleted ||
      profile.profileCompletedAt ||
      profile.onboardingCompletedAt ||
      profile.completedAt
  );
}

export function isOnboardingFullyComplete(profile: Partial<DatingProfile>): boolean {
  if (isProfileOnboardingMarkedComplete(profile)) return true;
  return hasMinimumProfileData(profile) && Boolean(safeString(profile.bio)?.trim());
}

export function hasActiveOnboardingDraft(): boolean {
  const step = readJson<number>(STORAGE_KEYS.onboardingStep, -1);
  return Number.isFinite(step) && step >= 0 && step < ONBOARDING_FINAL_STEP;
}

export function profileQualifiesForLegacyRepair(profile: Partial<DatingProfile>): boolean {
  if (isProfileOnboardingMarkedComplete(profile)) return false;
  if (!hasMinimumProfileData(profile)) return false;
  if (hasActiveOnboardingDraft()) return false;
  return true;
}

export function repairCompletedProfile(profile: Partial<DatingProfile>): {
  profile: DatingProfile;
  repaired: boolean;
} {
  const normalized = normalizeDatingProfile(profile);
  if (!profileQualifiesForLegacyRepair(normalized)) {
    return { profile: normalized, repaired: false };
  }

  const now = new Date().toISOString();
  return {
    profile: normalizeDatingProfile({
      ...normalized,
      onboardingComplete: true,
      setupCompleted: true,
      onboardingCompletedAt: normalized.onboardingCompletedAt || now,
      profileCompletedAt: normalized.profileCompletedAt || now,
      completedAt: normalized.completedAt || now
    }),
    repaired: true
  };
}

export function mergeOnboardingCompleteFlag(
  local: Partial<DatingProfile>,
  remote: Partial<DatingProfile>
): boolean {
  return Boolean(
    remote.onboardingComplete ||
      local.onboardingComplete ||
      isProfileOnboardingMarkedComplete(remote) ||
      isProfileOnboardingMarkedComplete(local)
  );
}

export function clearOnboardingDrafts(): void {
  localStorage.removeItem(STORAGE_KEYS.onboardingStep);
  clearPendingSignup();
}
