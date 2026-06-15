import {
  DEFAULT_HOME_FEED_ADS,
  type HomeFeedAdsSettings
} from "../constants/homeFeedAds";
import { apiUrl } from "./supabase";

function normalize(raw: unknown): HomeFeedAdsSettings {
  const source = raw && typeof raw === "object" ? (raw as Partial<HomeFeedAdsSettings>) : {};
  const slots = Array.isArray(source.slots) ? source.slots : [];
  const normalizeSlot = (slot: unknown) => {
    const s = slot && typeof slot === "object" ? (slot as Record<string, unknown>) : {};
    return {
      enabled: Boolean(s.enabled),
      imageUrl: String(s.imageUrl || "").trim(),
      linkUrl: String(s.linkUrl || "").trim(),
      altText: String(s.altText || "").trim()
    };
  };
  return {
    enabled: Boolean(source.enabled),
    slots: [0, 1, 2].map((i) => normalizeSlot(slots[i])) as HomeFeedAdsSettings["slots"]
  };
}

export async function fetchHomeFeedAds(): Promise<HomeFeedAdsSettings> {
  try {
    const response = await fetch(apiUrl("/api/auth/identity?action=home-feed-ads"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store"
    });
    if (response.ok) {
      const payload = await response.json();
      if (payload?.ok) return normalize(payload.value);
    }
  } catch {
    /* offline */
  }
  return DEFAULT_HOME_FEED_ADS;
}

export async function saveHomeFeedAdsAdmin(
  value: HomeFeedAdsSettings,
  accessToken?: string
): Promise<{ ok: boolean; value?: HomeFeedAdsSettings; error?: string }> {
  const normalized = normalize(value);

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(apiUrl("/api/auth/identity?action=home-feed-ads-save"), {
      method: "POST",
      headers,
      body: JSON.stringify({ value: normalized })
    });
    const payload = await response.json();
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Could not save home feed ads." };
    }
    return { ok: true, value: normalize(payload.value) };
  } catch {
    return { ok: false, error: "Network error while saving home feed ads." };
  }
}
