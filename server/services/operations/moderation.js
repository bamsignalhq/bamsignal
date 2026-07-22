import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

const STATE_TABLE = "ops_moderation_report_state";
const LOG_TABLE = "ops_moderation_lifecycle_log";

export const REPORT_STATUSES = Object.freeze([
  "submitted",
  "triaged",
  "assigned",
  "investigating",
  "awaiting_response",
  "action_taken",
  "resolved",
  "dismissed",
  "appealed",
  "closed"
]);

const VALID_TRANSITIONS = Object.freeze({
  submitted: ["triaged", "assigned", "dismissed", "closed"],
  triaged: ["assigned", "investigating", "dismissed"],
  assigned: ["investigating", "awaiting_response", "dismissed"],
  investigating: ["awaiting_response", "action_taken", "dismissed"],
  awaiting_response: ["investigating", "action_taken", "resolved", "dismissed"],
  action_taken: ["resolved", "appealed", "closed"],
  resolved: ["appealed", "closed"],
  dismissed: ["closed"],
  appealed: ["investigating", "resolved", "closed"],
  closed: []
});

async function ensureTables() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(STATE_TABLE);
    await assertSchemaTable(LOG_TABLE);
    return true;
  } catch {
    return false;
  }
}

function canTransition(from, to) {
  if (from === to) return true;
  return (VALID_TRANSITIONS[from] || []).includes(to);
}

export async function createModerationReport(input = {}) {
  const reportId = String(input.reportId || "").trim();
  const profileId = String(input.profileId || "").trim();
  if (!reportId || !profileId) return { ok: false, error: "missing_ids" };
  if (!(await ensureTables())) return { ok: false, skipped: true };

  await query(
    `insert into ops_moderation_report_state (
       report_id, profile_id, status, reporter_user_key, risk_score, metadata
     ) values ($1,$2,'submitted',$3,$4,$5::jsonb)
     on conflict (report_id) do nothing`,
    [
      reportId,
      profileId,
      input.reporterUserKey || null,
      Number(input.riskScore) || 0,
      JSON.stringify(input.metadata || {})
    ]
  );

  await transitionModerationReport({
    reportId,
    newStatus: "submitted",
    previousStatus: "none",
    actor: input.actor || "member",
    actorRole: "member",
    reason: input.reason || "Report submitted",
    reasonCode: "report_created"
  });

  const { publishAdminEvent } = await import("./eventBus.js");
  await publishAdminEvent({
    eventType: "report.created",
    payload: { reportId, profileId },
    actor: input.actor || "member",
    idempotencyKey: `report.created:${reportId}`
  });

  return { ok: true, reportId, status: "submitted" };
}

export async function transitionModerationReport(input = {}) {
  const reportId = String(input.reportId || "").trim();
  const newStatus = String(input.newStatus || "").trim();
  if (!REPORT_STATUSES.includes(newStatus)) return { ok: false, error: "invalid_status" };
  if (!(await ensureTables())) return { ok: false, skipped: true };

  const current = await query(
    "select status, assigned_to from ops_moderation_report_state where report_id = $1 limit 1",
    [reportId]
  );
  const previousStatus = String(input.previousStatus || current.rows[0]?.status || "submitted");
  if (!canTransition(previousStatus, newStatus)) {
    return { ok: false, error: "invalid_transition", previousStatus, newStatus };
  }

  const logId = String(input.logId || crypto.randomUUID());
  await query(
    `insert into ops_moderation_lifecycle_log (
       log_id, report_id, previous_status, new_status, reason_code, reason, actor, actor_role, metadata
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
     on conflict (log_id) do nothing`,
    [
      logId,
      reportId,
      previousStatus,
      newStatus,
      String(input.reasonCode || "system"),
      String(input.reason || "").slice(0, 500),
      String(input.actor || "system"),
      String(input.actorRole || "system"),
      JSON.stringify(input.metadata || {})
    ]
  );

  await query(
    `update ops_moderation_report_state
     set status = $2,
         assigned_to = coalesce($3, assigned_to),
         risk_score = coalesce($4, risk_score),
         updated_at = now()
     where report_id = $1`,
    [
      reportId,
      newStatus,
      input.assignedTo || null,
      input.riskScore != null ? Number(input.riskScore) : null
    ]
  );

  if (newStatus === "assigned" && input.assignedTo) {
    const { publishAdminEvent } = await import("./eventBus.js");
    await publishAdminEvent({
      eventType: "report.assigned",
      payload: { reportId, assignedTo: input.assignedTo },
      actor: input.actor || "system",
      idempotencyKey: `report.assigned:${reportId}:${logId}`
    });
  }

  if (newStatus === "closed" || newStatus === "dismissed" || newStatus === "resolved") {
    const { publishAdminEvent } = await import("./eventBus.js");
    await publishAdminEvent({
      eventType: "report.closed",
      payload: { reportId, status: newStatus },
      actor: input.actor || "system",
      idempotencyKey: `report.closed:${reportId}:${logId}`
    });
  }

  return { ok: true, logId, previousStatus, newStatus };
}

export async function assignModerationReport(input = {}) {
  return transitionModerationReport({
    ...input,
    newStatus: "assigned",
    assignedTo: input.assignedTo || input.moderatorEmail,
    reasonCode: "assigned",
    reason: input.reason || "Moderator assigned"
  });
}

export async function addModerationEvidence(input = {}) {
  if (!(await ensureTables())) return { ok: false, skipped: true };
  const evidenceId = String(input.evidenceId || crypto.randomUUID());
  await query(
    `insert into ops_moderation_evidence (
       evidence_id, report_id, kind, uri, description, uploaded_by, metadata
     ) values ($1,$2,$3,$4,$5,$6,$7::jsonb)
     on conflict (evidence_id) do nothing`,
    [
      evidenceId,
      String(input.reportId),
      String(input.kind || "attachment"),
      String(input.uri || ""),
      String(input.description || "").slice(0, 2000),
      String(input.uploadedBy || "system"),
      JSON.stringify(input.metadata || {})
    ]
  );
  return { ok: true, evidenceId };
}

export async function addModerationInternalNote(input = {}) {
  if (!(await ensureTables())) return { ok: false, skipped: true };
  const noteId = String(input.noteId || crypto.randomUUID());
  await query(
    `insert into ops_moderation_internal_notes (note_id, report_id, author_email, body, metadata)
     values ($1,$2,$3,$4,$5::jsonb)
     on conflict (note_id) do nothing`,
    [
      noteId,
      String(input.reportId),
      String(input.authorEmail || "system").toLowerCase(),
      String(input.body || "").slice(0, 4000),
      JSON.stringify(input.metadata || {})
    ]
  );
  return { ok: true, noteId };
}

export async function listModerationQueue(options = {}) {
  if (!(await ensureTables())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 500);
  const status = options.status || null;
  const { rows } = await query(
    status
      ? `select report_id, profile_id, status, assigned_to, risk_score, created_at, updated_at
         from ops_moderation_report_state where status = $1 order by updated_at desc limit $2`
      : `select report_id, profile_id, status, assigned_to, risk_score, created_at, updated_at
         from ops_moderation_report_state order by updated_at desc limit $1`,
    status ? [status, limit] : [limit]
  );
  return rows;
}

export async function listModerationTransitions(reportId, options = {}) {
  if (!(await ensureTables())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select log_id, previous_status, new_status, reason_code, reason, actor, actor_role, occurred_at
     from ops_moderation_lifecycle_log
     where report_id = $1
     order by occurred_at desc
     limit $2`,
    [reportId, limit]
  );
  return rows;
}

export async function submitModerationAppeal(input = {}) {
  return transitionModerationReport({
    reportId: input.reportId,
    newStatus: "appealed",
    reasonCode: "appeal",
    reason: input.reason || "Appeal submitted",
    actor: input.actor || "member",
    actorRole: "member"
  });
}
