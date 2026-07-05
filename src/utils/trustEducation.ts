import { TRUST_EDUCATION_TOPICS } from "../constants/communityTrust";
import { computeTrustScore } from "./trustScore";
import type { DatingProfile } from "../types";

export type TrustEducationView = {
  topics: typeof TRUST_EDUCATION_TOPICS;
  memberTrustBand: "building" | "good" | "strong" | "review";
  memberTrustLabel: string;
  verified: boolean;
};

function trustBand(score: number): TrustEducationView["memberTrustBand"] {
  if (score >= 75) return "strong";
  if (score >= 55) return "good";
  if (score >= 35) return "building";
  return "review";
}

function trustBandLabel(band: TrustEducationView["memberTrustBand"]): string {
  switch (band) {
    case "strong":
      return "Strong standing — you appear reliably in recommendations.";
    case "good":
      return "Good standing — complete your profile to strengthen trust.";
    case "building":
      return "Building trust — verification and a complete profile help.";
    default:
      return "Under review — keep your profile respectful and active.";
  }
}

export function getTrustEducationView(profile: DatingProfile): TrustEducationView {
  const score = computeTrustScore(profile);
  const band = trustBand(score);
  return {
    topics: TRUST_EDUCATION_TOPICS,
    memberTrustBand: band,
    memberTrustLabel: trustBandLabel(band),
    verified: Boolean(profile.verified),
  };
}
