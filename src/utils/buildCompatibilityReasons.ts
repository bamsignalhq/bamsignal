import { relationshipIntentLabel } from "../constants/relationshipIntent";
import {
  isRelationshipIntent,
  relationshipIntentsFrom
} from "../constants/relationshipIntent";
import { normalizeRelationshipIntents } from "./relationshipIntent";
import {
  normalizeLifestyleTraits,
  resolveStateName,
  stateForCity
} from "../constants/profileOptions";
import type { DatingProfile, DiscoverProfile, IntentTag, RelationshipIntentId } from "../types";
import { isPreferNot } from "./profile";
import { safeArray } from "./safeProfile";
import {
  MORE_ABOUT_ME_COMPATIBILITY,
  normalizeMoreAboutMeInterests
} from "./moreAboutMe";
import type { MoreAboutMeId } from "../constants/moreAboutMe";

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

const LIFESTYLE_REASONS: Record<string, { reason: string; key: string }> = {
  "Family oriented": { reason: "👨‍👩‍👧 Family-oriented", key: "family" },
  "Career focused": { reason: "🚀 Career-driven personalities", key: "career" },
  "Fitness conscious": { reason: "🏃 Health-conscious lifestyles", key: "fitness" },
  "Travel lover": { reason: "✈️ Both love travelling", key: "travel" },
  "Food lover": { reason: "🍲 Food lovers", key: "food" },
  "Faith centered": { reason: "❤️ Both value faith", key: "faith" }
};

const INTENT_REASONS: Partial<Record<IntentTag, { reason: string; key: string }>> = {
  Marriage: { reason: "💍 Both are looking for marriage", key: "marriage" },
  SeriousRelationship: { reason: "❤️ Both want something serious", key: "serious" },
  Friendship: { reason: "🤝 Both enjoy meaningful connections", key: "friendship" },
  Companionship: { reason: "🌍 Both value companionship", key: "companionship" },
  OpenToPossibilities: { reason: "✨ Both are open to possibilities", key: "open" },
  MeaningfulConversations: { reason: "☕ Both enjoy meaningful conversations", key: "conversations" },
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

function compatibilityIntents(intents: IntentTag[] | string[] | undefined): RelationshipIntentId[] {
  if (!intents?.length) return [];
  return relationshipIntentsFrom(normalizeRelationshipIntents(intents as string[]));
}

function reasonsFromSharedMoreAboutMe(
  viewerInterests: string[],
  targetInterests: string[],
  max = 2
): { reason: string; key: string }[] {
  const viewer = normalizeMoreAboutMeInterests(viewerInterests);
  const target = normalizeMoreAboutMeInterests(targetInterests);
  const shared = viewer.filter((id) => target.includes(id));
  if (!shared.length) return [];

  const priority: MoreAboutMeId[] = [
    "romantic",
    "familyOriented",
    "music",
    "travel",
    "movies",
    "foodLover",
    "reading",
    "ambitious",
    "fitness",
    "entrepreneur"
  ];

  const ordered = [
    ...priority.filter((id) => shared.includes(id)),
    ...shared.filter((id) => !priority.includes(id))
  ];

  const out: { reason: string; key: string }[] = [];
  const seenKeys = new Set<string>();

  for (const id of ordered) {
    if (out.length >= max) break;
    const mapped = MORE_ABOUT_ME_COMPATIBILITY[id];
    if (!mapped || seenKeys.has(mapped.key)) continue;
    seenKeys.add(mapped.key);
    out.push(mapped);
  }

  return out;
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

  for (const item of reasonsFromSharedMoreAboutMe(
    viewerProfile.interests ?? [],
    targetProfile.interests ?? []
  )) {
    add(item.reason, item.key);
  }

  const viewerIntents = compatibilityIntents(viewerProfile.intents);
  const targetIntents = compatibilityIntents(targetProfile.intents);
  const sharedIntents = viewerIntents.filter((intent) => targetIntents.includes(intent));
  if (sharedIntents.length) {
    const priority: RelationshipIntentId[] = [
      "Marriage",
      "SeriousRelationship",
      "MeaningfulConversations",
      "Friendship",
      "Companionship",
      "OpenToPossibilities"
    ];
    const primary = priority.find((intent) => sharedIntents.includes(intent)) ?? sharedIntents[0];
    const intentReason = primary ? INTENT_REASONS[primary] : undefined;
    if (intentReason) {
      add(intentReason.reason, intentReason.key);
    } else if (primary && isRelationshipIntent(primary)) {
      add(`🤝 Both enjoy ${relationshipIntentLabel(primary).toLowerCase()}`, `intent:${primary}`);
    }
  }

  const useReligion = viewerProfile.matchingPrivacy?.useReligionForMatching !== false;

  if (
    useReligion &&
    !isPreferNot(viewerProfile.religion) &&
    viewerProfile.religion &&
    viewerProfile.religion === targetProfile.religion
  ) {
    add("❤️ Both value faith", "faith");
  }

  if (kidsFamilySignals(viewerProfile) && kidsFamilySignals(targetProfile)) {
    add("👨‍👩‍👧 Family-oriented", "family");
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
