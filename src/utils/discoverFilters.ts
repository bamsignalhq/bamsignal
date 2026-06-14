import type { DiscoverProfile } from "../types";
import { isOnlineNow } from "./activity";

export type DiscoverQuickFilter =
  | "all"
  | "online"
  | "relationship"
  | "friendship"
  | "networking"
  | "verified"
  | "nearby";

export function applyQuickFilter(
  profiles: DiscoverProfile[],
  filter: DiscoverQuickFilter
): DiscoverProfile[] {
  switch (filter) {
    case "online":
      return profiles.filter((p) => isOnlineNow(p.lastActiveAt));
    case "relationship":
      return profiles.filter((p) => p.intents.includes("Relationship"));
    case "friendship":
      return profiles.filter((p) => p.intents.includes("Friendship"));
    case "networking":
      return profiles.filter((p) => p.intents.includes("Networking"));
    case "verified":
      return profiles.filter((p) => p.verified);
    case "nearby":
      return profiles.filter((p) => (p.distanceKm ?? 99) <= 15);
    default:
      return profiles;
  }
}

export function trendingSections(profiles: DiscoverProfile[]) {
  const byActive = [...profiles].sort(
    (a, b) =>
      new Date(b.lastActiveAt ?? 0).getTime() - new Date(a.lastActiveAt ?? 0).getTime()
  );
  return {
    active: byActive.slice(0, 8),
    verified: profiles.filter((p) => p.verified).slice(0, 8),
    newMembers: profiles
      .filter((p) => {
        if (!p.createdAt) return false;
        return Date.now() - new Date(p.createdAt).getTime() < 7 * 86400000;
      })
      .slice(0, 8)
  };
}
