import type { DatingProfile } from "../types";
import { isPreferNot } from "./profile";

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

const WEIGHTS = {
  photo: 15,
  bio: 10,
  city: 10,
  interests: 10,
  intent: 10,
  lifestyle: 10,
  religion: 10,
  ethnicity: 10,
  verification: 15
} as const;

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

export function calculateProfileStrength(profile: DatingProfile): number {
  const b = getProfileStrengthBreakdown(profile);
  let total = 0;
  if (b.photo) total += WEIGHTS.photo;
  if (b.bio) total += WEIGHTS.bio;
  if (b.city) total += WEIGHTS.city;
  if (b.interests) total += WEIGHTS.interests;
  if (b.intent) total += WEIGHTS.intent;
  if (b.lifestyle) total += WEIGHTS.lifestyle;
  if (b.religion) total += WEIGHTS.religion;
  if (b.ethnicity) total += WEIGHTS.ethnicity;
  if (b.verification) total += WEIGHTS.verification;
  return Math.min(100, total);
}

export function profileStrengthHint(strength: number): string {
  if (strength >= 100) return "Your profile is fully optimized for signals.";
  if (strength >= 80) return "Strong profile — keep your photos fresh.";
  if (strength >= 50) return "Complete your profile to get more signals.";
  return "Add photos and details so more people discover you.";
}

/** Up to 3 actionable suggestions for the dashboard strength card */
export function getProfileStrengthSuggestions(profile: DatingProfile): string[] {
  const b = getProfileStrengthBreakdown(profile);
  const out: string[] = [];
  if (!profile.voiceIntroUrl) out.push("Add voice intro");
  if (!b.interests) out.push("Complete interests");
  if (!b.verification) out.push("Verify profile");
  if (!b.photo) out.push("Add a clear photo");
  if (!b.bio) out.push("Write your bio");
  if (!b.lifestyle && out.length < 3) out.push("Add your lifestyle");
  return out.slice(0, 3);
}
