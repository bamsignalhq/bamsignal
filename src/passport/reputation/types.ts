/**
 * Reputation — behaviour layer (distinct from Trust).
 * Reputation represents how a person has behaved; Trust represents derived confidence.
 */

export type ReputationBehaviorDimension =
  | "community"
  | "marketplace"
  | "financial"
  | "professional"
  | "education"
  | "product";

export type ReputationBehaviorSummary = {
  dimension: ReputationBehaviorDimension;
  label: string;
  /** Behaviour indicators — not calculated in this sprint. */
  score: number | null;
  contributorIds: string[];
  updatedAt: string | null;
};

export type ReputationSnapshot = {
  passportId: string;
  dimensions: Partial<Record<ReputationBehaviorDimension, ReputationBehaviorSummary>>;
  updatedAt: string | null;
};

/** @deprecated Use ReputationBehaviorDimension — kept for backward compatibility. */
export type LegacyReputationDimension =
  | "trust"
  | "verification"
  | "safety"
  | "community"
  | "marketplace"
  | "financial"
  | "cross_product";

/** @deprecated Use ReputationSnapshot — kept for backward compatibility. */
export type LegacyReputationSnapshot = {
  passportId: string;
  dimensions: Partial<Record<LegacyReputationDimension, { score: number | null; label: string }>>;
  updatedAt: string | null;
};
