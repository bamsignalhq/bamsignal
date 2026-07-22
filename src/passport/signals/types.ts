/**
 * Canonical Trust Signal interfaces — Platform Implementation Phase 1.
 * Typed contracts only. No scoring. No trust calculation.
 *
 * @see docs/architecture/TRUST_SIGNAL_STANDARD.md
 */

import type { TrustSignalEvidenceCategory } from "./categories";

/** Signal lifecycle status — not trust confidence. */
export type TrustSignalStatus =
  | "pending"
  | "accepted"
  | "under_review"
  | "revoked"
  | "expired"
  | "rejected";

/** Whether human review is required before signal influences downstream systems. */
export type TrustSignalHumanReviewRequirement =
  | "none"
  | "recommended"
  | "required"
  | "completed";

/** Signal-level confidence metadata — describes evidence quality, not person score. */
export type TrustSignalConfidenceMetadata = {
  level: "pending" | "low" | "medium" | "high";
  basis: string;
  assessedAt: string | null;
  assessor: "contributor" | "passport" | "human_reviewer" | null;
};

/** Opaque evidence reference — raw payloads remain in originating product. */
export type TrustSignalEvidenceMetadata = {
  evidenceRef: string | null;
  evidenceType: string | null;
  checksum: string | null;
  storageProduct: string;
  retrievable: boolean;
};

/** Revocation record — signals may be withdrawn with audit trail. */
export type TrustSignalRevocation = {
  revokedAt: string;
  revokedBy: string;
  reason: string;
  auditRef: string;
} | null;

/** Expiration policy — signals may expire independently of trust summaries. */
export type TrustSignalExpiration = {
  expiresAt: string | null;
  policy: "fixed_date" | "rolling_days" | "until_disputed" | "permanent";
  rollingDays: number | null;
  label: string;
};

/**
 * Canonical Trust Signal — evidence emitted by contributors.
 * Signals never calculate reputation. Signals are NOT trust.
 */
export type TrustSignal = {
  signalId: string;
  passportId: string;
  /** Contributor that emitted this signal. */
  contributorId: string;
  category: TrustSignalEvidenceCategory;
  signalType: string;
  occurredAt: string;
  recordedAt: string;
  consentRef: string | null;
  auditRef: string;
  confidence: TrustSignalConfidenceMetadata;
  evidence: TrustSignalEvidenceMetadata;
  sourceProduct: string;
  version: string;
  humanReviewRequirement: TrustSignalHumanReviewRequirement;
  status: TrustSignalStatus;
  explanation: string;
  expiration: TrustSignalExpiration;
  revocation: TrustSignalRevocation;
};

/** Signal type registration — contributors declare types before emission. */
export type TrustSignalTypeDescriptor = {
  signalType: string;
  label: string;
  category: TrustSignalEvidenceCategory;
  contributorId: string;
  defaultHumanReview: TrustSignalHumanReviewRequirement;
  defaultExpiration: TrustSignalExpiration;
  userFacingExplanation: string;
  documentationUrl: string | null;
};

/** Submission payload — contributor emits; Passport ingests via pipeline. */
export type TrustSignalSubmission = Omit<TrustSignal, "signalId" | "recordedAt" | "status"> & {
  status?: TrustSignalStatus;
};

/** Validated signal — passed ingestion pipeline; ready for future Trust Engine. */
export type ValidatedTrustSignal = TrustSignal & {
  status: "accepted" | "under_review";
  validationRef: string;
  provenanceRef: string;
  idempotencyKey: string;
};
