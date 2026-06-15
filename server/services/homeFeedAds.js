import { getPlatformSetting } from "../db.js";

export const DEFAULT_HOME_FEED_AD_SLOT = {
  enabled: false,
  imageUrl: "",
  linkUrl: "",
  altText: ""
};

export const DEFAULT_HOME_FEED_ADS = {
  enabled: false,
  slots: [DEFAULT_HOME_FEED_AD_SLOT, DEFAULT_HOME_FEED_AD_SLOT, DEFAULT_HOME_FEED_AD_SLOT]
};

function normalizeSlot(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    enabled: Boolean(source.enabled),
    imageUrl: String(source.imageUrl || "").trim(),
    linkUrl: String(source.linkUrl || "").trim(),
    altText: String(source.altText || "").trim()
  };
}

export function normalizeHomeFeedAds(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const slots = Array.isArray(source.slots) ? source.slots : [];
  return {
    enabled: Boolean(source.enabled),
    slots: [0, 1, 2].map((i) => normalizeSlot(slots[i]))
  };
}

export async function loadHomeFeedAds() {
  const stored = await getPlatformSetting("home_feed_ads", null);
  return normalizeHomeFeedAds(stored || DEFAULT_HOME_FEED_ADS);
}

export function isHomeFeedAdSlotLive(settings, slotIndex) {
  if (!settings?.enabled) return false;
  const slot = settings.slots?.[slotIndex];
  return Boolean(slot?.enabled && slot.imageUrl);
}
