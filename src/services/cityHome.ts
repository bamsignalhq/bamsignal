import type { DatingProfile, DiscoverProfile, UserProfile } from "../types";
import { apiUrl } from "./supabase";
import { supabase } from "./supabase";

export type CityHomeProfile = {
  id: string;
  profileId: string;
  name: string;
  city: string;
  state?: string;
  photo: string;
  bio?: string;
  age?: number;
  verified?: boolean;
  placementType: "spotlight" | "featured" | "hot" | "boost" | "admin" | "auto";
  sortOrder?: number;
  expiresAt?: string | null;
  lastActiveAt?: string;
  gender?: DiscoverProfile["gender"];
  lookingFor?: DiscoverProfile["lookingFor"];
  intents?: DiscoverProfile["intents"];
  interests?: string[];
  voiceIntroUrl?: string;
  premium?: boolean;
};

export type CityHomeMember = {
  id: string;
  name: string;
  city: string;
  email?: string;
  phone?: string;
  photo: string;
  cityHomeHidden: boolean;
  onboardingComplete: boolean;
  updatedAt?: string;
};

export async function fetchCitySpotlightProfiles(city: string, limit = 8): Promise<CityHomeProfile[]> {
  try {
    const params = new URLSearchParams({ city, limit: String(limit) });
    const response = await fetch(apiUrl(`/api/city/spotlight?${params.toString()}`), {
      method: "GET",
      cache: "no-store"
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !Array.isArray(payload.profiles)) return [];
    return payload.profiles as CityHomeProfile[];
  } catch {
    return [];
  }
}

export async function fetchCityHomeProfiles(city: string, limit = 6): Promise<CityHomeProfile[]> {
  try {
    const params = new URLSearchParams({ city, limit: String(limit) });
    const response = await fetch(apiUrl(`/api/city/home?${params.toString()}`), {
      method: "GET",
      cache: "no-store"
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !Array.isArray(payload.profiles)) return [];
    return payload.profiles as CityHomeProfile[];
  } catch {
    return [];
  }
}

async function adminHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const session = await supabase?.auth.getSession();
  const token = session?.data.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchAdminCityMembers(city: string): Promise<{
  members: CityHomeMember[];
  placements: unknown[];
} | null> {
  try {
    const response = await fetch(apiUrl("/api/admin/city-home?action=members"), {
      method: "POST",
      headers: await adminHeaders(),
      body: JSON.stringify({ city })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) return null;
    return {
      members: payload.members || [],
      placements: payload.placements || []
    };
  } catch {
    return null;
  }
}

export async function setAdminCityPlacement(input: {
  city: string;
  profileId: string;
  placementType: string;
  active?: boolean;
  sortOrder?: number;
}): Promise<boolean> {
  try {
    const response = await fetch(apiUrl("/api/admin/city-home?action=set-placement"), {
      method: "POST",
      headers: await adminHeaders(),
      body: JSON.stringify(input)
    });
    const payload = await response.json().catch(() => null);
    return Boolean(response.ok && payload?.ok);
  } catch {
    return false;
  }
}

export async function setAdminCityHomeHidden(profileId: string, hidden: boolean): Promise<boolean> {
  try {
    const response = await fetch(apiUrl("/api/admin/city-home?action=hide"), {
      method: "POST",
      headers: await adminHeaders(),
      body: JSON.stringify({ profileId, hidden })
    });
    const payload = await response.json().catch(() => null);
    return Boolean(response.ok && payload?.ok);
  } catch {
    return false;
  }
}

export function syncMemberProfileRemote(
  user: Pick<UserProfile, "email" | "phone" | "name" | "username">,
  profile: DatingProfile
): void {
  void fetch(apiUrl("/api/member/data?action=profile"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      phone: user.phone,
      name: user.name,
      username: user.username,
      city: profile.city,
      state: profile.state,
      profile,
      onboardingComplete: profile.onboardingComplete,
      discoverable: true
    })
  }).catch(() => null);
}
