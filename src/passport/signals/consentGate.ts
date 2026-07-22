/**
 * Consent gate — no signal accepted without valid consent.
 * Interfaces only. Extends Foundation consent contracts.
 *
 * @see docs/architecture/SIGNAL_INGESTION.md
 */

import type { TrustSignalSubmission } from "./types";

export type SignalConsentGateFailureReason =
  | "consent_missing"
  | "consent_inactive"
  | "consent_not_applicable"
  | "consent_revoked"
  | "scope_insufficient"
  | "human_override_required";

export type SignalConsentGateResult = {
  allowed: boolean;
  consentRef: string | null;
  failureReason: SignalConsentGateFailureReason | null;
  checkedAt: string;
  /** Human override must be documented when consent is bypassed. */
  humanOverrideRef: string | null;
};

/** Consent gate requirements — every signal must pass before ingestion continues. */
export const SIGNAL_CONSENT_GATE_REQUIREMENTS = [
  "Consent exists for the signal category and contributor",
  "Consent is active (not expired or revoked)",
  "Consent scope covers the signal type",
  "Consent has not been revoked since signal occurredAt",
  "Human override is documented when consent is bypassed"
] as const;

/** Future consent gate — integrates with governance/consent.ts records. */
export interface SignalConsentGate {
  checkConsent(submission: TrustSignalSubmission): Promise<SignalConsentGateResult>;
}

/** Documented human override — Principle 9 human oversight. */
export type SignalConsentHumanOverride = {
  overrideId: string;
  signalType: string;
  passportId: string;
  reviewerRef: string;
  reason: string;
  documentedAt: string;
  auditRef: string;
};
