/**
 * Signal validation contracts — ingestion gate interfaces.
 * No implementation. No scoring.
 *
 * @see docs/architecture/SIGNAL_INGESTION.md
 */

import type { TrustSignalSubmission } from "./types";
import type { SignalIdempotencyMetadata } from "./idempotency";

export type SignalValidationKind =
  | "schema"
  | "signature"
  | "contributor"
  | "consent"
  | "evidence"
  | "reference"
  | "expiration"
  | "version";

export type SignalValidationResult = {
  kind: SignalValidationKind;
  passed: boolean;
  message: string;
  checkedAt: string;
};

export type SignalValidationReport = {
  signalType: string;
  contributorId: string;
  passportId: string;
  passed: boolean;
  results: SignalValidationResult[];
  validatedAt: string;
};

/** Schema validation — signal matches registered type descriptor. */
export interface SignalSchemaValidator {
  validateSchema(submission: TrustSignalSubmission): Promise<SignalValidationResult>;
}

/** Signature validation — contributor authenticity (future). */
export interface SignalSignatureValidator {
  validateSignature(
    submission: TrustSignalSubmission,
    signature: string | null
  ): Promise<SignalValidationResult>;
}

/** Contributor validation — emitter is registered and authorized. */
export interface SignalContributorValidator {
  validateContributor(contributorId: string, signalType: string): Promise<SignalValidationResult>;
}

/** Consent validation — active consent covers this signal type. */
export interface SignalConsentValidator {
  validateConsent(submission: TrustSignalSubmission): Promise<SignalValidationResult>;
}

/** Evidence validation — evidence reference is well-formed. */
export interface SignalEvidenceValidator {
  validateEvidence(submission: TrustSignalSubmission): Promise<SignalValidationResult>;
}

/** Reference validation — audit and consent refs exist. */
export interface SignalReferenceValidator {
  validateReferences(submission: TrustSignalSubmission): Promise<SignalValidationResult>;
}

/** Expiration validation — expiration policy is coherent. */
export interface SignalExpirationValidator {
  validateExpiration(submission: TrustSignalSubmission): Promise<SignalValidationResult>;
}

/** Version validation — signal version matches contributor contract. */
export interface SignalVersionValidator {
  validateVersion(submission: TrustSignalSubmission): Promise<SignalValidationResult>;
}

/** Composite validation pipeline contract. */
export interface SignalValidationPipeline {
  validate(
    submission: TrustSignalSubmission,
    idempotency: SignalIdempotencyMetadata
  ): Promise<SignalValidationReport>;
}
