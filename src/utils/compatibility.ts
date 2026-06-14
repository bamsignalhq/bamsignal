import { intentLabel } from "../constants/intents";
import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import { isPreferNot } from "./profile";
import { isOnlineNow } from "./activity";

/** Weighted compatibility factors (must sum to 100) */
const WEIGHTS = {
  interests: 30,
  intent: 25,
  lifestyle: 15,
  location: 15,
  religion: 5,
  verification: 10
} as const;

function interestScore(viewer: DatingProfile, candidate: DiscoverProfile): number {
  const a = viewer.interests ?? [];
  const b = candidate.interests ?? [];
  if (!a.length || !b.length) return 0;
  const shared = a.filter((i) => b.includes(i)).length;
  const ratio = shared / Math.max(a.length, b.length, 1);
  return Math.min(1, ratio + (shared >= 2 ? 0.15 : 0));
}

function intentScore(viewer: DatingProfile, candidate: DiscoverProfile): number {
  const a = viewer.intents ?? [];
  const b = candidate.intents ?? [];
  if (!a.length || !b.length) return 0;
  const shared = a.filter((i) => b.includes(i)).length;
  if (!shared) return 0;
  if (shared >= 2 || (a.includes("Relationship") && b.includes("Relationship"))) return 1;
  return 0.65 + (shared / Math.max(a.length, b.length)) * 0.35;
}

function lifestyleScore(viewer: DatingProfile, candidate: DiscoverProfile): number {
  if (isPreferNot(viewer.lifestyle) || !viewer.lifestyle || !candidate.lifestyle) return 0;
  return candidate.lifestyle === viewer.lifestyle ? 1 : 0;
}

function locationScore(viewer: DatingProfile, candidate: DiscoverProfile): number {
  if (viewer.city && candidate.city === viewer.city) return 1;
  if (candidate.distanceKm != null) {
    if (candidate.distanceKm <= 10) return 0.85;
    if (candidate.distanceKm <= 25) return 0.55;
    if (candidate.distanceKm <= 50) return 0.35;
  }
  const useState = viewer.matchingPrivacy?.useStateForMatching !== false;
  if (useState && viewer.stateOfOrigin && candidate.stateOfOrigin === viewer.stateOfOrigin) return 0.4;
  return 0.15;
}

function religionScore(viewer: DatingProfile, candidate: DiscoverProfile): number {
  const useReligion = viewer.matchingPrivacy?.useReligionForMatching !== false;
  if (!useReligion || isPreferNot(viewer.religion) || !viewer.religion || !candidate.religion) return 0;
  return candidate.religion === viewer.religion ? 1 : 0;
}

function verificationScore(candidate: DiscoverProfile): number {
  return candidate.verified ? 1 : 0;
}

/** 65–99% compatibility — realistic, never 100% */
export function computeCompatibilityPercent(
  viewer: DatingProfile,
  candidate: DiscoverProfile
): number {
  const weighted =
    interestScore(viewer, candidate) * WEIGHTS.interests +
    intentScore(viewer, candidate) * WEIGHTS.intent +
    lifestyleScore(viewer, candidate) * WEIGHTS.lifestyle +
    locationScore(viewer, candidate) * WEIGHTS.location +
    religionScore(viewer, candidate) * WEIGHTS.religion +
    verificationScore(candidate) * WEIGHTS.verification;

  const pct = Math.round(65 + (weighted / 100) * 34);
  return Math.min(99, Math.max(65, pct));
}

export function compatibilitySubtitle(
  viewer: DatingProfile,
  candidate: DiscoverProfile,
  percent: number
): string {
  if (percent >= 90) return "Strong match · Shared values";
  if (interestScore(viewer, candidate) >= 0.5) return "Shared interests · Good fit";
  if (!isPreferNot(viewer.lifestyle) && candidate.lifestyle === viewer.lifestyle) {
    return "Similar lifestyle";
  }
  if (viewer.city === candidate.city) return "Same city · Your kind of vibe";
  if (intentScore(viewer, candidate) >= 0.65) return "Compatible intentions";
  return "Selected for you";
}

type MatchReason = { score: number; label: string };

function sharedInterests(viewer: DatingProfile, candidate: DiscoverProfile): string[] {
  const viewerInterests = viewer.interests ?? [];
  const candidateInterests = candidate.interests ?? [];
  return viewerInterests.filter((interest) => candidateInterests.includes(interest));
}

function similarAgeRange(viewer: DatingProfile, candidate: DiscoverProfile): boolean {
  return Math.abs(viewer.age - candidate.age) <= 5;
}

/** Dynamic reasons for "Why this profile?" — never hardcoded per profile */
export function getProfileMatchReasons(viewer: DatingProfile, candidate: DiscoverProfile): string[] {
  const reasons: MatchReason[] = [];
  const sharedIntents = (viewer.intents ?? []).filter((intent) => candidate.intents.includes(intent));
  const interests = sharedInterests(viewer, candidate);

  if (interests.length >= 2) {
    reasons.push({ score: 96, label: "Shared interests" });
  } else if (interests.length === 1) {
    reasons.push({ score: 90, label: `Shared interest · ${interests[0]}` });
  }

  if (sharedIntents.includes("Relationship")) {
    reasons.push({ score: 94, label: "Compatible intentions" });
  } else if (sharedIntents.length) {
    const label =
      sharedIntents.length > 1
        ? "Compatible intentions"
        : `Both open to ${intentLabel(sharedIntents[0]).toLowerCase()}`;
    reasons.push({ score: 88, label });
  }

  if (viewer.city && candidate.city === viewer.city) {
    reasons.push({ score: 86, label: "Same city" });
  } else if (candidate.distanceKm != null && candidate.distanceKm <= 15) {
    reasons.push({ score: 82, label: "Nearby" });
  }

  if (!isPreferNot(viewer.lifestyle) && candidate.lifestyle === viewer.lifestyle) {
    reasons.push({ score: 84, label: "Similar lifestyle" });
  }

  if (similarAgeRange(viewer, candidate)) {
    reasons.push({ score: 78, label: "Similar age range" });
  }

  const useReligion = viewer.matchingPrivacy?.useReligionForMatching !== false;
  if (useReligion && !isPreferNot(viewer.religion) && candidate.religion === viewer.religion) {
    reasons.push({ score: 74, label: "Shared values" });
  }

  if (candidate.verified) {
    reasons.push({ score: 72, label: "Verified profile" });
  }

  if (isOnlineNow(candidate.lastActiveAt)) {
    reasons.push({ score: 70, label: "Active recently" });
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
    Boolean(prefs.onlineNow) ||
    prefs.minCompatibility != null ||
    Boolean(prefs.requireVoiceIntro) ||
    Boolean(prefs.requireVerified)
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
  if (prefs.requireVerified && !candidate.verified) return false;
  if (prefs.requireVoiceIntro && !candidate.voiceIntroUrl) return false;
  return true;
}
