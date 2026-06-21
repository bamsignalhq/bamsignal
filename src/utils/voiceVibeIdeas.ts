import { normalizeLifestyleTraits } from "../constants/profileOptions";
import { relationshipIntentsFrom } from "../constants/relationshipIntent";
import {
  VOICE_VIBE_IDEAS,
  type VoiceVibeIdea,
  type VoiceVibeIdeaCategoryId,
  type VoiceVibeIdeasFutureConfig
} from "../constants/voiceVibeIdeas";
import type { DatingProfile } from "../types";
import { hasMoreAboutMeItem, normalizeMoreAboutMeInterests } from "./moreAboutMe";
import { isPreferNot } from "./profile";
import { safeArray } from "./safeProfile";

export type VoiceVibeIdeasProfile = Pick<
  DatingProfile,
  | "city"
  | "religion"
  | "intents"
  | "interests"
  | "lifestyle"
  | "lifestyles"
  | "kidsPreference"
  | "hasKidsOptions"
  | "wantsKidsOptions"
>;

const DISPLAY_LIMIT = 4;

const CATEGORY_BOOST: Partial<Record<VoiceVibeIdeaCategoryId, number>> = {
  relationship: 0,
  faith: 0,
  travel: 0,
  family: 0,
  warm: 0,
  funny: 0,
  professional: 0,
  simple: 0
};

function profileLifestyleTraits(profile: Pick<DatingProfile, "lifestyle" | "lifestyles">): string[] {
  return normalizeLifestyleTraits([
    ...safeArray<string>(profile.lifestyles),
    ...(profile.lifestyle && !isPreferNot(profile.lifestyle) ? [profile.lifestyle] : [])
  ]);
}

function hasStrongFaithProfile(profile: Pick<DatingProfile, "religion" | "interests" | "lifestyle" | "lifestyles">): boolean {
  if (profile.religion && !isPreferNot(profile.religion)) return true;
  if (hasMoreAboutMeItem(profile.interests, "faith")) return true;
  return profileLifestyleTraits(profile).includes("Faith centered");
}

function isFamilyOrientedProfile(
  profile: Pick<DatingProfile, "interests" | "lifestyle" | "lifestyles" | "kidsPreference" | "hasKidsOptions" | "wantsKidsOptions">
): boolean {
  if (hasMoreAboutMeItem(profile.interests, "familyOriented")) return true;
  if (profileLifestyleTraits(profile).includes("Family oriented")) return true;
  const familyPrefs = new Set(["Has kids", "Wants kids", "Open to kids"]);
  if (profile.kidsPreference && familyPrefs.has(profile.kidsPreference)) return true;
  if (profile.hasKidsOptions?.some((option) => option === "Has kids")) return true;
  if (profile.wantsKidsOptions?.some((option) => option === "Wants kids" || option === "Open to kids")) return true;
  return false;
}

function hasTravelProfile(profile: Pick<DatingProfile, "interests">): boolean {
  const picks = normalizeMoreAboutMeInterests(profile.interests);
  return picks.some((id) => id === "travel" || id === "adventure" || id === "beachTrips" || id === "roadTrips");
}

function categoryBoosts(profile: VoiceVibeIdeasProfile): Partial<Record<VoiceVibeIdeaCategoryId, number>> {
  const boosts = { ...CATEGORY_BOOST };
  const intents = relationshipIntentsFrom(profile.intents);

  if (intents.includes("Marriage")) {
    boosts.relationship = (boosts.relationship ?? 0) + 100;
  } else if (intents.includes("SeriousRelationship")) {
    boosts.relationship = (boosts.relationship ?? 0) + 60;
  }

  if (hasStrongFaithProfile(profile)) {
    boosts.faith = (boosts.faith ?? 0) + 90;
  }

  if (hasTravelProfile(profile)) {
    boosts.travel = (boosts.travel ?? 0) + 80;
  }

  if (isFamilyOrientedProfile(profile)) {
    boosts.family = (boosts.family ?? 0) + 80;
  }

  boosts.warm = (boosts.warm ?? 0) + 10;
  boosts.simple = (boosts.simple ?? 0) + 5;

  return boosts;
}

export function personalizeVoiceVibeIdeaText(
  idea: VoiceVibeIdea,
  input: { memberName?: string; city?: string }
): string {
  const name = input.memberName?.trim().split(/\s+/)[0];
  const city = input.city?.trim();

  if (idea.id === "warm-lagos" && (name || city)) {
    if (name && city) {
      return idea.text.replace("Hi, I'm Alex from Lagos.", `Hi, I'm ${name} from ${city}.`);
    }
    if (name) {
      return idea.text.replace("Hi, I'm Alex from Lagos.", `Hi, I'm ${name}.`);
    }
    return idea.text.replace("Hi, I'm Alex from Lagos.", `Hi, I'm from ${city}.`);
  }

  return idea.text;
}

export function rankVoiceVibeIdeasForProfile(
  profile: VoiceVibeIdeasProfile,
  options?: { limit?: number; future?: VoiceVibeIdeasFutureConfig }
): VoiceVibeIdea[] {
  void options?.future;
  const boosts = categoryBoosts(profile);
  const limit = options?.limit ?? DISPLAY_LIMIT;

  return [...VOICE_VIBE_IDEAS]
    .map((idea, index) => ({
      idea,
      score: (boosts[idea.category] ?? 0) - index * 0.01
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.idea);
}

export function readVoiceVibeIdeaAloud(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/\n+/g, " "));
  utterance.lang = "en-NG";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export function stopVoiceVibeIdeaAloud(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
