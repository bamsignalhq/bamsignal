import type { TrustDimension, TrustDimensionSummary, TrustSnapshot } from "./types";
import { listContributorsForTrustDimension } from "./contributors/registry";
import { getPassportId } from "../session";
import { getTrustDimensionMaturity } from "../governance/maturity";

const TRUST_LABELS: Record<TrustDimension, string> = {
  identity_trust: "Identity Trust",
  social_trust: "Social Trust",
  financial_trust: "Financial Trust",
  marketplace_trust: "Marketplace Trust",
  ecosystem_trust: "Ecosystem Trust"
};

export const TRUST_DIMENSIONS: readonly TrustDimension[] = [
  "identity_trust",
  "social_trust",
  "financial_trust",
  "marketplace_trust",
  "ecosystem_trust"
] as const;

function buildDimensionSummary(dimension: TrustDimension): TrustDimensionSummary {
  const contributors = listContributorsForTrustDimension(dimension);
  return {
    dimension,
    label: TRUST_LABELS[dimension],
    confidence: "pending",
    score: null,
    maturity: getTrustDimensionMaturity(dimension),
    contributorIds: contributors.map((c) => c.id),
    updatedAt: null
  };
}

/**
 * Trust snapshot — derived confidence interfaces only.
 * Trust is NEVER manually assigned and NOT calculated in this sprint.
 */
export function getTrustSnapshot(): TrustSnapshot {
  const passportId = getPassportId() ?? "unknown";
  const dimensions = Object.fromEntries(
    TRUST_DIMENSIONS.map((d) => [d, buildDimensionSummary(d)])
  ) as TrustSnapshot["dimensions"];

  return {
    passportId,
    dimensions,
    derived: true,
    updatedAt: null
  };
}

export function listTrustDimensions(): TrustDimension[] {
  return [...TRUST_DIMENSIONS];
}

export function getTrustDimensionSummary(dimension: TrustDimension): TrustDimensionSummary {
  return buildDimensionSummary(dimension);
}
