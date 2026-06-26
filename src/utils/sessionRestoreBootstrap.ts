import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, UserProfile } from "../types";
import { isProfileOnboardingMarkedComplete } from "./onboardingFlags";
import { readJson } from "./storage";
import { safeUserProfile } from "./safeProfile";

export type CachedMemberSession = {
  profile: UserProfile;
  hasSession: boolean;
  profileCompleteKnown: boolean;
};

export function readCachedMemberSession(): CachedMemberSession {
  const profile = safeUserProfile(
    readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" })
  );
  const hasSession = Boolean(profile.email?.trim());
  const datingProfile = readJson<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {});
  return {
    profile,
    hasSession,
    profileCompleteKnown: isProfileOnboardingMarkedComplete(datingProfile)
  };
}
