/**
 * Trust Achievements — positive milestone badges.
 * Achievements communicate milestones; they do not directly affect trust calculations.
 *
 * @see docs/architecture/TRUST_EVOLUTION_MODEL.md
 */

export type PassportAchievementId =
  | "verified_identity"
  | "early_member"
  | "founding_member"
  | "trusted_marketplace_seller"
  | "financial_integrity"
  | "community_builder"
  | "five_years_active"
  | "ten_years_active"
  | "legacy_member";

export type PassportAchievementDefinition = {
  id: PassportAchievementId;
  label: string;
  description: string;
  /** Achievements are narrative — never numeric trust weights. */
  affectsTrustDirectly: false;
};

export const PASSPORT_ACHIEVEMENT_REGISTRY: Record<
  PassportAchievementId,
  PassportAchievementDefinition
> = {
  verified_identity: {
    id: "verified_identity",
    label: "Verified Identity",
    description: "Completed core identity verification",
    affectsTrustDirectly: false
  },
  early_member: {
    id: "early_member",
    label: "Early Member",
    description: "Joined during early Stankings ecosystem participation",
    affectsTrustDirectly: false
  },
  founding_member: {
    id: "founding_member",
    label: "Founding Member",
    description: "Among the first participants in a Stankings product",
    affectsTrustDirectly: false
  },
  trusted_marketplace_seller: {
    id: "trusted_marketplace_seller",
    label: "Trusted Marketplace Seller",
    description: "Sustained positive marketplace participation",
    affectsTrustDirectly: false
  },
  financial_integrity: {
    id: "financial_integrity",
    label: "Financial Integrity",
    description: "Demonstrated responsible financial participation",
    affectsTrustDirectly: false
  },
  community_builder: {
    id: "community_builder",
    label: "Community Builder",
    description: "Positive community contribution across social products",
    affectsTrustDirectly: false
  },
  five_years_active: {
    id: "five_years_active",
    label: "Five Years Active",
    description: "Five years of ecosystem participation",
    affectsTrustDirectly: false
  },
  ten_years_active: {
    id: "ten_years_active",
    label: "Ten Years Active",
    description: "Ten years of ecosystem participation",
    affectsTrustDirectly: false
  },
  legacy_member: {
    id: "legacy_member",
    label: "Legacy Member",
    description: "Long-term Stankings Legacy participation — SKL philosophy embodied",
    affectsTrustDirectly: false
  }
} as const;

export type PassportAchievementRecord = {
  achievementId: PassportAchievementId;
  passportId: string;
  earnedAt: string;
  originProduct: string;
  headline: string;
};

export function getAchievementDefinition(id: PassportAchievementId): PassportAchievementDefinition {
  return PASSPORT_ACHIEVEMENT_REGISTRY[id];
}

export function listAchievementDefinitions(): PassportAchievementDefinition[] {
  return Object.values(PASSPORT_ACHIEVEMENT_REGISTRY);
}
