import type { DiscoverProfile, MemberSearchFilters, UserProfile } from "../types";
import { readResponseJson } from "../utils/httpJson";
import { apiUrl } from "./supabase";

const profileCache = new Map<string, DiscoverProfile>();

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        city,
        excludeProfileIds
      })
    });
    const payload = await readResponseJson<{ ok?: boolean; profiles?: DiscoverProfile[] }>(response);
    if (!response.ok || !payload?.ok || !Array.isArray(payload.profiles)) return [];
    cacheDiscoverProfiles(payload.profiles);
    return payload.profiles;
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
  if (!city.trim() && !state.trim()) return [];

  try {
    const response = await fetch(apiUrl("/api/member/data?action=search"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        state,
        city,
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
    cacheDiscoverProfiles(payload.profiles);
    return payload.profiles;
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, phone: user.phone, profileId })
    });
    const payload = await readResponseJson<{ profile?: DiscoverProfile }>(response);
    if (!response.ok || !payload?.profile) return null;
    const profile = payload.profile;
    profileCache.set(profile.id, profile);
    return profile;
  } catch {
    return null;
  }
}
