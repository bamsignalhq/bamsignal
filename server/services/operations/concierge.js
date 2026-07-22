import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

const QUEUE_TABLE = "ops_concierge_queue_state";
const LOG_TABLE = "ops_concierge_assignment_log";

export const CONCIERGE_QUEUE_STATUSES = Object.freeze([
  "queued",
  "assigned",
  "in_progress",
  "awaiting_review",
  "escalated",
  "completed",
  "closed"
]);

export const CONCIERGE_PRIORITIES = Object.freeze(["normal", "vip", "urgent"]);

async function ensureTables() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(QUEUE_TABLE);
    await assertSchemaTable(LOG_TABLE);
    return true;
  } catch {
    return false;
  }
}

export async function enqueueConciergeCase(input = {}) {
  const queueId = String(input.queueId || `cq_${crypto.randomUUID()}`);
  const caseMemberId = String(input.caseMemberId || "").trim();
  const journeyId = String(input.journeyId || "").trim();
  if (!caseMemberId || !journeyId) return { ok: false, error: "missing_case" };
  if (!(await ensureTables())) return { ok: false, skipped: true };

  const priority = CONCIERGE_PRIORITIES.includes(input.priority) ? input.priority : "normal";

  await query(
    `insert into ops_concierge_queue_state (
       queue_id, case_member_id, journey_id, status, priority, workload_score, metadata
     ) values ($1,$2,$3,'queued',$4,$5,$6::jsonb)
     on conflict (queue_id) do nothing`,
    [
      queueId,
      caseMemberId,
      journeyId,
      priority,
      Number(input.workloadScore) || 1,
      JSON.stringify(input.metadata || {})
    ]
  );

  const { incrementOperationsMetric } = await import("./observability.js");
  incrementOperationsMetric("conciergeQueueDepth", 1);

  return { ok: true, queueId, status: "queued" };
}

export async function assignConciergeAgent(input = {}) {
  const queueId = String(input.queueId || "").trim();
  const agentEmail = String(input.agentEmail || input.assignedAgentEmail || "").toLowerCase();
  if (!queueId || !agentEmail) return { ok: false, error: "missing_assignment" };
  if (!(await ensureTables())) return { ok: false, skipped: true };

  const current = await query(
    "select assigned_agent_email, case_member_id from ops_concierge_queue_state where queue_id = $1 limit 1",
    [queueId]
  );
  const row = current.rows[0];
  if (!row) return { ok: false, error: "queue_not_found" };

  const logId = String(input.logId || crypto.randomUUID());
  await query(
    `insert into ops_concierge_assignment_log (
       log_id, queue_id, case_member_id, previous_agent, new_agent, action, reason, actor, metadata
     ) values ($1,$2,$3,$4,$5,'assigned',$6,$7,$8::jsonb)
     on conflict (log_id) do nothing`,
    [
      logId,
      queueId,
      row.case_member_id,
      row.assigned_agent_email || null,
      agentEmail,
      String(input.reason || "Agent assigned").slice(0, 500),
      String(input.actor || "system"),
      JSON.stringify(input.metadata || {})
    ]
  );

  await query(
    `update ops_concierge_queue_state
     set status = 'assigned', assigned_agent_email = $2, updated_at = now()
     where queue_id = $1`,
    [queueId, agentEmail]
  );

  const { publishAdminEvent } = await import("./eventBus.js");
  await publishAdminEvent({
    eventType: "concierge.assigned",
    payload: { queueId, caseMemberId: row.case_member_id, agentEmail },
    actor: input.actor || "system",
    idempotencyKey: `concierge.assigned:${queueId}:${logId}`
  });

  return { ok: true, queueId, agentEmail, logId };
}

export async function completeConciergeCase(input = {}) {
  const queueId = String(input.queueId || "").trim();
  if (!(await ensureTables())) return { ok: false, skipped: true };

  const current = await query(
    "select case_member_id, assigned_agent_email from ops_concierge_queue_state where queue_id = $1 limit 1",
    [queueId]
  );
  const row = current.rows[0];
  if (!row) return { ok: false, error: "queue_not_found" };

  const logId = String(input.logId || crypto.randomUUID());
  await query(
    `insert into ops_concierge_assignment_log (
       log_id, queue_id, case_member_id, previous_agent, new_agent, action, reason, actor, metadata
     ) values ($1,$2,$3,$4,null,'completed',$5,$6,$7::jsonb)
     on conflict (log_id) do nothing`,
    [
      logId,
      queueId,
      row.case_member_id,
      row.assigned_agent_email || null,
      String(input.reason || "Case completed").slice(0, 500),
      String(input.actor || "system"),
      JSON.stringify(input.metadata || {})
    ]
  );

  await query(
    `update ops_concierge_queue_state set status = 'completed', updated_at = now() where queue_id = $1`,
    [queueId]
  );

  const { publishAdminEvent } = await import("./eventBus.js");
  await publishAdminEvent({
    eventType: "concierge.completed",
    payload: { queueId, caseMemberId: row.case_member_id },
    actor: input.actor || "system",
    idempotencyKey: `concierge.completed:${queueId}:${logId}`
  });

  const { incrementOperationsMetric } = await import("./observability.js");
  incrementOperationsMetric("conciergeCasesCompleted", 1);

  return { ok: true, queueId, logId };
}

export async function escalateConciergeCase(input = {}) {
  const queueId = String(input.queueId || "").trim();
  if (!(await ensureTables())) return { ok: false, skipped: true };

  const current = await query(
    "select case_member_id, assigned_agent_email from ops_concierge_queue_state where queue_id = $1 limit 1",
    [queueId]
  );
  const row = current.rows[0];
  if (!row) return { ok: false, error: "queue_not_found" };

  const logId = String(input.logId || crypto.randomUUID());
  await query(
    `insert into ops_concierge_assignment_log (
       log_id, queue_id, case_member_id, previous_agent, new_agent, action, reason, actor, metadata
     ) values ($1,$2,$3,$4,null,'escalated',$5,$6,$7::jsonb)
     on conflict (log_id) do nothing`,
    [
      logId,
      queueId,
      row.case_member_id,
      row.assigned_agent_email || null,
      String(input.reason || "Case escalated").slice(0, 500),
      String(input.actor || "system"),
      JSON.stringify(input.metadata || {})
    ]
  );

  await query(
    `update ops_concierge_queue_state set status = 'escalated', updated_at = now() where queue_id = $1`,
    [queueId]
  );

  const { incrementOperationsMetric } = await import("./observability.js");
  incrementOperationsMetric("conciergeEscalations", 1);

  return { ok: true, queueId, logId };
}

/** Balance workload by selecting agent with fewest active assignments. */
export async function balanceConciergeWorkload(options = {}) {
  if (!(await ensureTables())) return { ok: false, skipped: true, agentEmail: null };

  const { rows } = await query(
    `select assigned_agent_email, count(*)::int as active_count
     from ops_concierge_queue_state
     where status in ('assigned', 'in_progress') and assigned_agent_email is not null
     group by assigned_agent_email
     order by active_count asc
     limit 1`
  );

  const preferred = rows[0]?.assigned_agent_email || options.fallbackAgent || null;
  return { ok: true, agentEmail: preferred, activeCount: rows[0]?.active_count || 0 };
}

export async function listConciergeQueue(options = {}) {
  if (!(await ensureTables())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 500);
  const status = options.status || null;
  const { rows } = await query(
    status
      ? `select queue_id, case_member_id, journey_id, status, assigned_agent_email, priority, created_at, updated_at
         from ops_concierge_queue_state where status = $1 order by updated_at desc limit $2`
      : `select queue_id, case_member_id, journey_id, status, assigned_agent_email, priority, created_at, updated_at
         from ops_concierge_queue_state order by updated_at desc limit $1`,
    status ? [status, limit] : [limit]
  );
  return rows;
}

export async function getConciergeMetrics() {
  if (!(await ensureTables())) {
    return { queued: 0, assigned: 0, inProgress: 0, completed: 0, escalated: 0 };
  }
  const { rows } = await query(
    `select status, count(*)::int as count
     from ops_concierge_queue_state
     group by status`
  );
  const metrics = { queued: 0, assigned: 0, inProgress: 0, completed: 0, escalated: 0 };
  for (const row of rows) {
    if (row.status === "in_progress") metrics.inProgress = row.count;
    else if (metrics[row.status] != null) metrics[row.status] = row.count;
  }
  return metrics;
}

/** Hook for future AI concierge integration. */
export async function recordConciergeAiHook(input = {}) {
  if (!(await ensureTables())) return { ok: false, skipped: true };
  const queueId = String(input.queueId || "");
  if (!queueId) return { ok: false, error: "missing_queue" };

  await query(
    `update ops_concierge_queue_state
     set metadata = metadata || $2::jsonb, updated_at = now()
     where queue_id = $1`,
    [queueId, JSON.stringify({ aiHook: input.hookType || "recommendation", ...input.payload })]
  );
  return { ok: true, queueId };
}
