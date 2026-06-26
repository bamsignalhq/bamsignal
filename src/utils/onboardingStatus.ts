import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, UserProfile } from "../types";
import { hasRequiredProfileBasics } from "./buildProfileLater";
import { readJson } from "./storage";
import {
  isProfileOnboardingMarkedComplete,
  mergeOnboardingCompleteFlag,
  normalizeOnboardingStatus,
  type OnboardingStatusSnapshot
} from "./onboardingFlags";
import {
  isPlaceholderCity,
  isPlaceholderName,
  isTemplateProfileValue,
  looksLikeSavedOnboardingProgress,
  PROFILE_TEMPLATE_DEFAULT_AGE,
  PROFILE_TEMPLATE_DEFAULT_GENDER,
  PROFILE_TEMPLATE_DEFAULT_STATE
} from "./onboardingPlaceholders";

export type { OnboardingStatusSnapshot };
export {
  isProfileOnboardingMarkedComplete,
  mergeOnboardingCompleteFlag,
  normalizeOnboardingStatus,
  isPlaceholderCity,
  isPlaceholderName,
  isTemplateProfileValue,
  looksLikeSavedOnboardingProgress,
  PROFILE_TEMPLATE_DEFAULT_AGE,
  PROFILE_TEMPLATE_DEFAULT_GENDER,
  PROFILE_TEMPLATE_DEFAULT_STATE
};
export { clearOnboardingDrafts } from "./onboardingDrafts";

export function hasMinimumProfileData(
  profile: Partial<DatingProfile>,
  user?: Pick<UserProfile, "name">
): boolean {
  return hasRequiredProfileBasics(profile, user);
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

export function shouldRouteToOnboarding(
  _user: Pick<UserProfile, "name" | "email" | "phone">,
  profile?: Partial<DatingProfile>,
  options?: { forceOnboarding?: boolean }
): boolean {
  if (options?.forceOnboarding) return true;
  const resolved = profile ?? readJson<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {});
  return !isProfileOnboardingMarkedComplete(resolved);
}
