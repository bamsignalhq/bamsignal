import { isDatabaseReady, query } from "../db.js";

export async function ensureAuditTrailSchema() {
  if (!isDatabaseReady()) return;

  await query(`
    create table if not exists platform_audit_log (
      id uuid primary key default gen_random_uuid(),
      action text not null,
      target_user_id uuid,
      target_user_key text,
      operator_id text,
      operator_email text,
      details jsonb not null default '{}'::jsonb,
      ip text,
      created_at timestamptz not null default now()
    )
  `);
  await query(
    "create index if not exists platform_audit_action_idx on platform_audit_log (action, created_at desc)"
  );
  await query(
    "create index if not exists platform_audit_operator_idx on platform_audit_log (operator_email, created_at desc)"
  );
  await query(
    "create index if not exists platform_audit_target_idx on platform_audit_log (target_user_key, created_at desc)"
  );
}

export async function writePlatformAudit({
  action,
  targetUserId = null,
  targetUserKey = null,
  operatorId = null,
  operatorEmail = null,
  details = {},
  ip = null,
  userAgent = null
}) {
  if (!isDatabaseReady() || !action) return null;
  await ensureAuditTrailSchema();
  const result = await query(
    `insert into platform_audit_log (
       action, target_user_id, target_user_key, operator_id, operator_email, details, ip
     ) values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      String(action),
      targetUserId || null,
      targetUserKey || null,
      operatorId ? String(operatorId) : null,
      operatorEmail ? String(operatorEmail).toLowerCase() : null,
      details && typeof details === "object" ? details : {},
      ip || null
    ]
  );

  const { writeAuditLog } = await import("./auditLog.js");
  await writeAuditLog({
    targetUserId: targetUserId || null,
    operatorId: operatorEmail || operatorId || null,
    action: String(action),
    details: {
      ...(details && typeof details === "object" ? details : {}),
      ...(targetUserKey ? { targetUserKey } : {})
    },
    ip,
    userAgent
  });

  return result.rows[0] || null;
}

export async function listPlatformAudit({
  limit = 100,
  action = null,
  operatorEmail = null,
  targetUserKey = null,
  since = null
} = {}) {
  if (!isDatabaseReady()) return [];
  await ensureAuditTrailSchema();

  const clauses = [];
  const params = [];
  if (action) {
    params.push(String(action));
    clauses.push(`action = $${params.length}`);
  }
  if (operatorEmail) {
    params.push(String(operatorEmail).toLowerCase());
    clauses.push(`lower(operator_email) = $${params.length}`);
  }
  if (targetUserKey) {
    params.push(String(targetUserKey));
    clauses.push(`target_user_key = $${params.length}`);
  }
  if (since) {
    params.push(since);
    clauses.push(`created_at >= $${params.length}`);
  }

  params.push(Math.min(500, Math.max(1, limit)));
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";

  const result = await query(
    `select * from platform_audit_log
     ${where}
     order by created_at desc
     limit $${params.length}`,
    params
  );
  return result.rows;
}

export function auditCsvRows(rows = []) {
  const header = ["created_at", "action", "operator_email", "target_user_key", "ip", "details"];
  const lines = [header.join(",")];
  for (const row of rows) {
    const details = JSON.stringify(row.details || {}).replace(/"/g, '""');
    lines.push(
      [
        row.created_at,
        row.action,
        row.operator_email || "",
        row.target_user_key || "",
        row.ip || "",
        `"${details}"`
      ].join(",")
    );
  }
  return lines.join("\n");
}
