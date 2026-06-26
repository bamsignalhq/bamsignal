import type { DatingProfile } from "../types";
import { isPersistablePhotoUrl, safePhotos, safeString } from "./safeProfile";
import { isProfileOnboardingMarkedComplete } from "./onboardingFlags";

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
