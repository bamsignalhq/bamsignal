/**
 * Trust Signal Governance — metadata contract for future signals.
 * No scoring. No weighting. No algorithms. Interfaces only.
 *
 * @see docs/architecture/DIGITAL_TRUST_CONSTITUTION.md
 */

import type { PassportProductId } from "../types";
import type { TrustDimension } from "../trust/types";

export type TrustSignalCategory =
  | "verification"
  | "behaviour"
  | "security"
  | "financial"
  | "marketplace"
  | "social"
  | "professional"
  | "education"
  | "health"
  | "business"
  | "ecosystem";

export type TrustSignalVerificationStatus =
  | "unverified"
  | "pending_review"
  | "verified"
  | "disputed"
  | "expired";

export type TrustSignalReviewStatus = "none" | "pending" | "under_review" | "upheld" | "corrected" | "removed";

/**
 * Future trust signal record — products emit; Passport indexes references.
 * Raw evidence remains in the originating product.
 */
export type TrustSignalRecord = {
  signalId: string;
  passportId: string;
  /** Principle 2 — origin product, never Passport-owned truth. */
  originProduct: PassportProductId;
  contributorId: string;
  dimension: TrustDimension;
  category: TrustSignalCategory;
  /** Human-readable signal type, e.g. "email_verified", "successful_match". */
  signalType: string;
  occurredAt: string;
  receivedAt: string;
  verificationStatus: TrustSignalVerificationStatus;
  /** Signal-level confidence metadata — not a person score. */
  confidence: "pending" | "low" | "medium" | "high";
  /** Opaque reference to evidence in originating product — not the evidence itself. */
  evidenceRef: string | null;
  expiryPolicy: TrustSignalExpiryPolicy | null;
  expiresAt: string | null;
  reviewStatus: TrustSignalReviewStatus;
  /** Explainability hook — why this signal exists. */
  description: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type TrustSignalExpiryPolicy = {
  kind: "fixed_date" | "rolling_days" | "until_disputed" | "permanent";
  days?: number;
  label: string;
};

/** Registration descriptor — contributor declares signal types before collection. */
export type TrustSignalTypeRegistration = {
  signalType: string;
  label: string;
  dimension: TrustDimension;
  category: TrustSignalCategory;
  contributorId: string;
  defaultExpiryPolicy: TrustSignalExpiryPolicy | null;
  /** Principle 3 — every signal type must be explainable to users. */
  userFacingExplanation: string;
};

/** Future ingestion contract — not implemented. */
export interface TrustSignalIngestionClient {
  registerSignalType(registration: TrustSignalTypeRegistration): Promise<{ ok: boolean }>;
  submitSignal(signal: Omit<TrustSignalRecord, "signalId" | "receivedAt">): Promise<{ signalId: string } | null>;
}
