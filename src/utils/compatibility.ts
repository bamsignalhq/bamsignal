import { intentLabel } from "../constants/intents";
import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import { isPreferNot } from "./profile";
import { isOnlineNow } from "./activity";

const MAX_RAW = 110;

function intentOverlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const shared = a.filter((i) => b.includes(i)).length;
  return (shared / Math.max(a.length, b.length)) * 25;
}

function interestOverlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const shared = a.filter((i) => b.includes(i)).length;
  return Math.min(25, shared * 5);
}

/** 0–100 compatibility — subtle, inclusive metric */
export function computeCompatibilityPercent(
  viewer: DatingProfile,
  candidate: DiscoverProfile
): number {
  let raw = 40;

  raw += interestOverlap(viewer.interests ?? [], candidate.interests ?? []);
  raw += intentOverlap(viewer.intents ?? [], candidate.intents ?? []);

  if (viewer.city && candidate.city === viewer.city) raw += 16;
  if (candidate.distanceKm != null && candidate.distanceKm <= 10) raw += 6;
  if (!isPreferNot(viewer.lifestyle) && candidate.lifestyle === viewer.lifestyle) raw += 10;

  const useReligion = viewer.matchingPrivacy?.useReligionForMatching !== false;
  const useEthnicity = viewer.matchingPrivacy?.useEthnicityForMatching !== false;
  const useState = viewer.matchingPrivacy?.useStateForMatching !== false;

  if (useReligion && !isPreferNot(viewer.religion) && candidate.religion === viewer.religion) raw += 8;
  if (useEthnicity && !isPreferNot(viewer.ethnicity) && candidate.ethnicity === viewer.ethnicity) raw += 6;
  if (useState && viewer.stateOfOrigin && candidate.stateOfOrigin === viewer.stateOfOrigin) raw += 5;

  if (candidate.verified) raw += 4;

  const pct = Math.round((raw / MAX_RAW) * 100);
  return Math.min(99, Math.max(62, pct));
}

export function compatibilitySubtitle(
  viewer: DatingProfile,
  candidate: DiscoverProfile,
  percent: number
): string {
  if (percent >= 90) return "Shared values · Similar lifestyle";
  if (
    !isPreferNot(viewer.religion) &&
    candidate.religion === viewer.religion &&
    !isPreferNot(viewer.ethnicity) &&
    candidate.ethnicity === viewer.ethnicity
  ) {
    return "Strong cultural fit";
  }
  if (!isPreferNot(viewer.lifestyle) && candidate.lifestyle === viewer.lifestyle) {
    return "Similar lifestyle";
  }
  if (viewer.city === candidate.city) return "Nearby · Your kind of vibe";
  return "High compatibility";
}

type MatchReason = { score: number; label: string };

function sharedInterests(viewer: DatingProfile, candidate: DiscoverProfile): string[] {
  const viewerInterests = viewer.interests ?? [];
  const candidateInterests = candidate.interests ?? [];
  return viewerInterests.filter((interest) => candidateInterests.includes(interest));
}

/** 2–4 trust-building reasons for "Why this profile?" */
export function getProfileMatchReasons(viewer: DatingProfile, candidate: DiscoverProfile): string[] {
  const reasons: MatchReason[] = [];
  const sharedIntents = (viewer.intents ?? []).filter((intent) => candidate.intents.includes(intent));

  if (sharedIntents.includes("Relationship")) {
    reasons.push({ score: 96, label: "Both looking for a relationship" });
  } else if (sharedIntents.length) {
    const label = sharedIntents.length > 1 ? "Similar intent" : `Both open to ${intentLabel(sharedIntents[0]).toLowerCase()}`;
    reasons.push({ score: 92, label });
  }

  if (viewer.city && candidate.city === viewer.city) {
    reasons.push({ score: 90, label: "Same city" });
  } else if (candidate.distanceKm != null && candidate.distanceKm <= 10) {
    reasons.push({ score: 84, label: "Nearby" });
  }

  const interests = sharedInterests(viewer, candidate);
  if (interests.length >= 2) {
    reasons.push({ score: 88, label: "Similar interests" });
  } else if (interests.length === 1) {
    reasons.push({ score: 82, label: `Shared interest · ${interests[0]}` });
  }

  if (!isPreferNot(viewer.lifestyle) && candidate.lifestyle === viewer.lifestyle) {
    reasons.push({ score: 80, label: "Similar lifestyle" });
  }

  const useReligion = viewer.matchingPrivacy?.useReligionForMatching !== false;
  const useEthnicity = viewer.matchingPrivacy?.useEthnicityForMatching !== false;
  const useState = viewer.matchingPrivacy?.useStateForMatching !== false;

  const valueMatches = [
    useReligion && !isPreferNot(viewer.religion) && candidate.religion === viewer.religion,
    useEthnicity && !isPreferNot(viewer.ethnicity) && candidate.ethnicity === viewer.ethnicity,
    useState && viewer.stateOfOrigin && candidate.stateOfOrigin === viewer.stateOfOrigin
  ].filter(Boolean).length;

  if (valueMatches >= 2) {
    reasons.push({ score: 78, label: "Shared values" });
  } else if (valueMatches === 1) {
    if (useReligion && !isPreferNot(viewer.religion) && candidate.religion === viewer.religion) {
      reasons.push({ score: 74, label: "Shared values" });
    } else if (useState && viewer.stateOfOrigin && candidate.stateOfOrigin === viewer.stateOfOrigin) {
      reasons.push({ score: 72, label: "Shared background" });
    }
  }

  if (candidate.verified) {
    reasons.push({ score: 68, label: "Verified profile" });
  }

  const seen = new Set<string>();
  return reasons
    .sort((a, b) => b.score - a.score)
    .filter((reason) => {
      if (seen.has(reason.label)) return false;
      seen.add(reason.label);
      return true;
    })
    .slice(0, 4)
    .map((reason) => reason.label);
}

export function hasActivePreferences(prefs: MatchPreferences): boolean {
  return (
    prefs.religions.length > 0 ||
    prefs.ethnicities.length > 0 ||
    prefs.lifestyles.length > 0 ||
    prefs.cities.length > 0 ||
    prefs.states.length > 0 ||
    prefs.intents.length > 0 ||
    prefs.ageMin != null ||
    prefs.ageMax != null ||
    prefs.distanceMax != null ||
    Boolean(prefs.onlineNow)
  );
}

export function matchesPreferences(candidate: DiscoverProfile, prefs: MatchPreferences): boolean {
  if (prefs.intents.length && !candidate.intents.some((i) => prefs.intents.includes(i))) return false;
  if (prefs.religions.length && candidate.religion && !prefs.religions.includes(candidate.religion)) return false;
  if (prefs.ethnicities.length && candidate.ethnicity && !prefs.ethnicities.includes(candidate.ethnicity))
    return false;
  if (prefs.lifestyles.length && candidate.lifestyle && !prefs.lifestyles.includes(candidate.lifestyle))
    return false;
  if (prefs.cities.length && !prefs.cities.includes(candidate.city)) return false;
  if (prefs.states.length && candidate.stateOfOrigin && !prefs.states.includes(candidate.stateOfOrigin))
    return false;
  if (prefs.ageMin != null && candidate.age < prefs.ageMin) return false;
  if (prefs.ageMax != null && candidate.age > prefs.ageMax) return false;
  if (prefs.distanceMax != null && candidate.distanceKm != null && candidate.distanceKm > prefs.distanceMax)
    return false;
  return true;
}
