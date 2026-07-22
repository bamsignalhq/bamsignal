import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

const STATE_TABLE = "ops_support_ticket_state";
const LOG_TABLE = "ops_support_lifecycle_log";

export const TICKET_STATUSES = Object.freeze([
  "open",
  "assigned",
  "awaiting_member",
  "awaiting_staff",
  "resolved",
  "closed",
  "reopened",
  "escalated"
]);

export const TICKET_PRIORITIES = Object.freeze(["low", "normal", "high", "urgent"]);

const VALID_TRANSITIONS = Object.freeze({
  open: ["assigned", "awaiting_staff", "escalated", "closed"],
  assigned: ["awaiting_member", "awaiting_staff", "resolved", "escalated", "closed"],
  awaiting_member: ["awaiting_staff", "resolved", "closed"],
  awaiting_staff: ["awaiting_member", "resolved", "escalated", "closed"],
  resolved: ["closed", "reopened"],
  closed: ["reopened"],
  reopened: ["assigned", "awaiting_staff", "escalated"],
  escalated: ["assigned", "awaiting_staff", "resolved", "closed"]
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

function defaultSlaDueAt(priority = "normal") {
  const hours =
    priority === "urgent" ? 4 : priority === "high" ? 12 : priority === "low" ? 72 : 24;
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export async function createSupportTicket(input = {}) {
  const ticketId = String(input.ticketId || `tkt_${crypto.randomUUID()}`);
  const subject = String(input.subject || "Support request").slice(0, 500);
  const priority = TICKET_PRIORITIES.includes(input.priority) ? input.priority : "normal";
  if (!(await ensureTables())) return { ok: false, skipped: true };

  const slaDueAt = input.slaDueAt || defaultSlaDueAt(priority);

  await query(
    `insert into ops_support_ticket_state (
       ticket_id, member_id, member_user_key, status, priority, category, subject, sla_due_at, metadata
     ) values ($1,$2,$3,'open',$4,$5,$6,$7,$8::jsonb)
     on conflict (ticket_id) do nothing`,
    [
      ticketId,
      input.memberId || null,
      input.memberUserKey || null,
      priority,
      String(input.category || "general"),
      subject,
      slaDueAt,
      JSON.stringify(input.metadata || {})
    ]
  );

  await transitionSupportTicket({
    ticketId,
    newStatus: "open",
    previousStatus: "none",
    actor: input.actor || "member",
    actorRole: "member",
    reason: "Ticket opened"
  });

  const { publishAdminEvent } = await import("./eventBus.js");
  await publishAdminEvent({
    eventType: "ticket.created",
    payload: { ticketId, priority, category: input.category || "general" },
    actor: input.actor || "member",
    idempotencyKey: `ticket.created:${ticketId}`
  });

  const { incrementOperationsMetric } = await import("./observability.js");
  incrementOperationsMetric("supportTicketsOpened", 1);

  return { ok: true, ticketId, status: "open", slaDueAt };
}

export async function transitionSupportTicket(input = {}) {
  const ticketId = String(input.ticketId || "").trim();
  const newStatus = String(input.newStatus || "").trim();
  if (!TICKET_STATUSES.includes(newStatus)) return { ok: false, error: "invalid_status" };
  if (!(await ensureTables())) return { ok: false, skipped: true };

  const current = await query(
    "select status, owner_email, first_response_at, resolved_at from ops_support_ticket_state where ticket_id = $1 limit 1",
    [ticketId]
  );
  const row = current.rows[0];
  const previousStatus = String(input.previousStatus || row?.status || "open");
  if (!canTransition(previousStatus, newStatus)) {
    return { ok: false, error: "invalid_transition", previousStatus, newStatus };
  }

  const logId = String(input.logId || crypto.randomUUID());
  await query(
    `insert into ops_support_lifecycle_log (
       log_id, ticket_id, previous_status, new_status, reason_code, reason, actor, actor_role, metadata
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
     on conflict (log_id) do nothing`,
    [
      logId,
      ticketId,
      previousStatus,
      newStatus,
      String(input.reasonCode || "system"),
      String(input.reason || "").slice(0, 500),
      String(input.actor || "system"),
      String(input.actorRole || "system"),
      JSON.stringify(input.metadata || {})
    ]
  );

  const firstResponseAt =
    !row?.first_response_at && ["awaiting_member", "resolved"].includes(newStatus)
      ? new Date().toISOString()
      : null;
  const resolvedAt = newStatus === "resolved" ? new Date().toISOString() : null;

  await query(
    `update ops_support_ticket_state
     set status = $2,
         owner_email = coalesce($3, owner_email),
         first_response_at = coalesce(first_response_at, $4::timestamptz),
         resolved_at = coalesce($5::timestamptz, resolved_at),
         updated_at = now()
     where ticket_id = $1`,
    [ticketId, newStatus, input.ownerEmail || null, firstResponseAt, resolvedAt]
  );

  const { publishAdminEvent } = await import("./eventBus.js");
  await publishAdminEvent({
    eventType: newStatus === "closed" ? "ticket.closed" : "ticket.updated",
    payload: { ticketId, previousStatus, newStatus },
    actor: input.actor || "system",
    idempotencyKey: `ticket.${newStatus}:${ticketId}:${logId}`
  });

  if (newStatus === "resolved" || newStatus === "closed") {
    const { incrementOperationsMetric } = await import("./observability.js");
    incrementOperationsMetric("supportTicketsResolved", 1);
  }

  return { ok: true, logId, previousStatus, newStatus };
}

export async function assignSupportTicket(input = {}) {
  return transitionSupportTicket({
    ...input,
    newStatus: "assigned",
    ownerEmail: input.ownerEmail || input.assigneeEmail,
    reasonCode: "assigned",
    reason: input.reason || "Ticket assigned"
  });
}

export async function addSupportInternalNote(input = {}) {
  if (!(await ensureTables())) return { ok: false, skipped: true };
  const noteId = String(input.noteId || crypto.randomUUID());
  await query(
    `insert into ops_support_internal_notes (note_id, ticket_id, author_email, body, metadata)
     values ($1,$2,$3,$4,$5::jsonb)
     on conflict (note_id) do nothing`,
    [
      noteId,
      String(input.ticketId),
      String(input.authorEmail || "system").toLowerCase(),
      String(input.body || "").slice(0, 4000),
      JSON.stringify(input.metadata || {})
    ]
  );
  return { ok: true, noteId };
}

export async function listSupportQueue(options = {}) {
  if (!(await ensureTables())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 500);
  const status = options.status || null;
  const { rows } = await query(
    status
      ? `select ticket_id, member_id, status, priority, category, owner_email, subject, sla_due_at, created_at, updated_at
         from ops_support_ticket_state where status = $1 order by updated_at desc limit $2`
      : `select ticket_id, member_id, status, priority, category, owner_email, subject, sla_due_at, created_at, updated_at
         from ops_support_ticket_state order by updated_at desc limit $1`,
    status ? [status, limit] : [limit]
  );
  return rows;
}

export async function listSupportTransitions(ticketId, options = {}) {
  if (!(await ensureTables())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select log_id, previous_status, new_status, reason, actor, occurred_at
     from ops_support_lifecycle_log where ticket_id = $1 order by occurred_at desc limit $2`,
    [ticketId, limit]
  );
  return rows;
}

export async function escalateSupportTicket(input = {}) {
  const { incrementOperationsMetric } = await import("./observability.js");
  incrementOperationsMetric("supportEscalations", 1);
  return transitionSupportTicket({
    ...input,
    newStatus: "escalated",
    reasonCode: "escalated",
    reason: input.reason || "Ticket escalated"
  });
}
