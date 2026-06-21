import type { DatingProfile, UserProfile } from "../types";
import { isPersistablePhotoUrl, safeArray, safePhotos, safeString } from "./safeProfile";
import {
  isPlaceholderCity,
  isPlaceholderName,
  isTemplateProfileValue
} from "./onboardingStatus";
import { calculateProfileStrength, getProfileStrengthLevel } from "./profileStrength";

export const ONBOARDING_REQUIRED_PHOTOS = 1;

const REMINDER_DISMISS_KEY = "bamsignal_profile_reminder_dismissed_at";
const REMINDER_COOLDOWN_MS = 48 * 60 * 60 * 1000;

/** Reserved for future insights — not shown yet. */
export type ProfileBuildFutureInsights = {
  responseRate?: number;
  visibilityLift?: number;
  popularityRank?: number;
  compatibilityHints?: string[];
};

export function hasRequiredProfileBasics(
  profile: Partial<DatingProfile>,
  user?: Pick<UserProfile, "name">
): boolean {
  const raw = profile ?? {};
  const photos = safePhotos(raw.photos).filter(isPersistablePhotoUrl);
  const mainPhotoUrl = safeString(raw.mainPhotoUrl);
  const hasPhotos =
    photos.length >= ONBOARDING_REQUIRED_PHOTOS ||
    Boolean(mainPhotoUrl && isPersistablePhotoUrl(mainPhotoUrl));
  const state = safeString(raw.state);
  const city = safeString(raw.city);
  const hasState = Boolean(state && !isTemplateProfileValue("state", state));
  const hasLocation = hasState && Boolean(city && !isPlaceholderCity(city));
  const gender = safeString(raw.gender);
  const hasGender =
    Boolean(gender && gender !== ("Prefer not to say" as DatingProfile["gender"])) &&
    !isTemplateProfileValue("gender", gender);
  const age = Number(raw.age);
  const hasAge = Number.isFinite(age) && age >= 17 && !isTemplateProfileValue("age", age);
  const hasName = user ? !isPlaceholderName(user.name) : true;
  const hasRelationshipGoal = safeArray(raw.intents).length >= 1;
  return hasName && hasAge && hasGender && hasLocation && hasPhotos && hasRelationshipGoal;
}

export function isBelowExcellentStrength(
  profile: DatingProfile,
  options?: { phoneVerified?: boolean; isPremium?: boolean }
): boolean {
  const score = calculateProfileStrength(profile, options);
  const level = getProfileStrengthLevel(score);
  return level.tier !== "excellent" && level.tier !== "outstanding";
}

export function shouldShowProfileReminder(): boolean {
  try {
    const raw = localStorage.getItem(REMINDER_DISMISS_KEY);
    if (!raw) return true;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return true;
    return Date.now() - dismissedAt >= REMINDER_COOLDOWN_MS;
  } catch {
    return true;
  }
}

export function dismissProfileReminder(): void {
  try {
    localStorage.setItem(REMINDER_DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore storage failures
  }
}
