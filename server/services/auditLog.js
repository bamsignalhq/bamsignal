import { isDatabaseReady, query } from "../db.js";
import { assertSchemaTable } from "./schemaVerification.js";

export async function ensureAuditLogsSchema() {
  if (!isDatabaseReady()) return;
  await assertSchemaTable("audit_logs");
}

export async function writeAuditLog({
  userId = null,
  targetUserId = null,
  operatorId = null,
  action,
  details = {},
  ip = null,
  userAgent = null
}) {
  if (!isDatabaseReady() || !action) return null;
  await ensureAuditLogsSchema();

  const result = await query(
    `insert into audit_logs (user_id, target_user_id, operator_id, action, details, ip, user_agent)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      userId || null,
      targetUserId || null,
      operatorId ? String(operatorId) : null,
      String(action),
      details && typeof details === "object" ? details : {},
      ip || null,
      userAgent || null
    ]
  );
  return result.rows[0] || null;
}

export async function listAuditLogsForUser(profileId, { limit = 100, asTarget = true } = {}) {
  if (!isDatabaseReady() || !profileId) return [];
  await ensureAuditLogsSchema();

  const cap = Math.min(500, Math.max(1, Number(limit) || 100));
  const result = await query(
    `select id, user_id, target_user_id, operator_id, action, details, ip, user_agent, created_at
     from audit_logs
     where user_id = $1::uuid
        or ($2 and target_user_id = $1::uuid)
     order by created_at desc
     limit $3`,
    [profileId, asTarget, cap]
  );
  return result.rows;
}

export function auditLogCsvRows(rows = []) {
  const header = ["created_at", "action", "user_id", "target_user_id", "operator_id", "ip", "details"];
  const lines = [header.join(",")];
  for (const row of rows) {
    const details = JSON.stringify(row.details || {}).replace(/"/g, '""');
    lines.push(
      [
        row.created_at,
        row.action,
        row.user_id || "",
        row.target_user_id || "",
        row.operator_id || "",
        row.ip || "",
        `"${details}"`
      ].join(",")
    );
  }
  return lines.join("\n");
}
