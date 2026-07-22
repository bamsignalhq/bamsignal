/**
 * Legacy Contribution dimensions — what a person has contributed over time.
 * These are NOT trust dimensions. They describe enduring contribution areas.
 *
 * @see docs/architecture/LEGACY_ARCHITECTURE.md
 */

export type LegacyContributionDimensionId =
  | "community"
  | "business"
  | "marketplace"
  | "education"
  | "employment"
  | "innovation"
  | "public_service"
  | "family"
  | "leadership"
  | "mentorship"
  | "volunteerism";

export type LegacyContributionDimension = {
  id: LegacyContributionDimensionId;
  label: string;
  description: string;
};

export const LEGACY_CONTRIBUTION_REGISTRY: Record<
  LegacyContributionDimensionId,
  LegacyContributionDimension
> = {
  community: {
    id: "community",
    label: "Community",
    description: "Sustained positive community participation and building"
  },
  business: {
    id: "business",
    label: "Business",
    description: "Responsible business creation and stewardship"
  },
  marketplace: {
    id: "marketplace",
    label: "Marketplace",
    description: "Marketplace participation and merchant integrity over time"
  },
  education: {
    id: "education",
    label: "Education",
    description: "Educational contribution and credential stewardship"
  },
  employment: {
    id: "employment",
    label: "Employment",
    description: "Professional employment history and employer trust"
  },
  innovation: {
    id: "innovation",
    label: "Innovation",
    description: "Innovation and ecosystem advancement"
  },
  public_service: {
    id: "public_service",
    label: "Public Service",
    description: "Public service and civic contribution"
  },
  family: {
    id: "family",
    label: "Family",
    description: "Family verification and intergenerational stewardship"
  },
  leadership: {
    id: "leadership",
    label: "Leadership",
    description: "Leadership within communities, organizations, or products"
  },
  mentorship: {
    id: "mentorship",
    label: "Mentorship",
    description: "Mentorship and guidance to others in the ecosystem"
  },
  volunteerism: {
    id: "volunteerism",
    label: "Volunteerism",
    description: "Volunteer contribution without commercial incentive"
  }
} as const;

/** Indexed contribution summary — references only, not raw product data. */
export type LegacyContributionRecord = {
  contributionId: string;
  passportId: string;
  dimension: LegacyContributionDimensionId;
  headline: string;
  summary: string;
  originProduct: string;
  startedAt: string | null;
  evidenceRef: string | null;
};

export function getLegacyContributionDimension(
  id: LegacyContributionDimensionId
): LegacyContributionDimension {
  return LEGACY_CONTRIBUTION_REGISTRY[id];
}

export function listLegacyContributionDimensions(): LegacyContributionDimension[] {
  return Object.values(LEGACY_CONTRIBUTION_REGISTRY);
}
