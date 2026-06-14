import type { DiscoverProfile } from "../types";
import { isOnlineNow } from "./activity";
import { boostedProfileIds } from "./activeBoosts";

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
  const boosted = boostedProfileIds();
  const sortBoostedFirst = (list: DiscoverProfile[]) =>
    [...list].sort((a, b) => {
      const aBoost = boosted.has(a.id) ? 1 : 0;
      const bBoost = boosted.has(b.id) ? 1 : 0;
      return bBoost - aBoost;
    });

  const byActive = sortBoostedFirst(profiles).sort(
    (a, b) =>
      (boosted.has(b.id) ? 1 : 0) - (boosted.has(a.id) ? 1 : 0) ||
      new Date(b.lastActiveAt ?? 0).getTime() - new Date(a.lastActiveAt ?? 0).getTime()
  );
  return {
    active: byActive.slice(0, 8),
    verified: sortBoostedFirst(profiles.filter((p) => p.verified)).slice(0, 8),
    newMembers: sortBoostedFirst(
      profiles.filter((p) => {
        if (!p.createdAt) return false;
        return Date.now() - new Date(p.createdAt).getTime() < 7 * 86400000;
      })
    ).slice(0, 8)
  };
}
