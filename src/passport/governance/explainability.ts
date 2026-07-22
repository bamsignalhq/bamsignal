/**
 * Trust Explanation Model — explainability by design (Principle 3).
 * Future APIs answer: why is trust at this level? which signals contributed?
 *
 * No scoring algorithms. Prepared interfaces only.
 *
 * @see docs/architecture/DIGITAL_TRUST_CONSTITUTION.md
 */

import type { TrustDimension, TrustConfidenceLevel } from "../trust/types";
import type { TrustSignalRecord } from "./trustSignals";

export type TrustExplanationFactor = {
  signalId: string;
  contributorId: string;
  signalType: string;
  description: string;
  /** Human-readable contribution note — not a numeric weight in this sprint. */
  influence: "primary" | "supporting" | "expired" | "pending_review" | "disputed";
  occurredAt: string;
  evidenceRef: string | null;
};

export type TrustDimensionExplanation = {
  dimension: TrustDimension;
  confidence: TrustConfidenceLevel;
  headline: string;
  /** Principle 3 — always answerable. */
  summary: string;
  contributingProducts: string[];
  factors: TrustExplanationFactor[];
  expiredFactors: TrustExplanationFactor[];
  pendingReviewFactors: TrustExplanationFactor[];
  disputedFactors: TrustExplanationFactor[];
  generatedAt: string;
};

export type PassportTrustExplanation = {
  passportId: string;
  dimensions: Partial<Record<TrustDimension, TrustDimensionExplanation>>;
  /** Principle 9 — explanations assist humans; they do not replace judgment. */
  humanOversightNotice: string;
  generatedAt: string;
};

/** Future explainability API — not implemented. */
export interface TrustExplanationClient {
  explainDimension(
    passportId: string,
    dimension: TrustDimension
  ): Promise<TrustDimensionExplanation | null>;

  explainAll(passportId: string): Promise<PassportTrustExplanation | null>;
}

/** Stub builder — returns constitutional placeholder until signal engine ships. */
export function buildPlaceholderTrustExplanation(
  _passportId: string,
  dimension: TrustDimension
): TrustDimensionExplanation {
  return {
    dimension,
    confidence: "pending",
    headline: "Trust explanation pending",
    summary:
      "No trust signals have been processed yet. When signals arrive, this view will show " +
      "which products contributed and why — never an opaque score.",
    contributingProducts: [],
    factors: [],
    expiredFactors: [],
    pendingReviewFactors: [],
    disputedFactors: [],
    generatedAt: new Date().toISOString()
  };
}

/** Type guard for future signal-to-factor mapping. */
export function signalToExplanationFactor(signal: TrustSignalRecord): TrustExplanationFactor {
  let influence: TrustExplanationFactor["influence"] = "supporting";
  if (signal.verificationStatus === "disputed") influence = "disputed";
  else if (signal.reviewStatus === "pending" || signal.reviewStatus === "under_review") {
    influence = "pending_review";
  } else if (signal.expiresAt && new Date(signal.expiresAt) < new Date()) {
    influence = "expired";
  }

  return {
    signalId: signal.signalId,
    contributorId: signal.contributorId,
    signalType: signal.signalType,
    description: signal.description,
    influence,
    occurredAt: signal.occurredAt,
    evidenceRef: signal.evidenceRef
  };
}
