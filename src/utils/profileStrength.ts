import type { DatingProfile } from "../types";
import { isPreferNot } from "./profile";

export type ProfileCompletenessItem = {
  id: "photo" | "bio" | "interests" | "intent" | "verification" | "voice";
  label: string;
  done: boolean;
};

const CHECKLIST: { id: ProfileCompletenessItem["id"]; label: string }[] = [
  { id: "photo", label: "Photo" },
  { id: "bio", label: "Bio" },
  { id: "interests", label: "Interests" },
  { id: "intent", label: "Intent" },
  { id: "verification", label: "Verification" },
  { id: "voice", label: "Voice Intro" }
];

export function getProfileCompletenessChecklist(profile: DatingProfile): ProfileCompletenessItem[] {
  const doneMap: Record<ProfileCompletenessItem["id"], boolean> = {
    photo: profile.photos.length > 0,
    bio: profile.bio.trim().length >= 12,
    interests: (profile.interests?.length ?? 0) >= 2,
    intent: (profile.intents?.length ?? 0) >= 1,
    verification: profile.verified,
    voice: Boolean(profile.voiceIntroUrl)
  };

  return CHECKLIST.map((item) => ({
    ...item,
    done: doneMap[item.id]
  }));
}

export function profileCompletenessCount(profile: DatingProfile): { done: number; total: number } {
  const checklist = getProfileCompletenessChecklist(profile);
  return {
    done: checklist.filter((item) => item.done).length,
    total: checklist.length
  };
}

/** 0–100 — completion drives discover ranking */
export function calculateProfileStrength(profile: DatingProfile): number {
  const { done, total } = profileCompletenessCount(profile);
  return Math.round((done / total) * 100);
}

export function profileStrengthHint(strength: number): string {
  if (strength >= 100) return "Your profile is fully optimized for discovery.";
  if (strength >= 80) return "Almost there — complete the last items for better ranking.";
  if (strength >= 50) return "Complete your profile to get more signals.";
  return "Add photos and details so more people discover you.";
}

export function getProfileStrengthSuggestions(profile: DatingProfile): string[] {
  return getProfileCompletenessChecklist(profile)
    .filter((item) => !item.done)
    .map((item) => item.label)
    .slice(0, 3);
}

/** Legacy breakdown for any remaining consumers */
export type ProfileStrengthBreakdown = {
  photo: boolean;
  bio: boolean;
  city: boolean;
  interests: boolean;
  intent: boolean;
  lifestyle: boolean;
  religion: boolean;
  ethnicity: boolean;
  verification: boolean;
};

export function getProfileStrengthBreakdown(profile: DatingProfile): ProfileStrengthBreakdown {
  return {
    photo: profile.photos.length > 0,
    bio: profile.bio.trim().length >= 12,
    city: Boolean(profile.city?.trim()),
    interests: (profile.interests?.length ?? 0) >= 2,
    intent: (profile.intents?.length ?? 0) >= 1,
    lifestyle: Boolean(profile.lifestyle && !isPreferNot(profile.lifestyle)),
    religion: Boolean(profile.religion && !isPreferNot(profile.religion)),
    ethnicity: Boolean(profile.ethnicity && !isPreferNot(profile.ethnicity)),
    verification: profile.verified
  };
}
