import type { DatingProfile } from "../types";
import { calculateProfileStrength } from "./profileStrength";

export type VerificationTier = 0 | 1 | 2 | 3;

export type VerificationInfo = {
  tier: VerificationTier;
  label: string;
  emoji: string;
  color: "green" | "blue" | "purple";
};

export function getVerificationTier(
  profile: DatingProfile,
  isPremium: boolean,
  phoneVerified: boolean
): VerificationInfo {
  const strength = calculateProfileStrength(profile);
  const selfieOk = profile.verified;
  const tier1 = phoneVerified && selfieOk;

  if (isPremium && tier1 && strength >= 80) {
    return { tier: 3, label: "Premium Verified", emoji: "🟣", color: "purple" };
  }
  if (tier1 && strength >= 80) {
    return { tier: 2, label: "Verified Plus", emoji: "🔵", color: "blue" };
  }
  if (tier1) {
    return { tier: 1, label: "Verified", emoji: "🟢", color: "green" };
  }
  return { tier: 0, label: "", emoji: "", color: "green" };
}
