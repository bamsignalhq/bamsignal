import {
  HOME_FEED_PROFILE_COUNT,
  HOME_FEED_PROFILES_PER_BLOCK,
  type HomeFeedAdsSettings
} from "../constants/homeFeedAds";
import type { DiscoverProfile, MemberSearchFilters } from "../types";
import { trustNudgeInsertAfterIndices } from "./trustFeedInsertion";

export const SIGNAL_PASS_PROMO_INTERVAL = 12;

export type HomeFeedGridItem =
  | { type: "profile"; profile: DiscoverProfile }
  | { type: "ad"; slotIndex: 0 | 1 | 2 }
  | { type: "signal-pass-promo"; variant: "signals" | "visibility" }
  | { type: "trust-nudge" };

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

/** Insert one subtle Signal Pass chip after every N real (non-sample) profile cards. */
export function injectSignalPassPromos(
  items: HomeFeedGridItem[],
  options: { enabled: boolean; isSampleProfile?: (profile: DiscoverProfile) => boolean }
): HomeFeedGridItem[] {
  if (!options.enabled) return items;

  const isSample = options.isSampleProfile ?? (() => false);
  const out: HomeFeedGridItem[] = [];
  let realCount = 0;
  let promoIndex = 0;

  for (const item of items) {
    out.push(item);
    if (item.type !== "profile" || isSample(item.profile)) continue;

    realCount += 1;
    if (realCount > 0 && realCount % SIGNAL_PASS_PROMO_INTERVAL === 0) {
      out.push({
        type: "signal-pass-promo",
        variant: promoIndex % 2 === 0 ? "signals" : "visibility"
      });
      promoIndex += 1;
    }
  }

  return out;
}

/** Insert compact trust nudges after organic profile views in the home grid. */
export function injectTrustMemberNudges(
  items: HomeFeedGridItem[],
  options: { enabled: boolean; isSampleProfile?: (profile: DiscoverProfile) => boolean }
): HomeFeedGridItem[] {
  if (!options.enabled) return items;

  const isSample = options.isSampleProfile ?? (() => false);
  const realProfiles = items.filter(
    (item): item is Extract<HomeFeedGridItem, { type: "profile" }> =>
      item.type === "profile" && !isSample(item.profile)
  );
  const insertAfter = trustNudgeInsertAfterIndices(realProfiles.length);
  if (!insertAfter.size) return items;

  const out: HomeFeedGridItem[] = [];
  let realCount = 0;

  for (const item of items) {
    out.push(item);
    if (item.type !== "profile" || isSample(item.profile)) continue;
    realCount += 1;
    if (insertAfter.has(realCount - 1)) {
      out.push({ type: "trust-nudge" });
    }
  }

  return out;
}

export function filterProfilesByName(profiles: DiscoverProfile[], query: string): DiscoverProfile[] {
  const q = query.trim().toLowerCase();
  if (!q) return profiles;
  return profiles.filter((p) => p.name.toLowerCase().includes(q));
}

export type HomeFeedFilterState = MemberSearchFilters & {
  nameQuery?: string;
};
