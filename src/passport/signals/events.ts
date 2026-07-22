/**
 * Passport signal event model — future event-driven architecture.
 * Contracts only. No message bus implementation.
 *
 * @see docs/architecture/SIGNAL_INGESTION.md
 */

export type PassportSignalEventType =
  | "signal_created"
  | "signal_updated"
  | "signal_revoked"
  | "signal_expired"
  | "consent_revoked"
  | "contributor_suspended"
  | "human_review_requested"
  | "human_review_completed"
  | "trust_recomputed";

export type PassportSignalEvent<TPayload = Record<string, unknown>> = {
  eventId: string;
  eventType: PassportSignalEventType;
  passportId: string;
  signalId: string | null;
  contributorId: string | null;
  occurredAt: string;
  correlationId: string;
  payload: TPayload;
  auditRef: string;
};

export type SignalCreatedPayload = {
  signalId: string;
  signalType: string;
  category: string;
};

export type SignalRevokedPayload = {
  signalId: string;
  reason: string;
  revokedBy: string;
};

export type HumanReviewRequestedPayload = {
  signalId: string;
  reviewReason: string;
  priority: "normal" | "high";
};

export type TrustRecomputedPayload = {
  passportId: string;
  trigger: PassportSignalEventType;
  /** Future — derived summaries only, never raw signals exposed. */
  derived: true;
};

/** Future event publisher — not implemented. */
export interface PassportSignalEventPublisher {
  publish(event: PassportSignalEvent): Promise<{ published: boolean; eventId: string }>;
}

/** Future event subscriber — Trust Engine and audit consumers. */
export interface PassportSignalEventSubscriber {
  subscribe(
    eventTypes: PassportSignalEventType[],
    handler: (event: PassportSignalEvent) => Promise<void>
  ): { unsubscribe: () => void };
}
