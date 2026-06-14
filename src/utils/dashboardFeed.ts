import { getActivityRotatorSlides } from "./discoverCityActivity";
import type { DiscoverProfile } from "../types";
import { getDailyKey, readJson, writeJson } from "./storage";
import { STORAGE_KEYS } from "../constants/limits";

export type DashboardFeedItem = {
  id: string;
  icon: string;
  text: string;
  dataBacked: boolean;
};

function shouldShowDiscoverMomentum(profileStrength: number): boolean {
  if (profileStrength < 67) return false;
  const today = getDailyKey();
  const last = readJson<string | null>(STORAGE_KEYS.discoverShownToday, null);
  if (last === today) return true;
  writeJson(STORAGE_KEYS.discoverShownToday, today);
  return true;
}

/** Real events first — graceful fallback copy */
export function buildDashboardFeed(input: {
  city: string;
  profiles: DiscoverProfile[];
  blocked: string[];
  passed: string[];
  signalsReceived: number;
  viewsToday: number;
  profileStrength: number;
  verified: boolean;
  compatibleNearby: number;
}): DashboardFeedItem[] {
  const items: DashboardFeedItem[] = [];

  if (shouldShowDiscoverMomentum(input.profileStrength)) {
    items.push({
      id: "discover-shown",
      icon: "👀",
      text: "Your profile appeared in Discover today",
      dataBacked: true
    });
  }

  if (input.viewsToday > 0) {
    items.push({
      id: "views",
      icon: "❤️",
      text: `${input.viewsToday} profile view${input.viewsToday === 1 ? "" : "s"} today`,
      dataBacked: true
    });
  }

  if (input.signalsReceived > 0) {
    items.push({
      id: "signals",
      icon: "⚡",
      text: `${input.signalsReceived} new signal${input.signalsReceived === 1 ? "" : "s"} waiting`,
      dataBacked: true
    });
  }

  if (input.compatibleNearby > 0) {
    items.push({
      id: "nearby",
      icon: "✨",
      text: `${input.compatibleNearby} compatible profile${input.compatibleNearby === 1 ? "" : "s"} nearby`,
      dataBacked: true
    });
  }

  if (!input.verified && input.profileStrength >= 50) {
    items.push({
      id: "verify",
      icon: "🟢",
      text: "Complete verification to increase visibility",
      dataBacked: false
    });
  }

  const slides = getActivityRotatorSlides(input.city, input.profiles, input.blocked, input.passed);
  for (const slide of slides.slice(0, 3)) {
    if (items.length >= 5) break;
    if (items.some((i) => i.text === slide.text)) continue;
    items.push({
      id: slide.text.slice(0, 24),
      icon: slide.icon,
      text: slide.text,
      dataBacked: slide.dataBacked
    });
  }

  if (!items.length) {
    items.push({
      id: "fallback",
      icon: "✨",
      text: "Complete your profile and start sending Signals",
      dataBacked: false
    });
  }

  return items.slice(0, 5);
}
