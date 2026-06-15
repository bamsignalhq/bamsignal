import type { DatingProfile } from "../types";

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
  const selfieApproved = profile.verified;

  if (isPremium && phoneVerified && selfieApproved) {
    return { tier: 3, label: "Premium Verified", emoji: "🟣", color: "purple" };
  }
  if (phoneVerified && selfieApproved) {
    return { tier: 2, label: "Verified", emoji: "🟢", color: "green" };
  }
  if (phoneVerified) {
    return { tier: 1, label: "Phone Verified", emoji: "📱", color: "blue" };
  }
  return { tier: 0, label: "", emoji: "", color: "green" };
}
