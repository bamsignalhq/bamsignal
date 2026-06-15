import type { CityHomeProfile } from "../services/cityHome";
import type { DiscoverProfile } from "../types";
import { apiUrl, supabase } from "../services/supabase";

export function cityHomeToDiscoverProfile(profile: CityHomeProfile): DiscoverProfile {
  return {
    id: profile.profileId || profile.id,
    name: profile.name,
    age: profile.age || 25,
    gender: profile.gender,
    lookingFor: profile.lookingFor,
    city: profile.city,
    bio: profile.bio || "",
    photo: profile.photo,
    intents: profile.intents || [],
    interests: profile.interests || [],
    voiceIntroUrl: profile.voiceIntroUrl,
    verified: Boolean(profile.verified),
    premium: Boolean(profile.premium),
    lastActiveAt: profile.lastActiveAt
  };
}

export async function trackCitySpotlightEvent(input: {
  eventType: "view" | "click" | "profile_open" | "signal";
  city: string;
  profileId?: string;
  viewerKey?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await fetch(apiUrl("/api/city/spotlight-event"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  } catch {
    /* non-blocking */
  }
}

export type CitySpotlightAnalytics = {
  windowDays: number;
  purchases: number;
  views: number;
  clicks: number;
  profileOpens: number;
  signals: number;
  byCity: { city: string; views: number }[];
};

export async function fetchCitySpotlightAnalytics(days = 30): Promise<CitySpotlightAnalytics | null> {
  try {
    const session = await supabase?.auth.getSession();
    const token = session?.data.session?.access_token;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(apiUrl(`/api/admin/city-spotlight?days=${days}`), {
      method: "GET",
      headers,
      cache: "no-store"
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !payload.analytics) return null;
    return payload.analytics as CitySpotlightAnalytics;
  } catch {
    return null;
  }
}
