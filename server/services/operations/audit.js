import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

const AUDIT_TABLE = "ops_immutable_audit_log";

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(AUDIT_TABLE);
    return true;
  } catch {
    return false;
  }
}

/**
 * Append-only immutable audit record. Never updates or deletes.
 */
export async function writeImmutableAudit(input = {}) {
  const action = String(input.action || "").trim();
  const entityType = String(input.entityType || "").trim();
  const entityId = String(input.entityId || "").trim();
  const actor = String(input.actor || "system");
  if (!action || !entityType || !entityId) return { ok: false, error: "missing_fields" };
  if (!(await ensureTable())) return { ok: false, skipped: true };

  const auditId = String(input.auditId || crypto.randomUUID());

  await query(
    `insert into ops_immutable_audit_log (
       audit_id, actor, actor_role, action, entity_type, entity_id,
       old_value, new_value, reason, correlation_id, ip, device
     ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11,$12)
     on conflict (audit_id) do nothing`,
    [
      auditId,
      actor,
      String(input.actorRole || "system"),
      action,
      entityType,
      entityId,
      input.oldValue != null ? JSON.stringify(input.oldValue) : null,
      input.newValue != null ? JSON.stringify(input.newValue) : null,
      String(input.reason || "").slice(0, 500),
      input.correlationId || null,
      input.ip || null,
      input.device || null
    ]
  );

  const { incrementOperationsMetric } = await import("./observability.js");
  incrementOperationsMetric("auditRecords", 1);

  return { ok: true, auditId };
}

export async function listImmutableAudit(options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 500);
  const params = [limit];
  const clauses = [];

  if (options.entityType) {
    params.unshift(options.entityType);
    clauses.push(`entity_type = $${clauses.length + 1}`);
  }
  if (options.entityId) {
    params.unshift(options.entityId);
    clauses.push(`entity_id = $${clauses.length + 1}`);
  }
  if (options.actor) {
    params.unshift(String(options.actor).toLowerCase());
    clauses.push(`lower(actor) = $${clauses.length + 1}`);
  }
  if (options.action) {
    params.unshift(options.action);
    clauses.push(`action = $${clauses.length + 1}`);
  }

  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  params.push(limit);

  const { rows } = await query(
    `select audit_id, actor, actor_role, action, entity_type, entity_id, reason, correlation_id, occurred_at
     from ops_immutable_audit_log
     ${where}
     order by occurred_at desc
     limit $${params.length}`,
    params
  );
  return rows;
}

export async function getAuditByCorrelationId(correlationId) {
  if (!(await ensureTable()) || !correlationId) return [];
  const { rows } = await query(
    `select audit_id, actor, action, entity_type, entity_id, old_value, new_value, reason, occurred_at
     from ops_immutable_audit_log
     where correlation_id = $1
     order by occurred_at asc`,
    [correlationId]
  );
  return rows;
}
