/**
 * Signal provenance — every signal must answer who, when, why, and under what authority.
 *
 * @see docs/architecture/TRUST_SIGNAL_STANDARD.md
 */

import type { TrustSignal } from "./types";

/** Provenance questions every signal must eventually answer. */
export type SignalProvenanceQuestions = {
  whoEmitted: string;
  whenOccurred: string;
  whenRecorded: string;
  whyEmitted: string;
  consentBasis: string | null;
  verifiable: boolean;
  revoked: boolean;
  authoritative: boolean;
};

export type SignalProvenanceRecord = {
  provenanceId: string;
  signalId: string;
  passportId: string;
  contributorId: string;
  sourceProduct: string;
  emittedAt: string;
  recordedAt: string;
  consentRef: string | null;
  auditRef: string;
  explanation: string;
  /** Whether evidence can be independently verified in originating product. */
  evidenceVerifiable: boolean;
  /** Whether contributor is authoritative for this signal type. */
  contributorAuthoritative: boolean;
  revoked: boolean;
  revocationRef: string | null;
  questions: SignalProvenanceQuestions;
};

export function buildProvenanceQuestions(signal: TrustSignal): SignalProvenanceQuestions {
  return {
    whoEmitted: signal.contributorId,
    whenOccurred: signal.occurredAt,
    whenRecorded: signal.recordedAt,
    whyEmitted: signal.explanation,
    consentBasis: signal.consentRef,
    verifiable: signal.evidence.evidenceRef !== null && signal.evidence.retrievable,
    revoked: signal.revocation !== null,
    authoritative: signal.status === "accepted" && signal.revocation === null
  };
}

/** Future provenance store — not implemented. */
export interface SignalProvenanceClient {
  recordProvenance(signal: TrustSignal): Promise<SignalProvenanceRecord>;
  getProvenance(signalId: string): Promise<SignalProvenanceRecord | null>;
  verifyProvenance(signalId: string): Promise<{ verifiable: boolean; authoritative: boolean }>;
}
