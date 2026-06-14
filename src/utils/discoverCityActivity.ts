import type { DiscoverProfile } from "../types";
import { countByCity } from "./cityAnalytics";
import { isOnlineNow } from "./activity";
import {
  getDiscoverCityConfig,
  launchActivityMessage,
  cityHeadline,
  type DiscoverCityConfig
} from "../constants/discoverCityConfig";
import { isNewSignalProfile, isRecentlyActive, meetsDiscoveryQuality } from "./launchSeed";

const DAY_MS = 24 * 60 * 60 * 1000;

export type ActivityBarState = {
  city: string;
  message: string;
  mode: "launch" | "real" | "generic";
  activeCount: number;
};

export type RotatorSlide = {
  icon: string;
  text: string;
  dataBacked: boolean;
};

function eligibleInCity(
  profiles: DiscoverProfile[],
  city: string,
  blocked: string[],
  passed: string[]
): DiscoverProfile[] {
  return profiles.filter(
    (p) =>
      p.city === city &&
      meetsDiscoveryQuality(p) &&
      !blocked.includes(p.id) &&
      !passed.includes(p.id)
  );
}

/** Recently active or online now — used for real activity counts */
export function countActiveSignalsInCity(
  profiles: DiscoverProfile[],
  city: string,
  blocked: string[] = [],
  passed: string[] = []
): number {
  return eligibleInCity(profiles, city, blocked, passed).filter(
    (p) => isRecentlyActive(p) || isOnlineNow(p.lastActiveAt)
  ).length;
}

export function countVerifiedInCity(
  profiles: DiscoverProfile[],
  city: string,
  blocked: string[] = [],
  passed: string[] = []
): number {
  return eligibleInCity(profiles, city, blocked, passed).filter((p) => p.verified).length;
}

export function countNewMembersInCity(
  profiles: DiscoverProfile[],
  city: string,
  blocked: string[] = [],
  passed: string[] = []
): number {
  return eligibleInCity(profiles, city, blocked, passed).filter((p) => isNewSignalProfile(p)).length;
}

export function getActivityBarState(
  city: string,
  profiles: DiscoverProfile[],
  blocked: string[],
  passed: string[],
  config: DiscoverCityConfig = getDiscoverCityConfig()
): ActivityBarState {
  const displayCity = city.trim() || "Nigeria";
  const activeCount = countActiveSignalsInCity(profiles, displayCity, blocked, passed);
  const useLaunchCopy =
    config.launchMode || activeCount < config.realDataMinActive;

  if (useLaunchCopy) {
    return {
      city: displayCity,
      message: launchActivityMessage(displayCity, config),
      mode: "launch",
      activeCount
    };
  }

  return {
    city: displayCity,
    message: `${activeCount} active signal${activeCount === 1 ? "" : "s"} nearby`,
    mode: "real",
    activeCount
  };
}

export function getDiscoverHeadline(city: string, config = getDiscoverCityConfig()): string {
  return cityHeadline(city.trim() || "Lagos", config);
}

/** Activity rotator — data-enriched when possible, never fake counts */
export function getActivityRotatorSlides(
  city: string,
  profiles: DiscoverProfile[],
  blocked: string[],
  passed: string[],
  config: DiscoverCityConfig = getDiscoverCityConfig()
): RotatorSlide[] {
  const displayCity = city.trim() || "Nigeria";
  const slides: RotatorSlide[] = [];

  const newMembers = countNewMembersInCity(profiles, displayCity, blocked, passed);
  const signalsToday = countByCity("signal_sent", DAY_MS)[displayCity] ?? 0;
  const acceptedToday = countByCity("signal_accepted", DAY_MS)[displayCity] ?? 0;
  const activeCount = countActiveSignalsInCity(profiles, displayCity, blocked, passed);
  const verifiedCount = countVerifiedInCity(profiles, displayCity, blocked, passed);

  if (newMembers > 0) {
    slides.push({
      icon: "✨",
      text: `${newMembers} new member${newMembers === 1 ? "" : "s"} in ${displayCity} this week`,
      dataBacked: true
    });
  }

  if (signalsToday > 0) {
    slides.push({
      icon: "🔥",
      text: `${signalsToday} signal${signalsToday === 1 ? "" : "s"} sent in ${displayCity} today`,
      dataBacked: true
    });
  }

  if (acceptedToday > 0) {
    slides.push({
      icon: "❤️",
      text: `${acceptedToday} new connection${acceptedToday === 1 ? "" : "s"} in ${displayCity} today`,
      dataBacked: true
    });
  }

  if (activeCount > 0 && !config.launchMode) {
    slides.push({
      icon: "🟢",
      text: `${activeCount} active profile${activeCount === 1 ? "" : "s"} nearby`,
      dataBacked: true
    });
  }

  if (verifiedCount > 0) {
    slides.push({
      icon: "✨",
      text: `${verifiedCount} verified member${verifiedCount === 1 ? "" : "s"} in ${displayCity}`,
      dataBacked: true
    });
  }

  const icons = ["✨", "🔥", "❤️", "🟢", "✨"];
  config.activityRotator.forEach((text, i) => {
    if (!slides.some((s) => s.text.toLowerCase().includes(text.split(" ")[0].toLowerCase()))) {
      slides.push({ icon: icons[i % icons.length], text, dataBacked: false });
    }
  });

  return slides.length ? slides : [{ icon: "📍", text: "Active signals nearby", dataBacked: false }];
}

/** Subtle trust rotator — skips items when data contradicts */
export function getConfidenceRotatorSlides(
  city: string,
  profiles: DiscoverProfile[],
  blocked: string[],
  passed: string[],
  config: DiscoverCityConfig = getDiscoverCityConfig()
): RotatorSlide[] {
  const displayCity = city.trim() || "Nigeria";
  const activeCount = countActiveSignalsInCity(profiles, displayCity, blocked, passed);
  const verifiedCount = countVerifiedInCity(profiles, displayCity, blocked, passed);
  const newMembers = countNewMembersInCity(profiles, displayCity, blocked, passed);

  const slides: RotatorSlide[] = [];

  for (const text of config.confidenceRotator) {
    const lower = text.toLowerCase();
    if (lower.includes("verified") && verifiedCount === 0) continue;
    if (lower.includes("active") && activeCount === 0 && !config.launchMode) continue;
    if (lower.includes("new members") && newMembers === 0 && !config.launchMode) continue;
    slides.push({ icon: "✓", text, dataBacked: false });
  }

  return slides.length
    ? slides
    : [{ icon: "✓", text: "Real people nearby", dataBacked: false }];
}
