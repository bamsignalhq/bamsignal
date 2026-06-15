import { STORAGE_KEYS } from "../constants/limits";
import { normalizeDatingProfile } from "./profile";
import { readJson } from "./storage";

/** Member city from dating/onboarding profile, or empty string. */
export function getMemberCity(): string {
  const dating = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
  return dating.city?.trim() || "";
}

/** e.g. "Abuja" or "your city" when unset. */
export function memberCityLabel(): string {
  return getMemberCity() || "your city";
}
