import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, MatchPreferences, UserProfile } from "../types";
import { getDatingProfile, normalizeDatingProfile, normalizeMatchPreferences } from "../utils/profile";
import { readJson, writeJson } from "../utils/storage";
import { clearDiscoverProfileCache } from "./discoverProfiles";
import { hydrateMemberData } from "./memberData";

export const MEMBER_PROFILE_UPDATED_EVENT = "bamsignal:member-profile-updated";

export type MemberProfileSnapshot = {
  profile: DatingProfile;
  prefs: MatchPreferences;
};

type MemberIdentity = Pick<UserProfile, "email" | "phone" | "name" | "username">;

export function invalidateMemberProfileCaches(): void {
  const memberProfileId = localStorage.getItem(STORAGE_KEYS.memberProfileId);
  clearDiscoverProfileCache(memberProfileId ?? undefined);
}

export function applyCanonicalMemberSnapshot(
  profile: DatingProfile,
  prefs?: MatchPreferences
): MemberProfileSnapshot {
  const nextProfile = normalizeDatingProfile(profile);
  const nextPrefs = normalizeMatchPreferences(
    prefs ?? readJson(STORAGE_KEYS.matchPreferences, {})
  );
  writeJson(STORAGE_KEYS.datingProfile, nextProfile);
  writeJson(STORAGE_KEYS.matchPreferences, nextPrefs);
  invalidateMemberProfileCaches();
  window.dispatchEvent(
    new CustomEvent(MEMBER_PROFILE_UPDATED_EVENT, {
      detail: { profile: nextProfile, prefs: nextPrefs }
    })
  );
  return { profile: nextProfile, prefs: nextPrefs };
}

export function readMemberProfileSnapshot(): MemberProfileSnapshot {
  return {
    profile: getDatingProfile(),
    prefs: normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}))
  };
}

/** Pull server profile (server-wins), replace caches, and broadcast to member pages. */
export async function revalidateMemberProfileAfterUpdate(
  user: MemberIdentity,
  fallback?: Partial<MemberProfileSnapshot>
): Promise<MemberProfileSnapshot> {
  const hydrated = await hydrateMemberData(user, { serverWins: true });
  const profile = normalizeDatingProfile(
    hydrated
      ? readJson(STORAGE_KEYS.datingProfile, fallback?.profile ?? {})
      : fallback?.profile ?? readJson(STORAGE_KEYS.datingProfile, {})
  );
  const prefs = normalizeMatchPreferences(
    readJson(STORAGE_KEYS.matchPreferences, fallback?.prefs ?? {})
  );
  return applyCanonicalMemberSnapshot(profile, prefs);
}
