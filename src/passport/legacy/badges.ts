/**
 * Legacy Badges — recognition of sustained contribution, NOT achievements or trust.
 *
 * @see docs/architecture/LEGACY_ARCHITECTURE.md
 */

export type LegacyBadgeId =
  | "founder"
  | "pioneer"
  | "mentor"
  | "builder"
  | "visionary"
  | "community_pillar"
  | "trusted_merchant"
  | "trusted_employer"
  | "trusted_institution"
  | "national_contributor";

export type LegacyBadgeDefinition = {
  id: LegacyBadgeId;
  label: string;
  description: string;
  /** Legacy badges are recognition — not trust scores. */
  isTrustScore: false;
};

export const LEGACY_BADGE_REGISTRY: Record<LegacyBadgeId, LegacyBadgeDefinition> = {
  founder: {
    id: "founder",
    label: "Founder",
    description: "Founded a lasting business or organization within the ecosystem",
    isTrustScore: false
  },
  pioneer: {
    id: "pioneer",
    label: "Pioneer",
    description: "Among the earliest trusted participants in a Stankings product or domain",
    isTrustScore: false
  },
  mentor: {
    id: "mentor",
    label: "Mentor",
    description: "Recognized mentorship and guidance over many years",
    isTrustScore: false
  },
  builder: {
    id: "builder",
    label: "Builder",
    description: "Built enduring community, marketplace, or institutional contribution",
    isTrustScore: false
  },
  visionary: {
    id: "visionary",
    label: "Visionary",
    description: "Recognized innovation that advanced the Stankings trust ecosystem",
    isTrustScore: false
  },
  community_pillar: {
    id: "community_pillar",
    label: "Community Pillar",
    description: "Decades of positive community stewardship",
    isTrustScore: false
  },
  trusted_merchant: {
    id: "trusted_merchant",
    label: "Trusted Merchant",
    description: "Sustained marketplace integrity over many years",
    isTrustScore: false
  },
  trusted_employer: {
    id: "trusted_employer",
    label: "Trusted Employer",
    description: "Recognized employment stewardship and workforce trust",
    isTrustScore: false
  },
  trusted_institution: {
    id: "trusted_institution",
    label: "Trusted Institution",
    description: "Institutional contribution verified over long horizons",
    isTrustScore: false
  },
  national_contributor: {
    id: "national_contributor",
    label: "National Contributor",
    description: "Recognized contribution at national ecosystem scale",
    isTrustScore: false
  }
} as const;

export type LegacyBadgeRecord = {
  badgeId: LegacyBadgeId;
  passportId: string;
  recognizedAt: string;
  originProduct: string;
  headline: string;
  /** Human review required for legacy recognition. */
  humanReviewRef: string | null;
};

export function getLegacyBadgeDefinition(id: LegacyBadgeId): LegacyBadgeDefinition {
  return LEGACY_BADGE_REGISTRY[id];
}

export function listLegacyBadgeDefinitions(): LegacyBadgeDefinition[] {
  return Object.values(LEGACY_BADGE_REGISTRY);
}
