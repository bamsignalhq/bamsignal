import type { DatingProfile } from "../types";
import { normalizeEthnicities } from "../constants/profileOptions";
import { safeString } from "./safeProfile";
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
    bio: safeString(profile.bio).trim().length >= 12,
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
  if (strength >= 100) return "You're shining — people can see the real you.";
  if (strength >= 80) return "Almost there. A few more details and you'll stand out.";
  if (strength >= 50) return "You're on your way. Complete your profile to attract the right connections.";
  return "Add photos and a little about you — it helps the right people find you.";
}

export function getProfileStrengthSuggestions(profile: DatingProfile): string[] {
  const friendly: Record<ProfileCompletenessItem["id"], string> = {
    photo: "Add a clear photo",
    bio: "Share a little about you",
    interests: "Add a few interests",
    intent: "Share what you're open to",
    verification: "Verify your profile",
    voice: "Add a voice greeting"
  };

  return getProfileCompletenessChecklist(profile)
    .filter((item) => !item.done)
    .map((item) => friendly[item.id])
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
    bio: safeString(profile.bio).trim().length >= 12,
    city: Boolean(profile.city?.trim()),
    interests: (profile.interests?.length ?? 0) >= 2,
    intent: (profile.intents?.length ?? 0) >= 1,
    lifestyle: Boolean(profile.lifestyle && !isPreferNot(profile.lifestyle)),
    religion: Boolean(profile.religion && !isPreferNot(profile.religion)),
    ethnicity: Boolean(
      normalizeEthnicities(profile.ethnicities, profile.ethnicity).length > 0
    ),
    verification: profile.verified
  };
}
