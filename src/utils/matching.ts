import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import { hasActivePreferences, matchesPreferences } from "./compatibility";
import { isOnlineNow } from "./activity";
import { isPreferNot } from "./profile";

const SHARED_RELIGION = 15;
const SHARED_ETHNICITY = 10;
const SHARED_CITY = 20;
const SHARED_LIFESTYLE = 12;
const PREF_RELIGION = 12;
const PREF_ETHNICITY = 8;
const PREF_LIFESTYLE = 10;
const PREF_CITY = 15;
const PREF_AGE = 8;
const PREF_INTENT = 14;
const PREF_STATE = 10;
const PREF_DISTANCE = 10;
const VERIFIED = 5;
const INTEREST_OVERLAP = 4;
const ONLINE_NOW_BOOST = 40;

function intentMatch(viewer: DatingProfile, candidate: DiscoverProfile): number {
  const v = viewer.intents ?? [];
  const c = candidate.intents ?? [];
  if (!v.length || !c.length) return 0;
  return v.some((i) => c.includes(i)) ? PREF_INTENT : 0;
}

/** Weighted ranking — boosts similar profiles, never excludes others */
export function scoreProfile(
  candidate: DiscoverProfile,
  viewer: DatingProfile,
  prefs: MatchPreferences
): number {
  let score = 0;

  score += intentMatch(viewer, candidate);

  if (!isPreferNot(viewer.religion) && candidate.religion === viewer.religion) {
    score += SHARED_RELIGION;
  }
  if (!isPreferNot(viewer.ethnicity) && candidate.ethnicity === viewer.ethnicity) {
    score += SHARED_ETHNICITY;
  }
  if (viewer.city && candidate.city === viewer.city) {
    score += SHARED_CITY;
  }
  if (!isPreferNot(viewer.lifestyle) && candidate.lifestyle === viewer.lifestyle) {
    score += SHARED_LIFESTYLE;
  }

  if (prefs.intents.length && candidate.intents.some((i) => prefs.intents.includes(i))) {
    score += PREF_INTENT;
  }
  if (prefs.religions.length && candidate.religion && prefs.religions.includes(candidate.religion)) {
    score += PREF_RELIGION;
  }
  if (prefs.ethnicities.length && candidate.ethnicity && prefs.ethnicities.includes(candidate.ethnicity)) {
    score += PREF_ETHNICITY;
  }
  if (prefs.lifestyles.length && candidate.lifestyle && prefs.lifestyles.includes(candidate.lifestyle)) {
    score += PREF_LIFESTYLE;
  }
  if (prefs.cities.length && prefs.cities.includes(candidate.city)) {
    score += PREF_CITY;
  }
  if (prefs.states.length && candidate.stateOfOrigin && prefs.states.includes(candidate.stateOfOrigin)) {
    score += PREF_STATE;
  }
  if (prefs.ageMin != null && prefs.ageMax != null) {
    if (candidate.age >= prefs.ageMin && candidate.age <= prefs.ageMax) {
      score += PREF_AGE;
    }
  }
  if (prefs.distanceMax != null && candidate.distanceKm != null && candidate.distanceKm <= prefs.distanceMax) {
    score += PREF_DISTANCE;
  }

  const viewerInterests = viewer.interests ?? [];
  const candidateInterests = candidate.interests ?? [];
  const overlap = viewerInterests.filter((i) => candidateInterests.includes(i)).length;
  score += overlap * INTEREST_OVERLAP;

  if (candidate.verified) score += VERIFIED;

  if (prefs.onlineNow && isOnlineNow(candidate.lastActiveAt)) {
    score += ONLINE_NOW_BOOST;
  }

  if (prefs.preferenceMode === "strict" && hasActivePreferences(prefs)) {
    if (!matchesPreferences(candidate, prefs)) score -= 80;
  }

  return score;
}

export function rankProfiles(
  candidates: DiscoverProfile[],
  viewer: DatingProfile,
  prefs: MatchPreferences
): DiscoverProfile[] {
  return [...candidates].sort((a, b) => {
    if (prefs.onlineNow) {
      const onlineDiff = Number(isOnlineNow(b.lastActiveAt)) - Number(isOnlineNow(a.lastActiveAt));
      if (onlineDiff !== 0) return onlineDiff;
    }
    const diff = scoreProfile(b, viewer, prefs) - scoreProfile(a, viewer, prefs);
    if (diff !== 0) return diff;
    const activityDiff =
      new Date(b.lastActiveAt ?? 0).getTime() - new Date(a.lastActiveAt ?? 0).getTime();
    if (activityDiff !== 0) return activityDiff;
    return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
  });
}
