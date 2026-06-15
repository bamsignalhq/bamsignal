import {
  HOME_FEED_PROFILE_COUNT,
  HOME_FEED_PROFILES_PER_BLOCK,
  type HomeFeedAdsSettings
} from "../constants/homeFeedAds";
import type { DiscoverProfile, MemberSearchFilters } from "../types";

export type HomeFeedGridItem =
  | { type: "profile"; profile: DiscoverProfile }
  | { type: "ad"; slotIndex: 0 | 1 | 2 };

function isSlotLive(settings: HomeFeedAdsSettings, slotIndex: number): boolean {
  if (!settings.enabled) return false;
  const slot = settings.slots[slotIndex];
  return Boolean(slot?.enabled && slot.imageUrl.trim());
}

/** 60 profiles with a sponsored banner after every 5 rows when admin has activated the slot. */
export function buildHomeFeedGridItems(
  profiles: DiscoverProfile[],
  adSettings: HomeFeedAdsSettings,
  maxProfiles = HOME_FEED_PROFILE_COUNT
): HomeFeedGridItem[] {
  const sliced = profiles.slice(0, maxProfiles);
  const items: HomeFeedGridItem[] = [];
  let adSlot = 0;

  for (let i = 0; i < sliced.length; i++) {
    items.push({ type: "profile", profile: sliced[i] });
    const count = i + 1;
    if (count % HOME_FEED_PROFILES_PER_BLOCK === 0 && adSlot < 3) {
      if (isSlotLive(adSettings, adSlot)) {
        items.push({ type: "ad", slotIndex: adSlot as 0 | 1 | 2 });
      }
      adSlot += 1;
    }
  }

  return items;
}

export function filterProfilesByName(profiles: DiscoverProfile[], query: string): DiscoverProfile[] {
  const q = query.trim().toLowerCase();
  if (!q) return profiles;
  return profiles.filter((p) => p.name.toLowerCase().includes(q));
}

export type HomeFeedFilterState = MemberSearchFilters & {
  nameQuery?: string;
};
