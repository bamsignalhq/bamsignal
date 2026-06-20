import type { DiscoverProfile, MemberSearchFilters, UserProfile } from "../types";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";
import { safeDiscoverProfile } from "../utils/safeProfile";
import { apiUrl } from "./supabase";

const profileCache = new Map<string, DiscoverProfile>();

function sanitizeProfiles(profiles: DiscoverProfile[]): DiscoverProfile[] {
  return profiles.map((profile) => safeDiscoverProfile(profile));
}

export function clearDiscoverProfileCache(profileId?: string): void {
  if (profileId) {
    profileCache.delete(profileId);
    return;
  }
  profileCache.clear();
}

export function cacheDiscoverProfiles(profiles: DiscoverProfile[]): void {
  for (const profile of profiles) {
    profileCache.set(profile.id, profile);
  }
}

export function getCachedMemberProfile(profileId: string): DiscoverProfile | undefined {
  return profileCache.get(profileId);
}

export async function fetchDiscoverProfiles(
  user: Pick<UserProfile, "email" | "phone">,
  city: string,
  excludeProfileIds: string[] = []
): Promise<DiscoverProfile[]> {
  if (!city.trim()) return [];

  try {
    const response = await fetch(apiUrl("/api/member/data?action=discover"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        city,
        excludeProfileIds
      })
    });
    const payload = await readResponseJson<{ ok?: boolean; profiles?: DiscoverProfile[] }>(response);
    if (!response.ok || !payload?.ok || !Array.isArray(payload.profiles)) return [];
    const profiles = sanitizeProfiles(payload.profiles);
    cacheDiscoverProfiles(profiles);
    return profiles;
  } catch {
    return [];
  }
}

export async function searchMemberProfiles(
  user: Pick<UserProfile, "email" | "phone">,
  options: MemberSearchFilters
): Promise<DiscoverProfile[]> {
  const {
    state = "",
    city = "",
    cities = [],
    ageMin = 18,
    ageMax = 99,
    excludeProfileIds = [],
    tribes = [],
    religions = [],
    occupations = [],
    statesOfOrigin = [],
    relationshipIntentions = [],
    genotypes = [],
    kidsPreferences = [],
    limit = 72
  } = options;
  if (!city.trim() && !state.trim() && cities.length === 0) return [];

  try {
    const response = await fetch(apiUrl("/api/member/data?action=search"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        state,
        city,
        cities,
        ageMin,
        ageMax,
        excludeProfileIds,
        tribes,
        religions,
        occupations,
        statesOfOrigin,
        relationshipIntentions,
        genotypes,
        kidsPreferences,
        limit
      })
    });
    const payload = await readResponseJson<{ ok?: boolean; profiles?: DiscoverProfile[] }>(response);
    if (!response.ok || !payload?.ok || !Array.isArray(payload.profiles)) return [];
    const profiles = sanitizeProfiles(payload.profiles);
    cacheDiscoverProfiles(profiles);
    return profiles;
  } catch {
    return [];
  }
}

export async function fetchMemberProfileById(
  user: Pick<UserProfile, "email" | "phone">,
  profileId: string
): Promise<DiscoverProfile | null> {
  const cached = profileCache.get(profileId);
  if (cached) return cached;

  try {
    const response = await fetch(apiUrl("/api/member/data?action=profile-by-id"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({ email: user.email, phone: user.phone, profileId })
    });
    const payload = await readResponseJson<{ profile?: DiscoverProfile }>(response);
    if (!response.ok || !payload?.profile) return null;
    const profile = safeDiscoverProfile(payload.profile);
    profileCache.set(profile.id, profile);
    return profile;
  } catch {
    return null;
  }
}
