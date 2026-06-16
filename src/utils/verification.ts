import type { DatingProfile } from "../types";
import { calculateProfileStrength } from "./profileStrength";

export type VerificationTier = 0 | 1 | 2 | 3 | 4 | 5;

export type VerificationInfo = {
  tier: VerificationTier;
  label: string;
  emoji: string;
  color: "green" | "blue" | "purple" | "neutral";
};

const PROFILE_COMPLETE_MIN = 70;

export function getVerificationTier(
  profile: DatingProfile,
  isPremium: boolean,
  phoneVerified: boolean
): VerificationInfo {
  const selfieApproved = profile.verified;
  const strength = calculateProfileStrength(profile);
  const profileComplete = strength >= PROFILE_COMPLETE_MIN;

  if (phoneVerified && selfieApproved && isPremium && profileComplete) {
    return { tier: 5, label: "Fully Verified", emoji: "", color: "neutral" };
  }
  if (isPremium && phoneVerified && selfieApproved) {
    return { tier: 4, label: "Premium Verified", emoji: "", color: "neutral" };
  }
  if (isPremium) {
    return { tier: 3, label: "Signal Pass", emoji: "", color: "neutral" };
  }
  if (phoneVerified && selfieApproved) {
    return { tier: 2, label: "Verified", emoji: "", color: "neutral" };
  }
  if (phoneVerified) {
    return { tier: 1, label: "Phone Verified", emoji: "", color: "neutral" };
  }
  return { tier: 0, label: "", emoji: "", color: "neutral" };
}
