/**
 * Governance actions — approve, reject, revoke, restore, expire, quarantine, annotate.
 * Every action generates audit record, governance event, and history entry.
 */

import crypto from "node:crypto";
import { query, isDatabaseReady } from "../../../db.js";
import { PassportSignalDatabaseError, PassportSignalError } from "../errors.js";
import { getSignalById } from "../persistence.js";
import { publishSignalEvent } from "../eventBus.js";
import { canTransition, targetStatusForAction } from "./lifecycle.js";
import { appendSignalHistory } from "./history.js";
import { resolveReviewQueueForSignal } from "./reviewQueue.js";
import { updateContributorHealthCounters } from "./contributorHealth.js";
import { logGovernanceAction } from "../observability.js";

function createActionId() {
  return `gov_${crypto.randomBytes(8).toString("hex")}`;
}

function createAuditRef(action, signalId) {
  return `audit:governance:${action}:${signalId}:${Date.now()}`;
}

export async function applyGovernanceAction({
  signalId,
  action,
  reasonCode = "manual_review",
  reason = "",
  actor,
  actorRole = "admin",
  annotation = null
}) {
  if (!isDatabaseReady()) throw new PassportSignalDatabaseError();

  const row = await getSignalById(signalId);
  if (!row) {
    throw new PassportSignalError("Signal not found", { code: "not_found", status: 404 });
  }

  const previousStatus = row.status;
  if (!canTransition(action, previousStatus)) {
    throw new PassportSignalError(`Cannot ${action} signal in status ${previousStatus}`, {
      code: "invalid_transition",
      status: 422
    });
  }

  const newStatus = action === "annotate" ? previousStatus : targetStatusForAction(action);
  const actionId = createActionId();
  const auditRef = createAuditRef(action, signalId);

  if (action !== "annotate") {
    await query(
      `update passport_trust_signals
       set status = $2,
           revocation = case when $3 = 'revoked' then $4::jsonb else revocation end,
           updated_at = now()
       where signal_id = $1 and deleted_at is null`,
      [
        signalId,
        newStatus,
        newStatus,
        JSON.stringify({
          revokedAt: new Date().toISOString(),
          revokedBy: actor,
          reason,
          auditRef
        })
      ]
    );
  }

  await query(
    `insert into passport_signal_governance_actions (
      action_id, signal_id, passport_id, contributor_id, action, reason_code, reason,
      actor, actor_role, previous_status, new_status, annotation, audit_ref
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      actionId,
      signalId,
      row.passport_id,
      row.contributor_id,
      action,
      reasonCode,
      reason,
      actor,
      actorRole,
      previousStatus,
      newStatus,
      annotation,
      auditRef
    ]
  );

  await appendSignalHistory({
    signalId,
    passportId: row.passport_id,
    kind: "governance_action",
    headline: `Governance: ${action}`,
    summary: reason || annotation || `${action} applied`,
    actor,
    metadata: { action, reasonCode, previousStatus, newStatus, actionId }
  });

  if (newStatus !== previousStatus) {
    await appendSignalHistory({
      signalId,
      passportId: row.passport_id,
      kind: "lifecycle_change",
      headline: `Status: ${previousStatus} → ${newStatus}`,
      summary: reason,
      actor,
      metadata: { previousStatus, newStatus }
    });
  }

  if (["approve", "reject", "revoke", "restore", "quarantine"].includes(action)) {
    await resolveReviewQueueForSignal(signalId, {
      resolutionNote: reason || `${action} by ${actor}`
    });
  }

  const eventType =
    action === "revoke" ? "signal_revoked" : action === "expire" ? "signal_expired" : "signal_updated";

  await publishSignalEvent({
    eventType,
    passportId: row.passport_id,
    signalId,
    contributorId: row.contributor_id,
    correlationId: actionId,
    auditRef,
    payload: { action, previousStatus, newStatus, reasonCode }
  });

  if (action === "reject" || action === "revoke") {
    await updateContributorHealthCounters(row.contributor_id, { signalsRejected: 1 });
  } else if (action === "approve" || action === "restore") {
    await updateContributorHealthCounters(row.contributor_id, { signalsAccepted: 1 });
  }

  logGovernanceAction({ action, signalId, actor, previousStatus, newStatus, reasonCode });

  return {
    actionId,
    signalId,
    action,
    previousStatus,
    newStatus,
    auditRef,
    occurredAt: new Date().toISOString()
  };
}

export async function listGovernanceActions({ signalId = null, limit = 50, offset = 0 } = {}) {
  if (!isDatabaseReady()) return [];
  const params = [];
  let where = "1=1";
  if (signalId) {
    params.push(signalId);
    where = `signal_id = $${params.length}`;
  }
  params.push(limit, offset);
  const result = await query(
    `select action_id, signal_id, passport_id, contributor_id, action, reason_code, reason,
            actor, actor_role, previous_status, new_status, annotation, audit_ref, occurred_at
     from passport_signal_governance_actions
     where ${where}
     order by occurred_at desc
     limit $${params.length - 1} offset $${params.length}`,
    params
  );
  return result.rows.map(mapGovernanceActionRow);
}

export function mapGovernanceActionRow(row) {
  return {
    actionId: row.action_id,
    signalId: row.signal_id,
    passportId: row.passport_id,
    contributorId: row.contributor_id,
    action: row.action,
    reasonCode: row.reason_code,
    reason: row.reason,
    actor: row.actor,
    actorRole: row.actor_role,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    annotation: row.annotation,
    auditRef: row.audit_ref,
    occurredAt: row.occurred_at
  };
}

/** Convenience wrappers */
export const approveSignal = (opts) => applyGovernanceAction({ ...opts, action: "approve" });
export const rejectSignal = (opts) => applyGovernanceAction({ ...opts, action: "reject" });
export const revokeSignal = (opts) => applyGovernanceAction({ ...opts, action: "revoke" });
export const restoreSignal = (opts) => applyGovernanceAction({ ...opts, action: "restore" });
export const expireSignal = (opts) => applyGovernanceAction({ ...opts, action: "expire" });
export const quarantineSignal = (opts) => applyGovernanceAction({ ...opts, action: "quarantine" });
export const annotateSignal = (opts) =>
  applyGovernanceAction({ ...opts, action: "annotate", annotation: opts.annotation || opts.reason });
