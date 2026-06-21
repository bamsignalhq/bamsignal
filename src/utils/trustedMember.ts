import type { DatingProfile } from "../types";

export type TrustedMemberStep = "intro" | "tips" | "verify" | "pending" | "celebration";

/** Reserved for future tiers — not implemented. */
export type TrustedMemberFutureTier = "trusted-member-plus" | "manual-review" | "video";

export type TrustedMemberFutureConfig = {
  tier?: TrustedMemberFutureTier;
  manualReviewLevel?: number;
  videoVerification?: boolean;
};

const CELEBRATION_SEEN_KEY = "bamsignal_trusted_member_celebration_seen";

export function isTrustedMember(profile: Partial<DatingProfile>): boolean {
  return Boolean(profile.verified) || profile.verificationStatus === "approved";
}

export function isTrustedMemberPending(profile: Partial<DatingProfile>): boolean {
  if (isTrustedMember(profile)) return false;
  return (
    profile.verificationStatus === "pending" ||
    profile.verificationStatus === "rejected" ||
    Boolean(profile.verificationSelfie)
  );
}

export function trustedMemberInitialStep(
  profile: Partial<DatingProfile>,
  phoneVerified: boolean
): TrustedMemberStep {
  if (isTrustedMember(profile)) return "celebration";
  if (isTrustedMemberPending(profile)) return "pending";
  if (phoneVerified) return "verify";
  return "intro";
}

export function shouldShowTrustedMemberCelebration(profile: Partial<DatingProfile>): boolean {
  if (!isTrustedMember(profile)) return false;
  try {
    return localStorage.getItem(CELEBRATION_SEEN_KEY) !== "true";
  } catch {
    return true;
  }
}

export function markTrustedMemberCelebrationSeen(): void {
  try {
    localStorage.setItem(CELEBRATION_SEEN_KEY, "true");
  } catch {
    // ignore
  }
}

export const TRUSTED_MEMBER_PHOTO_TIPS = [
  "Use good lighting",
  "Keep your face visible",
  "No sunglasses",
  "No filters",
  "No AI images"
] as const;

export const TRUSTED_MEMBER_BENEFITS = [
  "Better visibility",
  "Higher reply rates",
  "More trust from members",
  "Stronger profile strength",
  "Priority in search",
  "Trusted Member badge"
] as const;
