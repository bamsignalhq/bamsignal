import { relationshipIntentLabel, relationshipIntentsFrom } from "../constants/relationshipIntent";
import { formatMoreAboutMeChip } from "../constants/moreAboutMe";
import { normalizeMoreAboutMeInterests } from "./moreAboutMe";
import { stateForCity, normalizeLifestyleTraits, resolveStateName } from "../constants/profileOptions";
import { normalizeSearchCities, searchStateFromPrefs } from "./searchLocationPrefs";
import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import type { IntentTag } from "../types";
import { safeArray } from "./safeProfile";
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
  const a = normalizeMoreAboutMeInterests(viewer.interests);
  const b = normalizeMoreAboutMeInterests(candidate.interests);
  if (!a.length || !b.length) return 0;
  const shared = a.filter((i) => b.includes(i)).length;
  const ratio = shared / Math.max(a.length, b.length, 1);
  return Math.min(1, ratio + (shared >= 2 ? 0.15 : 0));
}

function intentScore(viewer: DatingProfile, candidate: DiscoverProfile): number {
  const a = relationshipIntentsFrom(viewer.intents);
  const b = relationshipIntentsFrom(candidate.intents);
  if (!a.length || !b.length) return 0;
  const shared = a.filter((i) => b.includes(i));
  if (!shared.length) return 0;
  if (
    shared.includes("Marriage") ||
    shared.includes("SeriousRelationship") ||
    shared.length >= 2
  ) {
    return 1;
  }
  return 0.65 + (shared.length / Math.max(a.length, b.length)) * 0.35;
}

function profileLifestyleTraits(
  profile: Pick<DatingProfile | DiscoverProfile, "lifestyle" | "lifestyles">
): import("../constants/profileOptions").SocialLifestyle[] {
  return normalizeLifestyleTraits([
    ...safeArray<string>(profile.lifestyles),
    ...(profile.lifestyle && !isPreferNot(profile.lifestyle) ? [profile.lifestyle] : [])
  ]);
}

function lifestyleScore(viewer: DatingProfile, candidate: DiscoverProfile): number {
  const viewerTraits = profileLifestyleTraits(viewer);
  const candidateTraits = profileLifestyleTraits(candidate);
  if (!viewerTraits.length || !candidateTraits.length) return 0;
  return viewerTraits.some((trait) => candidateTraits.includes(trait)) ? 1 : 0;
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
  if (interestScore(viewer, candidate) >= 0.5) return "Shared vibes · Good fit";
  const viewerTraits = profileLifestyleTraits(viewer);
  const candidateTraits = profileLifestyleTraits(candidate);
  if (viewerTraits.length && viewerTraits.some((trait) => candidateTraits.includes(trait))) {
    return "Similar lifestyle";
  }
  if (viewer.city === candidate.city) return "Same city · Your kind of vibe";
  if (intentScore(viewer, candidate) >= 0.65) return "Aligned on what brings you here";
  return "Selected for you";
}

type MatchReason = { score: number; label: string };

function sharedInterests(viewer: DatingProfile, candidate: DiscoverProfile): string[] {
  const viewerInterests = normalizeMoreAboutMeInterests(viewer.interests);
  const candidateInterests = normalizeMoreAboutMeInterests(candidate.interests);
  return viewerInterests.filter((interest) => candidateInterests.includes(interest));
}

function similarAgeRange(viewer: DatingProfile, candidate: DiscoverProfile): boolean {
  return Math.abs(viewer.age - candidate.age) <= 5;
}

/** Dynamic reasons for "Why this profile?" — never hardcoded per profile */
export function getProfileMatchReasons(viewer: DatingProfile, candidate: DiscoverProfile): string[] {
  const reasons: MatchReason[] = [];
  const sharedIntents = relationshipIntentsFrom(viewer.intents).filter((intent) =>
    relationshipIntentsFrom(candidate.intents).includes(intent)
  );
  const interests = sharedInterests(viewer, candidate);

  if (interests.length >= 2) {
    reasons.push({ score: 96, label: "Shared More About Me" });
  } else if (interests.length === 1) {
    reasons.push({ score: 90, label: `You both chose ${formatMoreAboutMeChip(interests[0])}` });
  }

  if (sharedIntents.includes("Marriage") || sharedIntents.includes("SeriousRelationship")) {
    reasons.push({ score: 94, label: "Aligned on what brings you here" });
  } else if (sharedIntents.length) {
    const label =
      sharedIntents.length > 1
        ? "Aligned on what brings you here"
        : `Both looking for ${relationshipIntentLabel(sharedIntents[0]).toLowerCase()}`;
    reasons.push({ score: 88, label });
  }

  if (viewer.city && candidate.city === viewer.city) {
    reasons.push({ score: 86, label: "Same city" });
  } else if (candidate.distanceKm != null && candidate.distanceKm <= 15) {
    reasons.push({ score: 82, label: "Nearby" });
  }

  const viewerTraits = profileLifestyleTraits(viewer);
  const candidateTraits = profileLifestyleTraits(candidate);
  if (viewerTraits.length && candidateTraits.some((trait) => viewerTraits.includes(trait))) {
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

/** Dimension bars when viewing someone else's profile */
export function getProfileDimensionScores(
  viewer: DatingProfile,
  candidate: DiscoverProfile
): { label: string; percent: number }[] {
  const viewerTraits = profileLifestyleTraits(viewer);
  const candidateTraits = profileLifestyleTraits(candidate);
  const lifestyleMatch = lifestyleScore(viewer, candidate);
  const lifestylePct =
    lifestyleMatch >= 1
      ? 92
      : viewerTraits.length && candidateTraits.length
        ? 68
        : viewerTraits.length || candidateTraits.length
          ? 62
          : 52;

  const useReligion = viewer.matchingPrivacy?.useReligionForMatching !== false;
  const faithMatch = religionScore(viewer, candidate);
  const faithPct =
    faithMatch >= 1
      ? 88
      : useReligion && !isPreferNot(viewer.religion) && viewer.religion && candidate.religion
        ? 72
        : 55;

  const intentMatch = intentScore(viewer, candidate);
  const intentPct =
    intentMatch >= 1
      ? 95
      : intentMatch >= 0.65
        ? 88
        : intentMatch > 0
          ? 76
          : (viewer.intents?.length ?? 0) > 0 && safeArray<IntentTag>(candidate.intents).length > 0
            ? 58
            : 52;

  return [
    { label: "Lifestyle", percent: lifestylePct },
    { label: "Faith", percent: faithPct },
    { label: "What Brings You Here", percent: intentPct }
  ];
}

function candidateLocationState(candidate: DiscoverProfile): string | undefined {
  const fromRow = candidate.state?.trim();
  if (fromRow) return resolveStateName(fromRow) || fromRow;
  return candidate.city ? stateForCity(candidate.city) : undefined;
}

/** Location filter — always applied when search state or cities are set. */
export function matchesSearchLocation(candidate: DiscoverProfile, prefs: MatchPreferences): boolean {
  const searchState = searchStateFromPrefs(prefs);
  const searchCities = normalizeSearchCities(prefs.cities, searchState);
  if (!searchState && searchCities.length === 0) return true;

  const candidateState = candidateLocationState(candidate);
  if (searchState && candidateState && candidateState !== searchState) return false;
  if (searchCities.length && !searchCities.includes(candidate.city)) return false;
  return true;
}

export function hasActivePreferences(prefs: MatchPreferences): boolean {
  return (
    prefs.religions.length > 0 ||
    prefs.ethnicities.length > 0 ||
    prefs.lifestyles.length > 0 ||
    prefs.cities.length > 0 ||
    prefs.states.length > 0 ||
    prefs.intents.length > 0 ||
    prefs.moreAboutMe.length > 0 ||
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
  const candidateIntents = safeArray<IntentTag>(candidate.intents);
  if (prefs.intents.length && !candidateIntents.some((i) => prefs.intents.includes(i))) return false;
  if (
    prefs.moreAboutMe.length &&
    !normalizeMoreAboutMeInterests(candidate.interests).some((id) => prefs.moreAboutMe.includes(id))
  ) {
    return false;
  }
  if (prefs.religions.length && candidate.religion && !prefs.religions.includes(candidate.religion)) return false;
  if (prefs.ethnicities.length) {
    const candidateTribes = candidate.ethnicities?.length
      ? candidate.ethnicities
      : candidate.ethnicity
        ? [candidate.ethnicity]
        : [];
    if (candidateTribes.length && !candidateTribes.some((tribe) => prefs.ethnicities.includes(tribe))) return false;
  }
  if (prefs.lifestyles.length) {
    const candidateTraits = profileLifestyleTraits(candidate);
    if (
      candidateTraits.length &&
      !candidateTraits.some((trait) => prefs.lifestyles.includes(trait))
    ) {
      return false;
    }
  }
  if (!matchesSearchLocation(candidate, prefs)) return false;
  if (prefs.ageMin != null && candidate.age < prefs.ageMin) return false;
  if (prefs.ageMax != null && candidate.age > prefs.ageMax) return false;
  if (prefs.distanceMax != null && candidate.distanceKm != null && candidate.distanceKm > prefs.distanceMax)
    return false;
  if (prefs.requireVerified && !candidate.verified) return false;
  if (prefs.requireVoiceIntro && !candidate.voiceIntroUrl) return false;
  return true;
}
