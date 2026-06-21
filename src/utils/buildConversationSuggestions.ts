import { normalizeLifestyleTraits } from "../constants/profileOptions";
import { relationshipIntentsFrom } from "../constants/relationshipIntent";
import type { MoreAboutMeId } from "../constants/moreAboutMe";
import type { DatingProfile, DiscoverProfile, IntentTag } from "../types";
import { hasMoreAboutMeItem, normalizeMoreAboutMeInterests } from "./moreAboutMe";
import { isPreferNot } from "./profile";
import { isTrustedMember } from "./trustedMember";
import { hasVoiceVibe } from "./voiceVibe";

export const SMART_CONVERSATION_TITLE = "Start With Something Meaningful";
export const SMART_CONVERSATION_HINT = "Need inspiration?";
export const SMART_CONVERSATION_LEDE = "Good conversations start with curiosity";
export const MATCH_CONVERSATION_EYEBROW = "You connected 🎉";

export const MIN_CONVERSATION_SUGGESTIONS = 4;
export const MAX_CONVERSATION_SUGGESTIONS = 8;
export const MATCH_CONVERSATION_SUGGESTIONS = 6;

/** Reserved for future products — not implemented. */
export type ConversationSuggestionsFutureTier =
  | "ai-generated"
  | "festival-specific"
  | "voice-sentiment"
  | "language-preferences"
  | "circle-matchmaking";

export type ConversationSuggestionsFutureConfig = {
  tier?: ConversationSuggestionsFutureTier;
  festivalSlug?: string;
  locale?: string;
  circleId?: string;
};

export type ConversationSuggestionCategory =
  | "voice-vibe"
  | "relationship"
  | "faith"
  | "more-about-me"
  | "travel"
  | "food"
  | "movies"
  | "music"
  | "career"
  | "city"
  | "trusted"
  | "universal";

export type ConversationSuggestion = {
  id: string;
  text: string;
  category: ConversationSuggestionCategory;
};

export type ConversationProfile = {
  religion?: string;
  intents?: IntentTag[];
  interests?: string[];
  occupation?: string;
  occupations?: string[];
  lifestyle?: string;
  lifestyles?: string[];
  city?: string;
  verified?: boolean;
  verificationStatus?: DatingProfile["verificationStatus"];
  voiceIntroUrl?: string;
  voiceVibeUrl?: string;
};

type Candidate = ConversationSuggestion & { score: number };

const CATEGORY_PRIORITY: Record<ConversationSuggestionCategory, number> = {
  "voice-vibe": 100,
  relationship: 95,
  faith: 90,
  "more-about-me": 85,
  travel: 80,
  food: 75,
  movies: 70,
  music: 65,
  career: 60,
  city: 55,
  trusted: 50,
  universal: 10
};

const VOICE_VIBE_SUGGESTIONS: ConversationSuggestion[] = [
  {
    id: "voice-inspired",
    text: "🎙 I enjoyed your Voice Vibe. What inspired it?",
    category: "voice-vibe"
  },
  {
    id: "voice-passion",
    text: "😊 You sound easygoing. What's something you're passionate about?",
    category: "voice-vibe"
  }
];

const FAITH_SUGGESTIONS: ConversationSuggestion[] = [
  { id: "faith-role", text: "🙏 What role does faith play in your life?", category: "faith" },
  { id: "faith-grateful", text: "💜 What's something you're grateful for lately?", category: "faith" }
];

const RELATIONSHIP_SUGGESTIONS: ConversationSuggestion[] = [
  { id: "rel-bamsignal", text: "❤️ What brought you to BamSignal?", category: "relationship" },
  {
    id: "rel-meaningful",
    text: "💍 What does a meaningful relationship look like to you?",
    category: "relationship"
  }
];

const TRAVEL_SUGGESTIONS: ConversationSuggestion[] = [
  { id: "travel-dream", text: "✈ What's your dream country to visit?", category: "travel" },
  { id: "travel-favorite", text: "🌍 Favorite city you've been to?", category: "travel" }
];

const MOVIES_SUGGESTIONS: ConversationSuggestion[] = [
  { id: "movies-recent", text: "🎬 Best movie you've watched recently?", category: "movies" },
  { id: "movies-format", text: "🍿 Cinema or Netflix?", category: "movies" }
];

const MUSIC_SUGGESTIONS: ConversationSuggestion[] = [
  { id: "music-artist", text: "🎵 Which artist is on repeat lately?", category: "music" },
  { id: "music-comfort", text: "🎧 What's your comfort song?", category: "music" }
];

const FOOD_SUGGESTIONS: ConversationSuggestion[] = [
  { id: "food-dish", text: "🍲 Favorite Nigerian dish?", category: "food" },
  { id: "food-suya", text: "🍢 Suya or shawarma?", category: "food" },
  { id: "food-pepper", text: "🌶 Can you handle pepper?", category: "food" }
];

const CAREER_SUGGESTIONS: ConversationSuggestion[] = [
  { id: "career-dream", text: "🚀 What's a dream you're working towards?", category: "career" },
  { id: "career-enjoy", text: "💼 What do you enjoy most about your work?", category: "career" }
];

const CITY_SUGGESTIONS: ConversationSuggestion[] = [
  { id: "city-favorite", text: "🌆 Favorite place in the city?", category: "city" },
  { id: "city-weekend", text: "☀ What's your perfect weekend like?", category: "city" }
];

const TRUSTED_SUGGESTIONS: ConversationSuggestion[] = [
  {
    id: "trusted-why",
    text: "💜 What made you become a Trusted Member?",
    category: "trusted"
  }
];

const MORE_ABOUT_ME_SUGGESTIONS: Partial<Record<MoreAboutMeId, ConversationSuggestion>> = {
  music: { id: "mam-music-genre", text: "🎵 What genre do you enjoy most?", category: "more-about-me" },
  travel: { id: "mam-travel-seat", text: "✈ Window seat or aisle seat?", category: "more-about-me" },
  familyOriented: {
    id: "mam-family-value",
    text: "🏡 What value matters most to you?",
    category: "more-about-me"
  },
  romantic: {
    id: "mam-romantic-date",
    text: "❤️ What's your idea of a perfect date?",
    category: "more-about-me"
  },
  foodLover: { id: "mam-food-jollof", text: "🍛 Jollof or fried rice?", category: "more-about-me" }
};

const UNIVERSAL_SUGGESTIONS: ConversationSuggestion[] = [
  { id: "universal-vibe", text: "✨ You have a lovely vibe", category: "universal" },
  { id: "universal-talk", text: "🌸 You seem easy to talk to", category: "universal" },
  { id: "food-dish-fallback", text: "🍲 Favorite Nigerian dish?", category: "universal" },
  { id: "music-artist-fallback", text: "🎵 Which artist is on repeat lately?", category: "universal" },
  { id: "travel-dream-fallback", text: "✈ What's your dream country to visit?", category: "universal" },
  { id: "rel-bamsignal-fallback", text: "❤️ What brought you to BamSignal?", category: "universal" },
  { id: "movies-recent-fallback", text: "🎬 Best movie you've watched recently?", category: "universal" },
  { id: "city-weekend-fallback", text: "☀ What's your perfect weekend like?", category: "universal" }
];

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const list = [...items];
  let state = hashSeed(seed);
  for (let i = list.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function lifestyleTraits(profile: ConversationProfile): string[] {
  return normalizeLifestyleTraits([
    ...(profile.lifestyles ?? []),
    ...(profile.lifestyle && !isPreferNot(profile.lifestyle) ? [profile.lifestyle] : [])
  ]);
}

function faithSignals(profile: ConversationProfile): boolean {
  if (profile.religion && !isPreferNot(profile.religion)) return true;
  if (hasMoreAboutMeItem(profile.interests, "faith")) return true;
  return lifestyleTraits(profile).includes("Faith centered");
}

function hasTravelInterest(profile: ConversationProfile): boolean {
  const picks = normalizeMoreAboutMeInterests(profile.interests);
  return picks.some((id) =>
    ["travel", "adventure", "beachTrips", "roadTrips"].includes(id)
  );
}

function hasCareerSignals(profile: ConversationProfile): boolean {
  const occ = profile.occupations?.length
    ? profile.occupations
    : profile.occupation
      ? [profile.occupation]
      : [];
  if (occ.some((item) => !isPreferNot(item))) return true;
  return (
    hasMoreAboutMeItem(profile.interests, "ambitious") ||
    hasMoreAboutMeItem(profile.interests, "entrepreneur") ||
    hasMoreAboutMeItem(profile.interests, "professional") ||
    hasMoreAboutMeItem(profile.interests, "growthMindset")
  );
}

function addCandidates(out: Candidate[], items: ConversationSuggestion[], bump = 0) {
  for (const item of items) {
    out.push({ ...item, score: CATEGORY_PRIORITY[item.category] + bump });
  }
}

/** Warm, profile-aware conversation openers — never auto-send or robotic. */
export function buildConversationSuggestions(
  viewer: ConversationProfile,
  target: ConversationProfile,
  options?: {
    limit?: number;
    seed?: string;
    future?: ConversationSuggestionsFutureConfig;
  }
): ConversationSuggestion[] {
  void options?.future;
  const limit = Math.min(
    MAX_CONVERSATION_SUGGESTIONS,
    Math.max(MIN_CONVERSATION_SUGGESTIONS, options?.limit ?? MAX_CONVERSATION_SUGGESTIONS)
  );
  const seed =
    options?.seed ??
    `${target.city ?? ""}:${normalizeMoreAboutMeInterests(target.interests).join(",")}`;

  const candidates: Candidate[] = [];
  const hasTarget = Boolean(
    target.city ||
      target.interests?.length ||
      target.intents?.length ||
      hasVoiceVibe(target) ||
      target.verified
  );

  if (hasVoiceVibe(target)) {
    addCandidates(candidates, VOICE_VIBE_SUGGESTIONS, 2);
  }

  if (relationshipIntentsFrom(target.intents).length) {
    addCandidates(candidates, RELATIONSHIP_SUGGESTIONS, 1);
  }

  if (faithSignals(target)) {
    addCandidates(candidates, FAITH_SUGGESTIONS, 1);
  }

  for (const id of normalizeMoreAboutMeInterests(target.interests)) {
    const mapped = MORE_ABOUT_ME_SUGGESTIONS[id];
    if (mapped) {
      candidates.push({ ...mapped, score: CATEGORY_PRIORITY["more-about-me"] + 1 });
    }
  }

  if (hasTravelInterest(target)) {
    addCandidates(candidates, TRAVEL_SUGGESTIONS, 0);
  }

  if (hasMoreAboutMeItem(target.interests, "foodLover") || hasMoreAboutMeItem(target.interests, "suya")) {
    addCandidates(candidates, FOOD_SUGGESTIONS, 0);
  } else if (!hasTarget) {
    addCandidates(candidates, FOOD_SUGGESTIONS.slice(0, 2), -5);
  }

  if (hasMoreAboutMeItem(target.interests, "movies")) {
    addCandidates(candidates, MOVIES_SUGGESTIONS, 0);
  }

  if (hasMoreAboutMeItem(target.interests, "music")) {
    addCandidates(candidates, MUSIC_SUGGESTIONS, 0);
  } else if (!hasTarget) {
    addCandidates(candidates, MUSIC_SUGGESTIONS.slice(0, 1), -5);
  }

  if (hasCareerSignals(target)) {
    addCandidates(candidates, CAREER_SUGGESTIONS, 0);
  }

  if (
    viewer.city &&
    target.city &&
    viewer.city.trim().toLowerCase() === target.city.trim().toLowerCase()
  ) {
    addCandidates(candidates, CITY_SUGGESTIONS, 1);
  }

  if (isTrustedMember(target as Partial<DatingProfile>)) {
    addCandidates(candidates, TRUSTED_SUGGESTIONS, 0);
  }

  if (!candidates.length || candidates.length < MIN_CONVERSATION_SUGGESTIONS) {
    addCandidates(candidates, UNIVERSAL_SUGGESTIONS, -8);
  }

  const seenText = new Set<string>();
  const seenId = new Set<string>();
  const ranked = seededShuffle(
    candidates.sort((a, b) => b.score - a.score),
    seed
  );

  const chosen: ConversationSuggestion[] = [];
  for (const item of ranked) {
    const key = item.text.trim().toLowerCase();
    if (seenText.has(key) || seenId.has(item.id)) continue;
    seenText.add(key);
    seenId.add(item.id);
    chosen.push({ id: item.id, text: item.text, category: item.category });
    if (chosen.length >= limit) break;
  }

  for (const fallback of seededShuffle(UNIVERSAL_SUGGESTIONS, `${seed}:fallback`)) {
    if (chosen.length >= limit) break;
    const key = fallback.text.trim().toLowerCase();
    if (seenText.has(key)) continue;
    seenText.add(key);
    chosen.push(fallback);
  }

  return chosen.slice(0, limit);
}

export type { DatingProfile, DiscoverProfile };
