/**
 * Future Trust Engine contract — inputs the engine may consume.
 * Interfaces only. No algorithms. No calculations in this sprint.
 *
 * @see docs/architecture/TRUST_EVOLUTION_MODEL.md
 */

import type { TrustSignalRecord } from "../governance/trustSignals";
import type { AuditTimelineEntry } from "../types";
import type { ReputationSnapshot } from "../reputation/types";
import type { TrustProgressionEventRecord } from "./progression";
import type { ConsentGrantRecord } from "../governance/consent";
import type { DisputeRecord } from "../governance/disputes";

/** Human review reference — Trust Engine must not override without this. */
export type TrustEngineHumanReviewRef = {
  reviewId: string;
  reviewerRole: string;
  occurredAt: string;
  summary: string;
};

/**
 * Inputs a future Trust Engine may consume to derive trust summaries.
 * Never expose weighting, scoring formulas, or ML models in client code.
 */
export type TrustEngineInputBundle = {
  passportId: string;
  /** Registered trust signals — metadata only, evidence in products. */
  signals: TrustSignalRecord[];
  /** Verification and security progression events. */
  progressionEvents: TrustProgressionEventRecord[];
  /** Audit references — not raw product payloads. */
  auditReferences: Pick<AuditTimelineEntry, "id" | "category" | "action" | "at">[];
  /** Behaviour reputation dimensions — distinct from derived trust. */
  reputation: ReputationSnapshot | null;
  /** Product participation markers. */
  activeProducts: string[];
  /** Resolved dispute outcomes — human review required. */
  disputeOutcomes: DisputeRecord[];
  /** Active consent state for external context. */
  consentState: ConsentGrantRecord[];
  /** Mandatory human reviews for high-impact derivations. */
  humanReviews: TrustEngineHumanReviewRef[];
  assembledAt: string;
};

/** Future Trust Engine — derived trust only; never autonomous judgment. */
export interface TrustEngineClient {
  /** Derive updated trust summaries — server-side future implementation. */
  deriveTrustSummary(input: TrustEngineInputBundle): Promise<{ derived: true; passportId: string }>;
}

/** Documented input categories — for architecture reviews and contributor onboarding. */
export const TRUST_ENGINE_INPUT_CATEGORIES = [
  "trust_signals",
  "verification_events",
  "audit_references",
  "reputation_dimensions",
  "product_participation",
  "dispute_outcomes",
  "consent_state",
  "human_reviews"
] as const;

export type TrustEngineInputCategory = (typeof TRUST_ENGINE_INPUT_CATEGORIES)[number];
