import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import { defaultMatchPreferences } from "./profile";
import { rankForMeaningfulMatches } from "./matchQualityEngine";

export {
  relationshipDiscoverScore,
  isRelationshipFocusedProfile,
  isOutstandingDiscoverProfile,
  isNewHereProfile,
  isSameCityProfile
} from "./buildDiscoverRankingCore";

export { computeMatchQualityScore, rankForMeaningfulMatches } from "./matchQualityEngine";

export function rankDiscoverProfiles(
  profiles: DiscoverProfile[],
  viewer: DatingProfile,
  prefs: MatchPreferences = defaultMatchPreferences()
): DiscoverProfile[] {
  return rankForMeaningfulMatches(profiles, viewer, prefs);
}
