import { listTrustContributors } from "../trust/contributors/registry";
import { getPassportId } from "../session";
import type {
  ReputationBehaviorDimension,
  ReputationBehaviorSummary,
  ReputationSnapshot,
  LegacyReputationDimension,
  LegacyReputationSnapshot
} from "./types";

const REPUTATION_LABELS: Record<ReputationBehaviorDimension, string> = {
  community: "Community Reputation",
  marketplace: "Marketplace Reputation",
  financial: "Financial Reputation",
  professional: "Professional Reputation",
  education: "Education Reputation",
  product: "Product Reputation"
};

export const REPUTATION_BEHAVIOR_DIMENSIONS: readonly ReputationBehaviorDimension[] = [
  "community",
  "marketplace",
  "financial",
  "professional",
  "education",
  "product"
] as const;

function contributorsForReputation(dimension: ReputationBehaviorDimension): string[] {
  return listTrustContributors()
    .filter((c) => c.reputationTypes.includes(dimension))
    .map((c) => c.id);
}

function buildBehaviorSummary(dimension: ReputationBehaviorDimension): ReputationBehaviorSummary {
  return {
    dimension,
    label: REPUTATION_LABELS[dimension],
    score: null,
    contributorIds: contributorsForReputation(dimension),
    updatedAt: null
  };
}

/**
 * Behaviour reputation snapshot — extension points only, no scoring.
 */
export function getReputationSnapshot(): ReputationSnapshot {
  const passportId = getPassportId() ?? "unknown";
  const dimensions = Object.fromEntries(
    REPUTATION_BEHAVIOR_DIMENSIONS.map((d) => [d, buildBehaviorSummary(d)])
  ) as ReputationSnapshot["dimensions"];

  return {
    passportId,
    dimensions,
    updatedAt: null
  };
}

export function listReputationDimensions(): ReputationBehaviorDimension[] {
  return [...REPUTATION_BEHAVIOR_DIMENSIONS];
}

/** Backward-compatible legacy snapshot for callers expecting old dimension keys. */
export function getLegacyReputationSnapshot(): LegacyReputationSnapshot {
  const passportId = getPassportId() ?? "unknown";
  const legacyLabels: Record<LegacyReputationDimension, string> = {
    trust: "Trust Score",
    verification: "Verification Score",
    safety: "Safety Score",
    community: "Community Reputation",
    marketplace: "Marketplace Reputation",
    financial: "Financial Reputation",
    cross_product: "Cross-product Reputation"
  };
  const dimensions = Object.fromEntries(
    (Object.keys(legacyLabels) as LegacyReputationDimension[]).map((key) => [
      key,
      { score: null, label: legacyLabels[key] }
    ])
  ) as LegacyReputationSnapshot["dimensions"];

  return { passportId, dimensions, updatedAt: null };
}
