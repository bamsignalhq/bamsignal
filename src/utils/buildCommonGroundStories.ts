import { normalizeLifestyleTraits } from "../constants/profileOptions";
import {
  isRelationshipIntent,
  relationshipIntentsFrom
} from "../constants/relationshipIntent";
import type { MoreAboutMeId } from "../constants/moreAboutMe";
import type { DatingProfile, DiscoverProfile, IntentTag, RelationshipIntentId, Religion } from "../types";
import { hasMoreAboutMeItem, normalizeMoreAboutMeInterests } from "./moreAboutMe";
import { isPreferNot } from "./profile";
import { normalizeRelationshipIntents } from "./relationshipIntent";
import { safeArray } from "./safeProfile";
import { isTrustedMember } from "./trustedMember";
import { hasVoiceVibe } from "./voiceVibe";

export const COMMON_GROUND_TITLE = "Your Common Ground";
export const COMMON_GROUND_SUBTEXT = "Shared values matter";
export const COMMON_GROUND_LEDE = "Great relationships often begin with simple things";
export const COMMON_GROUND_EMPTY_HEADLINE = "No obvious common ground yet";
export const COMMON_GROUND_EMPTY_COPY = "Sometimes the best conversations begin with curiosity.";

export const MAX_COMMON_GROUND_STORIES = 5;
export const DISCOVER_COMMON_GROUND_STORIES = 2;

/** Reserved for future products — not implemented. */
export type CommonGroundFutureTier =
  | "ai-generated"
  | "circle-matchmaking"
  | "event-attendance"
  | "voice-sentiment"
  | "compatibility-explanations";

export type CommonGroundFutureConfig = {
  tier?: CommonGroundFutureTier;
  circleId?: string;
  eventId?: string;
  locale?: string;
};

export type CommonGroundStoryId =
  | "faith"
  | "faith-beliefs"
  | "relationship-meaningful"
  | "relationship-real"
  | "children"
  | "travel"
  | "music"
  | "movies"
  | "food"
  | "career"
  | "romantic"
  | "family-values"
  | "same-city"
  | "voice-vibe"
  | "trust";

export type CommonGroundStory = {
  id: CommonGroundStoryId;
  text: string;
};

export type CommonGroundProfile = {
  religion?: Religion | string;
  intents?: IntentTag[];
  interests?: string[];
  occupation?: string;
  occupations?: string[];
  lifestyle?: string;
  lifestyles?: string[];
  kidsPreference?: string;
  hasKidsOptions?: string[];
  wantsKidsOptions?: string[];
  city?: string;
  verified?: boolean;
  verificationStatus?: DatingProfile["verificationStatus"];
  voiceIntroUrl?: string;
  voiceVibeUrl?: string;
  matchingPrivacy?: DatingProfile["matchingPrivacy"];
};

export type BuildCommonGroundContext = {
  future?: CommonGroundFutureConfig;
};

type StoryCandidate = CommonGroundStory & { score: number };

const CAREER_OCCUPATIONS = new Set(["Business", "Tech", "Entrepreneur", "Finance"]);

const MORE_ABOUT_ME_STORIES: Partial<
  Record<MoreAboutMeId, { text: string; id: CommonGroundStoryId }>
> = {
  travel: { text: "✈ You both dream of exploring new places", id: "travel" },
  adventure: { text: "✈ You both dream of exploring new places", id: "travel" },
  beachTrips: { text: "✈ You both dream of exploring new places", id: "travel" },
  roadTrips: { text: "✈ You both dream of exploring new places", id: "travel" },
  music: { text: "🎵 Music is part of both your worlds", id: "music" },
  movies: { text: "🎬 Movie nights sound like a great idea", id: "movies" },
  foodLover: { text: "🍲 You both appreciate good food", id: "food" },
  suya: { text: "🍲 You both appreciate good food", id: "food" },
  romantic: { text: "💜 You both believe in meaningful connections", id: "romantic" },
  familyOriented: { text: "🏡 Family values matter to both of you", id: "family-values" },
  ambitious: { text: "🚀 Growth and ambition matter to both of you", id: "career" },
  entrepreneur: { text: "🚀 Growth and ambition matter to both of you", id: "career" },
  growthMindset: { text: "🚀 Growth and ambition matter to both of you", id: "career" },
  professional: { text: "🚀 Growth and ambition matter to both of you", id: "career" },
  faith: { text: "🙏 Shared beliefs are important to you", id: "faith-beliefs" }
};

function compatibilityIntents(intents: IntentTag[] | undefined): RelationshipIntentId[] {
  if (!intents?.length) return [];
  return relationshipIntentsFrom(normalizeRelationshipIntents(intents as string[]));
}

function lifestyleTraits(profile: CommonGroundProfile): string[] {
  return normalizeLifestyleTraits([
    ...safeArray<string>(profile.lifestyles),
    ...(profile.lifestyle && !isPreferNot(profile.lifestyle) ? [profile.lifestyle] : [])
  ]);
}

function occupationList(profile: CommonGroundProfile): string[] {
  const list = profile.occupations?.length
    ? profile.occupations
    : profile.occupation
      ? [profile.occupation]
      : [];
  return list.filter((value) => !isPreferNot(value));
}

function kidsFamilySignals(profile: CommonGroundProfile): boolean {
  const familyPrefs = new Set(["Has kids", "Wants kids", "Open to kids"]);
  if (profile.kidsPreference && familyPrefs.has(profile.kidsPreference)) return true;
  if (profile.hasKidsOptions?.some((option) => option === "Has kids")) return true;
  if (profile.wantsKidsOptions?.some((option) => option === "Wants kids" || option === "Open to kids")) {
    return true;
  }
  return lifestyleTraits(profile).includes("Family oriented");
}

function faithImportanceSignals(profile: CommonGroundProfile): boolean {
  if (profile.religion && !isPreferNot(profile.religion)) return true;
  if (hasMoreAboutMeItem(profile.interests, "faith")) return true;
  return lifestyleTraits(profile).includes("Faith centered");
}

function sharedMoreAboutMe(viewer: CommonGroundProfile, target: CommonGroundProfile): MoreAboutMeId[] {
  const a = normalizeMoreAboutMeInterests(viewer.interests);
  const b = normalizeMoreAboutMeInterests(target.interests);
  return a.filter((id) => b.includes(id));
}

function sharedOccupations(viewer: CommonGroundProfile, target: CommonGroundProfile): string[] {
  const setB = new Set(occupationList(target).map((item) => item.toLowerCase()));
  return occupationList(viewer).filter((item) => setB.has(item.toLowerCase()));
}

/** Warm shared-value stories — never scores, labels, or technical match language. */
export function buildCommonGroundStories(
  viewer: CommonGroundProfile,
  target: CommonGroundProfile,
  options?: BuildCommonGroundContext & { limit?: number }
): CommonGroundStory[] {
  void options?.future;
  const limit = options?.limit ?? MAX_COMMON_GROUND_STORIES;
  const candidates: StoryCandidate[] = [];
  const seen = new Set<CommonGroundStoryId>();

  const add = (id: CommonGroundStoryId, text: string, score: number) => {
    if (seen.has(id)) return;
    seen.add(id);
    candidates.push({ id, text, score });
  };

  const useReligion = viewer.matchingPrivacy?.useReligionForMatching !== false;
  const viewerIntents = compatibilityIntents(viewer.intents);
  const targetIntents = compatibilityIntents(target.intents);
  const sharedIntents = viewerIntents.filter((intent) => targetIntents.includes(intent));

  if (sharedIntents.includes("Marriage")) {
    add("relationship-meaningful", "💍 You're both looking for something meaningful", 98);
  } else if (sharedIntents.includes("SeriousRelationship")) {
    add("relationship-real", "❤️ Building something real matters to you", 96);
  } else if (sharedIntents.includes("MeaningfulConversations")) {
    add("relationship-meaningful", "💍 You're both looking for something meaningful", 88);
  } else if (sharedIntents.length) {
    const primary = sharedIntents[0];
    if (primary && isRelationshipIntent(primary)) {
      add("relationship-real", "❤️ Building something real matters to you", 84);
    }
  }

  if (
    useReligion &&
    !isPreferNot(viewer.religion) &&
    viewer.religion &&
    viewer.religion === target.religion
  ) {
    add("faith", "❤️ Faith matters to both of you", 94);
  } else if (faithImportanceSignals(viewer) && faithImportanceSignals(target)) {
    add("faith-beliefs", "🙏 Shared beliefs are important to you", 90);
  }

  if (kidsFamilySignals(viewer) && kidsFamilySignals(target)) {
    add("children", "👨‍👩‍👧 Family is important to both of you", 88);
  }

  if (viewer.city && target.city && viewer.city.trim().toLowerCase() === target.city.trim().toLowerCase()) {
    add("same-city", "🌆 You both call the same city home", 82);
  }

  if (hasVoiceVibe(viewer as Partial<DatingProfile>) && hasVoiceVibe(target as Partial<DatingProfile>)) {
    add("voice-vibe", "🎙 Both of you have shared your voices", 80);
  }

  if (isTrustedMember(viewer as Partial<DatingProfile>) && isTrustedMember(target as Partial<DatingProfile>)) {
    add("trust", "🛡 Both profiles are Trusted Members", 78);
  }

  const sharedTraits = lifestyleTraits(viewer).filter((trait) => lifestyleTraits(target).includes(trait));
  if (sharedTraits.includes("Family oriented") && !seen.has("children")) {
    add("family-values", "🏡 Family values matter to both of you", 76);
  }

  const sharedOcc = sharedOccupations(viewer, target);
  if (sharedOcc.some((occ) => CAREER_OCCUPATIONS.has(occ))) {
    add("career", "🚀 Growth and ambition matter to both of you", 74);
  }

  const sharedPicks = sharedMoreAboutMe(viewer, target);
  const pickPriority: MoreAboutMeId[] = [
    "romantic",
    "familyOriented",
    "travel",
    "music",
    "movies",
    "foodLover",
    "ambitious",
    "entrepreneur",
    "growthMindset",
    "faith"
  ];

  const orderedPicks = [
    ...pickPriority.filter((id) => sharedPicks.includes(id)),
    ...sharedPicks.filter((id) => !pickPriority.includes(id))
  ];

  for (const pick of orderedPicks) {
    const mapped = MORE_ABOUT_ME_STORIES[pick];
    if (!mapped) continue;
    if (mapped.id === "family-values" && seen.has("children")) continue;
    add(mapped.id, mapped.text, 70 - orderedPicks.indexOf(pick));
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, limit))
    .map(({ id, text }) => ({ id, text }));
}

export type { DatingProfile, DiscoverProfile };
