/**
 * Signal idempotency contracts — replay-safe ingestion.
 * Interfaces only. No storage implementation.
 *
 * @see docs/architecture/SIGNAL_INGESTION.md
 */

/** Idempotency metadata attached to every signal submission. */
export type SignalIdempotencyMetadata = {
  /** Unique key for exactly-once semantics — contributor-scoped. */
  idempotencyKey: string;
  /** Contributor's own event identifier for correlation. */
  contributorEventId: string;
  /** Cross-system correlation for audit and debugging. */
  correlationId: string;
  /** ISO timestamp of original emission attempt. */
  submittedAt: string;
};

/** Result of duplicate detection — no persistence in this phase. */
export type SignalDuplicateHandling =
  | "accept_new"
  | "return_existing"
  | "reject_conflict"
  | "queue_for_review";

export type SignalDuplicateDetectionResult = {
  isDuplicate: boolean;
  handling: SignalDuplicateHandling;
  existingSignalId: string | null;
  detectedAt: string;
};

/** Future queue metadata — reserved for async ingestion workers. */
export type SignalQueueMetadata = {
  queueName: string | null;
  partitionKey: string | null;
  enqueueAttempt: number;
  maxRetries: number;
  nextRetryAt: string | null;
};

/** Replay detection context — identifies re-submitted signals. */
export type SignalReplayDetectionContext = {
  idempotency: SignalIdempotencyMetadata;
  contributorId: string;
  signalType: string;
  passportId: string;
  payloadHash: string;
};

/** Future idempotency store contract — not implemented. */
export interface SignalIdempotencyClient {
  checkDuplicate(context: SignalReplayDetectionContext): Promise<SignalDuplicateDetectionResult>;
  recordAccepted(context: SignalReplayDetectionContext, signalId: string): Promise<{ ok: boolean }>;
}
