import { STORAGE_KEYS } from "../constants/limits";
import type { UserProfile } from "../types";
import { readJson } from "./storage";
import { safeUserProfile } from "./safeProfile";

/**
 * Warm-launch hint only: whether a prior identity blob exists locally.
 * Never derive onboarding completion from client storage — database is sole authority.
 */
export type CachedMemberSession = {
  profile: UserProfile;
  hasSession: boolean;
};

export function readCachedMemberSession(): CachedMemberSession {
  const profile = safeUserProfile(
    readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" })
  );
  const hasSession = Boolean(profile.email?.trim());
  return {
    profile,
    hasSession
  };
}
