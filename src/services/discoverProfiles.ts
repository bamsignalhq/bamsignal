import type { DiscoverProfile, UserProfile } from "../types";
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
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !Array.isArray(payload.profiles)) return [];
    const profiles = payload.profiles as DiscoverProfile[];
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, phone: user.phone, profileId })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.profile) return null;
    const profile = payload.profile as DiscoverProfile;
    profileCache.set(profile.id, profile);
    return profile;
  } catch {
    return null;
  }
}
