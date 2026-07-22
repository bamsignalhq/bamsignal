import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

export const ADMIN_ROLES = Object.freeze([
  "super_admin",
  "platform_administrator",
  "operations_administrator",
  "moderator",
  "concierge_agent",
  "support_agent",
  "finance_administrator",
  "trust_administrator",
  "read_only_auditor"
]);

/** Permission slugs per operational role. */
export const ROLE_PERMISSIONS = Object.freeze({
  super_admin: [
    "admin.login",
    "admin.roles.manage",
    "moderation.full",
    "support.full",
    "concierge.full",
    "finance.full",
    "trust.full",
    "feature_flags.manage",
    "audit.read",
    "user_safety.full",
    "dashboard.read"
  ],
  platform_administrator: [
    "admin.login",
    "moderation.assign",
    "support.assign",
    "concierge.assign",
    "feature_flags.read",
    "audit.read",
    "user_safety.review",
    "dashboard.read"
  ],
  operations_administrator: [
    "admin.login",
    "moderation.triage",
    "support.manage",
    "concierge.manage",
    "feature_flags.read",
    "audit.read",
    "dashboard.read"
  ],
  moderator: [
    "admin.login",
    "moderation.investigate",
    "moderation.action",
    "user_safety.suspend",
    "user_safety.shadow_ban",
    "audit.read"
  ],
  concierge_agent: [
    "admin.login",
    "concierge.assign",
    "concierge.review",
    "concierge.complete"
  ],
  support_agent: [
    "admin.login",
    "support.respond",
    "support.assign",
    "support.resolve"
  ],
  finance_administrator: [
    "admin.login",
    "finance.manage",
    "finance.refund",
    "audit.read",
    "dashboard.read"
  ],
  trust_administrator: [
    "admin.login",
    "trust.review",
    "user_safety.verification_override",
    "audit.read"
  ],
  read_only_auditor: ["admin.login", "audit.read", "dashboard.read"]
});

/** Roles that may approve escalations. */
export const ESCALATION_AUTHORITY = Object.freeze({
  super_admin: ["moderation", "support", "concierge", "finance", "trust"],
  platform_administrator: ["moderation", "support", "concierge"],
  operations_administrator: ["support", "concierge"],
  finance_administrator: ["finance"],
  trust_administrator: ["trust"]
});

/** Roles that may approve irreversible actions. */
export const APPROVAL_AUTHORITY = Object.freeze({
  super_admin: ["permanent_lock", "verification_override", "refund"],
  platform_administrator: ["permanent_lock"],
  finance_administrator: ["refund"],
  trust_administrator: ["verification_override"]
});

const ASSIGNMENTS_TABLE = "ops_admin_role_assignments";
const AUDIT_TABLE = "ops_admin_role_audit_log";

async function ensureTables() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(ASSIGNMENTS_TABLE);
    await assertSchemaTable(AUDIT_TABLE);
    return true;
  } catch {
    return false;
  }
}

export function permissionsForRole(roleSlug) {
  return ROLE_PERMISSIONS[roleSlug] || [];
}

export function hasPermission(roles, permission) {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some((role) => permissionsForRole(role).includes(permission));
}

export function canEscalate(roles, domain) {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some((role) => (ESCALATION_AUTHORITY[role] || []).includes(domain));
}

export function canApprove(roles, action) {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some((role) => (APPROVAL_AUTHORITY[role] || []).includes(action));
}

export async function listActiveRoles(operatorEmail) {
  if (!(await ensureTables())) return [];
  const email = String(operatorEmail || "").toLowerCase();
  const { rows } = await query(
    `select role_slug, assigned_by, assigned_at
     from ops_admin_role_assignments
     where lower(operator_email) = $1 and revoked_at is null
     order by assigned_at desc`,
    [email]
  );
  return rows.map((row) => row.role_slug);
}

export async function assignAdminRole(input = {}) {
  const roleSlug = String(input.roleSlug || "").trim();
  const operatorEmail = String(input.operatorEmail || "").toLowerCase();
  if (!ADMIN_ROLES.includes(roleSlug)) return { ok: false, error: "invalid_role" };
  if (!operatorEmail) return { ok: false, error: "missing_email" };
  if (!(await ensureTables())) return { ok: false, skipped: true };

  const actor = String(input.actor || "system");
  const reason = String(input.reason || "Role assigned").slice(0, 500);
  const previousPermissions = permissionsForRole(roleSlug);

  await query(
    `insert into ops_admin_role_assignments (operator_email, role_slug, assigned_by, metadata)
     values ($1, $2, $3, $4::jsonb)
     on conflict (operator_email, role_slug)
     do update set revoked_at = null, assigned_by = excluded.assigned_by, assigned_at = now()`,
    [operatorEmail, roleSlug, actor, JSON.stringify(input.metadata || {})]
  );

  const logId = String(input.logId || crypto.randomUUID());
  await query(
    `insert into ops_admin_role_audit_log (
       log_id, operator_email, role_slug, action, previous_permissions, new_permissions, reason, actor, actor_role
     ) values ($1,$2,$3,'assigned','[]'::jsonb,$4::jsonb,$5,$6,$7)
     on conflict (log_id) do nothing`,
    [
      logId,
      operatorEmail,
      roleSlug,
      JSON.stringify(previousPermissions),
      reason,
      actor,
      String(input.actorRole || "system")
    ]
  );

  const { writeImmutableAudit } = await import("./audit.js");
  await writeImmutableAudit({
    actor,
    actorRole: input.actorRole || "system",
    action: "admin.role.assigned",
    entityType: "admin_role",
    entityId: `${operatorEmail}:${roleSlug}`,
    newValue: { roleSlug, operatorEmail },
    reason
  });

  return { ok: true, operatorEmail, roleSlug };
}

export async function revokeAdminRole(input = {}) {
  const roleSlug = String(input.roleSlug || "").trim();
  const operatorEmail = String(input.operatorEmail || "").toLowerCase();
  if (!ADMIN_ROLES.includes(roleSlug)) return { ok: false, error: "invalid_role" };
  if (!(await ensureTables())) return { ok: false, skipped: true };

  const actor = String(input.actor || "system");
  const reason = String(input.reason || "Role revoked").slice(0, 500);

  await query(
    `update ops_admin_role_assignments
     set revoked_at = now()
     where lower(operator_email) = $1 and role_slug = $2 and revoked_at is null`,
    [operatorEmail, roleSlug]
  );

  const logId = String(input.logId || crypto.randomUUID());
  await query(
    `insert into ops_admin_role_audit_log (
       log_id, operator_email, role_slug, action, previous_permissions, new_permissions, reason, actor, actor_role
     ) values ($1,$2,$3,'revoked',$4::jsonb,'[]'::jsonb,$5,$6,$7)
     on conflict (log_id) do nothing`,
    [
      logId,
      operatorEmail,
      roleSlug,
      JSON.stringify(permissionsForRole(roleSlug)),
      reason,
      actor,
      String(input.actorRole || "system")
    ]
  );

  return { ok: true, operatorEmail, roleSlug };
}

export async function resolveOperatorPermissions(operatorEmail) {
  const roles = await listActiveRoles(operatorEmail);
  const permissions = new Set();
  for (const role of roles) {
    for (const permission of permissionsForRole(role)) {
      permissions.add(permission);
    }
  }
  return { roles, permissions: [...permissions] };
}
