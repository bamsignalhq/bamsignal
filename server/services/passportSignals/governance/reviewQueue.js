/**
 * Admin review queue — human review remains authoritative.
 */

import crypto from "node:crypto";
import { query, isDatabaseReady } from "../../../db.js";
import { PassportSignalDatabaseError } from "../errors.js";

function createQueueId() {
  return `queue_${crypto.randomBytes(8).toString("hex")}`;
}

export async function enqueueSignalReview({
  signalId,
  passportId,
  contributorId,
  reason,
  priority = "normal",
  status = "pending_review"
}) {
  if (!isDatabaseReady()) throw new PassportSignalDatabaseError();

  const existing = await query(
    `select queue_id from passport_signal_review_queue
     where signal_id = $1 and resolved_at is null
     limit 1`,
    [signalId]
  );
  if (existing.rows[0]) {
    return { queueId: existing.rows[0].queue_id, existing: true };
  }

  const queueId = createQueueId();
  await query(
    `insert into passport_signal_review_queue (
      queue_id, signal_id, passport_id, contributor_id, status, priority, reason
    ) values ($1,$2,$3,$4,$5,$6,$7)`,
    [queueId, signalId, passportId, contributorId, status, priority, reason]
  );
  return { queueId, existing: false };
}

export async function updateReviewQueueStatus(queueId, status, { assignedTo = null, reason = null } = {}) {
  if (!isDatabaseReady()) throw new PassportSignalDatabaseError();
  await query(
    `update passport_signal_review_queue
     set status = $2,
         assigned_to = coalesce($3, assigned_to),
         reason = coalesce($4, reason),
         updated_at = now()
     where queue_id = $1`,
    [queueId, status, assignedTo, reason]
  );
}

export async function resolveReviewQueueForSignal(signalId, { resolutionNote = "" } = {}) {
  if (!isDatabaseReady()) return;
  await query(
    `update passport_signal_review_queue
     set status = 'resolved',
         resolution_note = $2,
         resolved_at = now(),
         updated_at = now()
     where signal_id = $1 and resolved_at is null`,
    [signalId, resolutionNote]
  );
}

export async function listReviewQueue({ status = null, limit = 50, offset = 0 } = {}) {
  if (!isDatabaseReady()) return [];
  const params = [];
  let where = "resolved_at is null";
  if (status) {
    params.push(status);
    where += ` and status = $${params.length}`;
  }
  params.push(limit, offset);
  const result = await query(
    `select queue_id, signal_id, passport_id, contributor_id, status, priority,
            assigned_to, reason, resolution_note, created_at, updated_at, resolved_at
     from passport_signal_review_queue
     where ${where}
     order by
       case priority when 'critical' then 1 when 'high' then 2 else 3 end,
       created_at asc
     limit $${params.length - 1} offset $${params.length}`,
    params
  );
  return result.rows.map(mapQueueRow);
}

export async function getReviewQueueCounts() {
  if (!isDatabaseReady()) {
    return { pending: 0, escalated: 0, awaitingEvidence: 0, awaitingContributor: 0 };
  }
  const result = await query(
    `select status, count(*)::int as count
     from passport_signal_review_queue
     where resolved_at is null
     group by status`
  );
  const counts = { pending: 0, escalated: 0, awaitingEvidence: 0, awaitingContributor: 0 };
  for (const row of result.rows) {
    if (row.status === "pending_review") counts.pending += row.count;
    if (row.status === "escalated") counts.escalated += row.count;
    if (row.status === "awaiting_evidence") counts.awaitingEvidence += row.count;
    if (row.status === "awaiting_contributor") counts.awaitingContributor += row.count;
  }
  return counts;
}

export function mapQueueRow(row) {
  return {
    queueId: row.queue_id,
    signalId: row.signal_id,
    passportId: row.passport_id,
    contributorId: row.contributor_id,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    reason: row.reason,
    resolutionNote: row.resolution_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at
  };
}
