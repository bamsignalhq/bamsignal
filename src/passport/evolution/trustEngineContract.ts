/**
 * Future Trust Engine contract — inputs the engine may consume.
 * Interfaces only. No algorithms. No calculations in this sprint.
 *
 * Extended Platform Phase 1 — validated signals, provenance, evolution layers.
 *
 * @see docs/architecture/TRUST_EVOLUTION_MODEL.md
 * @see docs/architecture/TRUST_SIGNAL_STANDARD.md
 */

import type { TrustSignalRecord } from "../governance/trustSignals";
import type { AuditTimelineEntry } from "../types";
import type { ReputationSnapshot } from "../reputation/types";
import type { TrustProgressionEventRecord } from "./progression";
import type { ConsentGrantRecord } from "../governance/consent";
import type { DisputeRecord } from "../governance/disputes";
import type { ValidatedTrustSignal } from "../signals/types";
import type { SignalContributorDefinition } from "../signals/contributors";
import type { SignalProvenanceRecord } from "../signals/provenance";
import type { PassportTrustTimeline } from "./timeline";
import type { PassportJourneySnapshot } from "./journey";
import type { LegacySnapshot } from "../legacy/model";

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
  /** Foundation v1.0 signal records — backward compatible. */
  signals: TrustSignalRecord[];
  /** Platform Phase 1 — validated signals from ingestion pipeline. */
  validatedSignals: ValidatedTrustSignal[];
  /** Contributor metadata for provenance and authorization context. */
  contributorMetadata: Pick<
    SignalContributorDefinition,
    "contributorId" | "displayName" | "trustDomain" | "verificationLevel" | "status"
  >[];
  /** Signal provenance records — who, when, why, under what consent. */
  provenanceRecords: SignalProvenanceRecord[];
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
  /** Trust Timeline — curated positive milestones. */
  timeline: PassportTrustTimeline | null;
  /** Passport Journey — user narrative architecture. */
  journey: PassportJourneySnapshot | null;
  /** Legacy snapshot — emerges over decades, never calculated in engine. */
  legacy: LegacySnapshot | null;
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
  "validated_signals",
  "contributor_metadata",
  "signal_provenance",
  "verification_events",
  "audit_references",
  "reputation_dimensions",
  "product_participation",
  "dispute_outcomes",
  "consent_state",
  "human_reviews",
  "trust_timeline",
  "passport_journey",
  "legacy_snapshot"
] as const;

export type TrustEngineInputCategory = (typeof TRUST_ENGINE_INPUT_CATEGORIES)[number];
