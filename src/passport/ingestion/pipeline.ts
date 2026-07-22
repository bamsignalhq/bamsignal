/**
 * Signal ingestion pipeline contracts — interfaces only.
 * No database. No queues. No API routes.
 *
 * @see docs/architecture/SIGNAL_INGESTION.md
 */

import type { SignalIdempotencyMetadata } from "../signals/idempotency";
import type { TrustSignalSubmission, ValidatedTrustSignal } from "../signals/types";
import type { SignalValidationReport } from "../signals/validation";
import type { SignalConsentGateResult } from "../signals/consentGate";
import type { SignalProvenanceRecord } from "../signals/provenance";
import type { PassportSignalEvent } from "../signals/events";

/** Ingestion pipeline stages — sequential, auditable, idempotent. */
export type SignalIngestionStage =
  | "receive"
  | "validate"
  | "consent_check"
  | "normalize"
  | "audit_reference"
  | "deduplicate"
  | "persist"
  | "publish_event"
  | "future_trust_engine";

export type SignalIngestionStageDefinition = {
  stage: SignalIngestionStage;
  order: number;
  label: string;
  description: string;
};

export const SIGNAL_INGESTION_PIPELINE: readonly SignalIngestionStageDefinition[] = [
  {
    stage: "receive",
    order: 1,
    label: "Receive",
    description: "Accept signal submission from authenticated contributor"
  },
  {
    stage: "validate",
    order: 2,
    label: "Validate",
    description: "Schema, signature, contributor, evidence, reference, expiration, version"
  },
  {
    stage: "consent_check",
    order: 3,
    label: "Consent Check",
    description: "Verify active consent covers signal type — no signal without consent"
  },
  {
    stage: "normalize",
    order: 4,
    label: "Normalize",
    description: "Map to canonical TrustSignal contract — never store raw payloads"
  },
  {
    stage: "audit_reference",
    order: 5,
    label: "Audit Reference",
    description: "Append audit timeline reference — complete history preserved"
  },
  {
    stage: "deduplicate",
    order: 6,
    label: "Deduplicate",
    description: "Idempotency key and replay detection — exactly-once semantics"
  },
  {
    stage: "persist",
    order: 7,
    label: "Persist",
    description: "Store normalized signal reference — evidence remains in product"
  },
  {
    stage: "publish_event",
    order: 8,
    label: "Publish Event",
    description: "Emit signal_created or related event for downstream consumers"
  },
  {
    stage: "future_trust_engine",
    order: 9,
    label: "Future Trust Engine",
    description: "Validated signals available for trust derivation — not in this phase"
  }
] as const;

export type SignalIngestionContext = {
  submission: TrustSignalSubmission;
  idempotency: SignalIdempotencyMetadata;
  receivedAt: string;
  correlationId: string;
};

export type SignalIngestionResult =
  | {
      ok: true;
      signal: ValidatedTrustSignal;
      validation: SignalValidationReport;
      consent: SignalConsentGateResult;
      provenance: SignalProvenanceRecord;
      event: PassportSignalEvent | null;
      stagesCompleted: SignalIngestionStage[];
    }
  | {
      ok: false;
      failedStage: SignalIngestionStage;
      reason: string;
      stagesCompleted: SignalIngestionStage[];
    };

/** Normalized signal — output of normalize stage. */
export type NormalizedTrustSignal = TrustSignalSubmission & {
  auditRef: string;
  recordedAt: string;
};

/** Future ingestion service — orchestrates pipeline stages. */
export interface SignalIngestionClient {
  ingest(context: SignalIngestionContext): Promise<SignalIngestionResult>;
}

/** Stage handlers — composable pipeline contract. */
export interface SignalIngestionPipeline {
  receive(context: SignalIngestionContext): Promise<{ accepted: boolean }>;
  validate(context: SignalIngestionContext): Promise<SignalValidationReport>;
  checkConsent(context: SignalIngestionContext): Promise<SignalConsentGateResult>;
  normalize(
    context: SignalIngestionContext,
    auditRef: string
  ): Promise<NormalizedTrustSignal>;
  deduplicate(context: SignalIngestionContext): Promise<{ isDuplicate: boolean; existingId: string | null }>;
  persist(signal: ValidatedTrustSignal): Promise<{ signalId: string }>;
  publishEvent(event: PassportSignalEvent): Promise<{ published: boolean }>;
}

export function listIngestionStages(): SignalIngestionStageDefinition[] {
  return [...SIGNAL_INGESTION_PIPELINE].sort((a, b) => a.order - b.order);
}

export function getIngestionStage(stage: SignalIngestionStage): SignalIngestionStageDefinition {
  const found = SIGNAL_INGESTION_PIPELINE.find((s) => s.stage === stage);
  if (!found) throw new Error(`Unknown ingestion stage: ${stage}`);
  return found;
}
