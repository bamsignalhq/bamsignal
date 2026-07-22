/**
 * Dispute architecture — Principle 8: Right to Challenge.
 * Extension points only. No review workflows implemented.
 *
 * @see docs/architecture/DIGITAL_TRUST_CONSTITUTION.md
 */

import type { PassportId } from "../types";
import type { TrustSignalReviewStatus } from "./trustSignals";

const DISPUTE_STORE_KEY = "stankings-passport-disputes-v1";

export type DisputeCategory =
  | "incorrect_verification"
  | "incorrect_moderation"
  | "incorrect_fraud_flag"
  | "incorrect_reputation_event"
  | "incorrect_trust_signal"
  | "other";

export type DisputeStatus =
  | "submitted"
  | "acknowledged"
  | "under_review"
  | "resolved_upheld"
  | "resolved_corrected"
  | "resolved_removed"
  | "closed";

export type DisputeRecord = {
  disputeId: string;
  passportId: PassportId;
  category: DisputeCategory;
  status: DisputeStatus;
  /** Reference to disputed item — signal, audit entry, verification, etc. */
  targetRef: string;
  targetType: "trust_signal" | "audit_event" | "verification" | "reputation" | "other";
  submittedAt: string;
  updatedAt: string;
  userStatement: string;
  resolutionNote: string | null;
  /** Principle 9 — human review required for disputes. */
  requiresHumanReview: true;
};

export type DisputeSubmission = {
  category: DisputeCategory;
  targetRef: string;
  targetType: DisputeRecord["targetType"];
  userStatement: string;
};

function readDisputes(): DisputeRecord[] {
  try {
    const raw = localStorage.getItem(DISPUTE_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DisputeRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDisputes(disputes: DisputeRecord[]): void {
  try {
    localStorage.setItem(DISPUTE_STORE_KEY, JSON.stringify(disputes.slice(0, 100)));
  } catch {
    /* ignore */
  }
}

/** Prepared — submit a dispute (local marker; server workflow future). */
export function submitDispute(passportId: PassportId, submission: DisputeSubmission): DisputeRecord {
  const now = new Date().toISOString();
  const dispute: DisputeRecord = {
    disputeId: `dispute_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    passportId,
    category: submission.category,
    status: "submitted",
    targetRef: submission.targetRef,
    targetType: submission.targetType,
    submittedAt: now,
    updatedAt: now,
    userStatement: submission.userStatement,
    resolutionNote: null,
    requiresHumanReview: true
  };
  writeDisputes([dispute, ...readDisputes()]);
  return dispute;
}

export function listDisputes(passportId: PassportId): DisputeRecord[] {
  return readDisputes().filter((d) => d.passportId === passportId);
}

export function mapDisputeToSignalReviewStatus(status: DisputeStatus): TrustSignalReviewStatus {
  if (status === "under_review" || status === "acknowledged") return "under_review";
  if (status === "resolved_corrected") return "corrected";
  if (status === "resolved_removed") return "removed";
  if (status === "resolved_upheld") return "upheld";
  return "pending";
}

/** Future dispute resolution API — human oversight required. */
export interface DisputeResolutionClient {
  submit(passportId: PassportId, submission: DisputeSubmission): Promise<DisputeRecord>;
  getStatus(disputeId: string): Promise<DisputeRecord | null>;
}
