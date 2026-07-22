/**
 * Trust Signal governance lifecycle — Platform Phase 3.
 * Operational states only. Never delete signals. Never influence trust scores.
 *
 * @see docs/architecture/SIGNAL_GOVERNANCE.md
 */

/** Full operational lifecycle — append-only history preserves all transitions. */
export type TrustSignalLifecycleStatus =
  | "received"
  | "validated"
  | "accepted"
  | "quarantined"
  | "rejected"
  | "revoked"
  | "expired"
  | "archived"
  | "pending"
  | "under_review";

export type TrustSignalLifecycleStageDefinition = {
  status: TrustSignalLifecycleStatus;
  order: number;
  label: string;
  description: string;
  terminal: boolean;
};

export const TRUST_SIGNAL_LIFECYCLE_STAGES: readonly TrustSignalLifecycleStageDefinition[] = [
  { status: "received", order: 1, label: "Received", description: "Signal received from contributor", terminal: false },
  { status: "validated", order: 2, label: "Validated", description: "Passed validation pipeline", terminal: false },
  { status: "accepted", order: 3, label: "Accepted", description: "Accepted for platform use", terminal: false },
  { status: "quarantined", order: 4, label: "Quarantined", description: "Held pending governance review", terminal: false },
  { status: "rejected", order: 5, label: "Rejected", description: "Rejected by governance", terminal: true },
  { status: "revoked", order: 6, label: "Revoked", description: "Revoked after acceptance", terminal: true },
  { status: "expired", order: 7, label: "Expired", description: "Expired per retention policy", terminal: true },
  { status: "archived", order: 8, label: "Archived", description: "Archived — retained for audit", terminal: true }
] as const;

/** Governance action types — every action generates audit + event. */
export type SignalGovernanceActionType =
  | "approve"
  | "reject"
  | "revoke"
  | "restore"
  | "expire"
  | "quarantine"
  | "annotate"
  | "suspend_contributor";

export type SignalGovernanceReasonCode =
  | "manual_review"
  | "policy_violation"
  | "consent_issue"
  | "evidence_insufficient"
  | "contributor_request"
  | "replay_suspected"
  | "retention_policy"
  | "restored_after_review"
  | "operational_note"
  | "other";

export type SignalGovernanceActionRecord = {
  actionId: string;
  signalId: string;
  action: SignalGovernanceActionType;
  reasonCode: SignalGovernanceReasonCode;
  reason: string;
  actor: string;
  actorRole: "admin" | "system" | "contributor";
  previousStatus: TrustSignalLifecycleStatus;
  newStatus: TrustSignalLifecycleStatus;
  annotation: string | null;
  auditRef: string;
  occurredAt: string;
};

/** Review queue status — human review remains authoritative. */
export type SignalReviewQueueStatus =
  | "pending_review"
  | "awaiting_evidence"
  | "awaiting_contributor"
  | "escalated"
  | "resolved"
  | "cancelled";

export type SignalReviewQueueItem = {
  queueId: string;
  signalId: string;
  passportId: string;
  contributorId: string;
  status: SignalReviewQueueStatus;
  priority: "normal" | "high" | "critical";
  assignedTo: string | null;
  reason: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

/** Append-only history entry — never overwrite. */
export type SignalHistoryEntryKind =
  | "created"
  | "validation"
  | "governance_action"
  | "consent_change"
  | "contributor_event"
  | "lifecycle_change"
  | "retention";

export type SignalHistoryEntry = {
  historyId: string;
  signalId: string;
  kind: SignalHistoryEntryKind;
  headline: string;
  summary: string;
  actor: string | null;
  metadata: Record<string, string | number | boolean | null>;
  occurredAt: string;
};

/** Retention classification — metadata only, never hard delete. */
export type SignalRetentionClass = "active" | "archived" | "expired" | "revoked";

export type SignalRetentionMetadata = {
  signalId: string;
  retentionClass: SignalRetentionClass;
  retainUntil: string | null;
  archivedAt: string | null;
  policyLabel: string;
};

/** Contributor health — operational metrics only, never trust. */
export type ContributorHealthSnapshot = {
  contributorId: string;
  signalsSubmitted: number;
  signalsAccepted: number;
  signalsRejected: number;
  validationFailures: number;
  consentFailures: number;
  duplicateCount: number;
  acceptanceRate: number;
  duplicateRate: number;
  lastActivityAt: string | null;
  status: string;
  /** Explicit — operational only. */
  influencesTrust: false;
};

/** Replay alert severity — future alerting integration. */
export type ReplayAlertSeverity = "info" | "warning" | "critical";

export type ReplayMonitoringEvent = {
  eventId: string;
  contributorId: string;
  signalId: string | null;
  kind: "repeated_submission" | "duplicate_burst" | "out_of_order" | "clock_drift" | "contributor_anomaly";
  severity: ReplayAlertSeverity;
  summary: string;
  detectedAt: string;
};

/** Alerting contract — interfaces only for future notification systems. */
export type PassportSignalAlertType =
  | "contributor_suspended"
  | "validation_spike"
  | "replay_attack_detected"
  | "consent_failures_increasing"
  | "pipeline_unavailable"
  | "migration_failure"
  | "storage_failure";

export interface PassportSignalAlertPublisher {
  publish(alert: {
    alertType: PassportSignalAlertType;
    severity: ReplayAlertSeverity;
    headline: string;
    summary: string;
    metadata: Record<string, string | number | boolean | null>;
  }): Promise<{ published: boolean; alertId: string }>;
}

/** Governance dashboard contract — backend only, no UI. */
export type GovernanceDashboardSnapshot = {
  generatedAt: string;
  signalQueue: { pending: number; escalated: number; awaitingEvidence: number };
  contributorHealth: ContributorHealthSnapshot[];
  pipelineMetrics: Record<string, number>;
  recentGovernanceActions: SignalGovernanceActionRecord[];
  validationFailures: number;
  consentFailures: number;
  replayAlerts: ReplayMonitoringEvent[];
  systemHealth: { database: string; ingestion: string };
};
