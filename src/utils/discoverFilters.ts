import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import { isOnlineNow } from "./activity";
import { boostedProfileIds } from "./activeBoosts";
import {
  computeCompatibilityPercent,
  hasActivePreferences,
  matchesPreferences,
  matchesSearchLocation
} from "./compatibility";

export type DiscoverQuickFilter = "all" | "nearby" | "online" | "new";

export function applyDiscoverPreferences(
  profiles: DiscoverProfile[],
  prefs: MatchPreferences,
  viewer?: DatingProfile
): DiscoverProfile[] {
  let result = profiles.filter((p) => matchesSearchLocation(p, prefs));

  if (prefs.preferenceMode === "strict" && hasActivePreferences(prefs)) {
    result = result.filter((p) => matchesPreferences(p, prefs));
  }

  if (prefs.requireVerified) {
    result = result.filter((p) => p.verified);
  }
  if (prefs.requireVoiceIntro) {
    result = result.filter((p) => Boolean(p.voiceIntroUrl));
  }
  if (prefs.minCompatibility != null && viewer) {
    result = result.filter((p) => computeCompatibilityPercent(viewer, p) >= prefs.minCompatibility!);
  }

  return result;
}

export function applyQuickFilter(
  profiles: DiscoverProfile[],
  filter: DiscoverQuickFilter
): DiscoverProfile[] {
  switch (filter) {
    case "online":
      return profiles.filter((p) => isOnlineNow(p.lastActiveAt));
    case "nearby":
      return [...profiles].sort(
        (a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER)
      );
    case "new":
      return profiles.filter((p) => {
        if (!p.createdAt) return false;
        return Date.now() - new Date(p.createdAt).getTime() < 7 * 86400000;
      });
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

export function countActiveDiscoverFilters(prefs: MatchPreferences): number {
  return (
    prefs.religions.length +
    prefs.ethnicities.length +
    prefs.lifestyles.length +
    prefs.cities.length +
    prefs.states.length +
    prefs.intents.length +
    (prefs.ageMin != null || prefs.ageMax != null ? 1 : 0) +
    (prefs.distanceMax != null ? 1 : 0) +
    (prefs.preferenceMode === "strict" ? 1 : 0) +
    (prefs.onlineNow ? 1 : 0) +
    (prefs.minCompatibility != null ? 1 : 0) +
    (prefs.requireVoiceIntro ? 1 : 0) +
    (prefs.requireVerified ? 1 : 0)
  );
}
