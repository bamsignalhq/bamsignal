import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import { isOnlineNow } from "./activity";
import { boostedProfileIds } from "./activeBoosts";
import type { DiscoverRelationshipFilter } from "../constants/discoverExperience";
import {
  isNewHereProfile,
  isOutstandingDiscoverProfile,
  isRelationshipFocusedProfile,
  isSameCityProfile
} from "./buildDiscoverRanking";
import { isTrustedMember } from "./trustedMember";
import { hasVoiceVibe } from "./voiceVibe";
import {
  computeCompatibilityPercent,
  hasActivePreferences,
  matchesPreferences,
  matchesSearchLocation
} from "./compatibility";

/** @deprecated use DiscoverRelationshipFilter */
export type DiscoverQuickFilter = DiscoverRelationshipFilter | "nearby" | "online" | "new";

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

export function applyDiscoverRelationshipFilter(
  profiles: DiscoverProfile[],
  filter: DiscoverRelationshipFilter,
  viewer?: DatingProfile
): DiscoverProfile[] {
  switch (filter) {
    case "same-city":
      return viewer ? profiles.filter((p) => isSameCityProfile(viewer, p)) : profiles;
    case "trusted":
      return profiles.filter((p) => isTrustedMember(p));
    case "voice-vibe":
      return profiles.filter((p) => hasVoiceVibe(p));
    case "relationship":
      return profiles.filter((p) => isRelationshipFocusedProfile(p));
    case "new-here":
      return profiles.filter((p) => isNewHereProfile(p));
    case "outstanding":
      return profiles.filter((p) => isOutstandingDiscoverProfile(p));
    default:
      return profiles;
  }
}

/** @deprecated use applyDiscoverRelationshipFilter */
export function applyQuickFilter(
  profiles: DiscoverProfile[],
  filter: DiscoverQuickFilter,
  viewer?: DatingProfile
): DiscoverProfile[] {
  if (filter === "nearby" || filter === "online" || filter === "new") {
    switch (filter) {
      case "online":
        return profiles.filter((p) => isOnlineNow(p.lastActiveAt));
      case "nearby":
        return [...profiles].sort(
          (a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER)
        );
      case "new":
        return profiles.filter((p) => isNewHereProfile(p));
      default:
        return profiles;
    }
  }
  return applyDiscoverRelationshipFilter(profiles, filter, viewer);
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
