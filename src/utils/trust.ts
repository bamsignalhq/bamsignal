import type { DatingProfile } from "../types";
import { calculateProfileStrength } from "./profileStrength";
import { getVerificationTier } from "./verification";

export type TrustLevel = "none" | "trusted-member" | "signal-trusted" | "premium-trusted";

export type TrustInfo = {
  level: TrustLevel;
  label: string;
};

export function getTrustLevel(
  profile: DatingProfile,
  isPremium: boolean,
  phoneVerified: boolean,
  reportCount = 0
): TrustInfo {
  const verification = getVerificationTier(profile, isPremium, phoneVerified);
  const strength = calculateProfileStrength(profile);
  const accountAgeDays = profile.createdAt
    ? Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86400000)
    : 0;
  const cleanRecord = reportCount === 0;

  if (verification.tier >= 3 && cleanRecord) {
    return { level: "premium-trusted", label: "Premium Trusted" };
  }
  if (verification.tier >= 2 && accountAgeDays >= 7 && cleanRecord) {
    return { level: "signal-trusted", label: "Signal Trusted" };
  }
  if (strength >= 50 && (verification.tier >= 1 || accountAgeDays >= 3) && cleanRecord) {
    return { level: "trusted-member", label: "Trusted Member" };
  }
  return { level: "none", label: "" };
}
