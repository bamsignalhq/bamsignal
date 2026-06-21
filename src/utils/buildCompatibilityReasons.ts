import { intentLabel } from "../constants/intents";
import {
  normalizeLifestyleTraits,
  resolveStateName,
  stateForCity
} from "../constants/profileOptions";
import type { DatingProfile, DiscoverProfile, IntentTag } from "../types";
import { isPreferNot } from "./profile";
import { safeArray } from "./safeProfile";

export type CompatibilityProfile = Partial<
  Pick<
    DatingProfile,
    | "religion"
    | "intents"
    | "interests"
    | "occupation"
    | "occupations"
    | "lifestyle"
    | "lifestyles"
    | "kidsPreference"
    | "hasKidsOptions"
    | "wantsKidsOptions"
    | "ethnicity"
    | "ethnicities"
    | "state"
    | "city"
    | "stateOfOrigin"
    | "statesOfOrigin"
    | "voiceIntroUrl"
    | "verificationStatus"
    | "verified"
    | "matchingPrivacy"
  >
> &
  Partial<Pick<DiscoverProfile, "distanceKm">>;

const MAX_REASONS = 5;

const INTEREST_CLUSTERS: { test: (interest: string) => boolean; reason: string; key: string }[] = [
  { test: (i) => /movie|nollywood|cinema|film/i.test(i), reason: "🎬 Both enjoy movies", key: "movies" },
  {
    test: (i) => /travel|road trip|island|detty december|weekend/i.test(i),
    reason: "✈️ Both love travelling",
    key: "travel"
  },
  {
    test: (i) => /food|jollof|suya|amala|pepper soup|buka|chops|palm wine|street food|cooking/i.test(i),
    reason: "🍲 Food lovers",
    key: "food"
  },
  {
    test: (i) => /music|afrobeats|gospel|highlife|hip-hop|wizkid|davido|asake|burna/i.test(i),
    reason: "🎵 Music lovers",
    key: "music"
  },
  { test: (i) => /pet/i.test(i), reason: "🐶 Animal lovers", key: "pets" },
  {
    test: (i) => /gym|fitness|crossfit|swim|hike|football|padel|tennis/i.test(i),
    reason: "🏃 Health-conscious lifestyles",
    key: "fitness"
  },
  {
    test: (i) => /business|tech|entrepreneur|networking|side hustle/i.test(i),
    reason: "🚀 Career-driven personalities",
    key: "career"
  },
  {
    test: (i) => /family|church community|mosque/i.test(i),
    reason: "👨‍👩‍👧 Family-oriented",
    key: "family"
  }
];

const LIFESTYLE_REASONS: Record<string, { reason: string; key: string }> = {
  "Family oriented": { reason: "👨‍👩‍👧 Family-oriented", key: "family" },
  "Career focused": { reason: "🚀 Career-driven personalities", key: "career" },
  "Fitness conscious": { reason: "🏃 Health-conscious lifestyles", key: "fitness" },
  "Travel lover": { reason: "✈️ Both love travelling", key: "travel" },
  "Food lover": { reason: "🍲 Food lovers", key: "food" },
  "Faith centered": { reason: "❤️ Both value faith", key: "faith" }
};

const INTENT_REASONS: Partial<Record<IntentTag, { reason: string; key: string }>> = {
  Relationship: { reason: "💍 Looking for something serious", key: "relationship" },
  Friendship: { reason: "🤝 Open to friendship", key: "friendship" },
  Networking: { reason: "🌍 Building connections together", key: "networking" },
  "Social Events": { reason: "🎉 Both love social energy", key: "social" },
  Chat: { reason: "💬 Up for good conversation", key: "chat" },
  Quickie: { reason: "⚡ Open to fast connections", key: "fast" }
};

const CAREER_OCCUPATIONS = new Set(["Business", "Tech", "Entrepreneur", "Finance"]);

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function sharedList(a: string[] | undefined, b: string[] | undefined): string[] {
  const setB = new Set((b ?? []).map(normalizeText));
  return (a ?? []).filter((item) => setB.has(normalizeText(item)));
}

function lifestyleTraits(profile: CompatibilityProfile) {
  return normalizeLifestyleTraits([
    ...safeArray<string>(profile.lifestyles),
    ...(profile.lifestyle && !isPreferNot(profile.lifestyle) ? [profile.lifestyle] : [])
  ]);
}

function occupationList(profile: CompatibilityProfile): string[] {
  const list = profile.occupations?.length
    ? profile.occupations
    : profile.occupation
      ? [profile.occupation]
      : [];
  return list.filter((value) => !isPreferNot(value));
}

function kidsFamilySignals(profile: CompatibilityProfile): boolean {
  const familyPrefs = new Set(["Has kids", "Wants kids", "Open to kids"]);
  if (profile.kidsPreference && familyPrefs.has(profile.kidsPreference)) return true;
  if (profile.hasKidsOptions?.some((option) => option === "Has kids")) return true;
  if (profile.wantsKidsOptions?.some((option) => option === "Wants kids" || option === "Open to kids")) {
    return true;
  }
  return lifestyleTraits(profile).includes("Family oriented");
}

function profileState(profile: CompatibilityProfile): string | undefined {
  const fromField = profile.state?.trim();
  if (fromField) return resolveStateName(fromField) || fromField;
  return profile.city ? stateForCity(profile.city) : undefined;
}

function profileTribes(profile: CompatibilityProfile): string[] {
  if (profile.ethnicities?.length) {
    return profile.ethnicities.filter((tribe) => !isPreferNot(tribe));
  }
  if (profile.ethnicity && !isPreferNot(profile.ethnicity)) return [profile.ethnicity];
  return [];
}

function reasonFromSharedInterests(
  viewerInterests: string[],
  targetInterests: string[]
): { reason: string; key: string } | null {
  const shared = sharedList(viewerInterests, targetInterests);
  if (!shared.length) return null;

  for (const cluster of INTEREST_CLUSTERS) {
    if (shared.some(cluster.test)) {
      return { reason: cluster.reason, key: cluster.key };
    }
  }

  const first = shared[0];
  return { reason: `✨ Both into ${first.toLowerCase()}`, key: `interest:${normalizeText(first)}` };
}

/** Human-readable shared-value explanations — no scores or match labels. */
export function buildCompatibilityReasons(
  viewerProfile: CompatibilityProfile,
  targetProfile: CompatibilityProfile
): string[] {
  const reasons: string[] = [];
  const seenKeys = new Set<string>();

  const add = (reason: string, key: string) => {
    if (seenKeys.has(key) || reasons.length >= MAX_REASONS) return;
    seenKeys.add(key);
    reasons.push(reason);
  };

  const useReligion = viewerProfile.matchingPrivacy?.useReligionForMatching !== false;

  if (
    useReligion &&
    !isPreferNot(viewerProfile.religion) &&
    viewerProfile.religion &&
    viewerProfile.religion === targetProfile.religion
  ) {
    add("❤️ Both value faith", "faith");
  }

  const viewerIntents = safeArray<IntentTag>(viewerProfile.intents);
  const targetIntents = safeArray<IntentTag>(targetProfile.intents);
  const sharedIntents = viewerIntents.filter((intent) => targetIntents.includes(intent));
  if (sharedIntents.length) {
    const primary = sharedIntents.includes("Relationship") ? "Relationship" : sharedIntents[0];
    const intentReason = INTENT_REASONS[primary];
    if (intentReason) {
      add(intentReason.reason, intentReason.key);
    } else {
      add(`💬 Both open to ${intentLabel(primary).toLowerCase()}`, `intent:${primary}`);
    }
  }

  if (kidsFamilySignals(viewerProfile) && kidsFamilySignals(targetProfile)) {
    add("👨‍👩‍👧 Family-oriented", "family");
  }

  const interestReason = reasonFromSharedInterests(
    viewerProfile.interests ?? [],
    targetProfile.interests ?? []
  );
  if (interestReason) {
    add(interestReason.reason, interestReason.key);
  }

  const sharedTraits = lifestyleTraits(viewerProfile).filter((trait) =>
    lifestyleTraits(targetProfile).includes(trait)
  );
  for (const trait of sharedTraits) {
    const lifestyleReason = LIFESTYLE_REASONS[trait];
    if (lifestyleReason) add(lifestyleReason.reason, lifestyleReason.key);
    if (reasons.length >= MAX_REASONS) return reasons;
  }

  const sharedOccupations = sharedList(occupationList(viewerProfile), occupationList(targetProfile));
  if (sharedOccupations.length) {
    const occupation = sharedOccupations[0];
    if (CAREER_OCCUPATIONS.has(occupation)) {
      add("🚀 Career-driven personalities", "career");
    } else {
      add(`💼 Both in ${occupation.toLowerCase()}`, `occupation:${normalizeText(occupation)}`);
    }
  }

  if (viewerProfile.city && targetProfile.city && viewerProfile.city === targetProfile.city) {
    add("📍 Same city connection", "location");
  } else if (targetProfile.distanceKm != null && targetProfile.distanceKm <= 15) {
    add("📍 Living nearby", "location");
  } else {
    const viewerState = profileState(viewerProfile);
    const targetState = profileState(targetProfile);
    if (viewerState && targetState && viewerState === targetState) {
      add("📍 Same state, close to home", "location");
    }

    const useEthnicity = viewerProfile.matchingPrivacy?.useEthnicityForMatching !== false;
    const viewerTribes = profileTribes(viewerProfile);
    const targetTribes = profileTribes(targetProfile);
    const sharedTribe = viewerTribes.find((tribe) => targetTribes.includes(tribe));
    if (useEthnicity && sharedTribe) {
      add(`🌍 Shared ${sharedTribe} roots`, `tribe:${normalizeText(sharedTribe)}`);
    }
  }

  return reasons.slice(0, MAX_REASONS);
}
