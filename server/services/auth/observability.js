import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { recordLifecycleFromMember, resolveAccountLifecycleStatus } from "./lifecycle.js";

const RETENTION_TABLE = "member_account_retention";
const DELETE_GRACE_DAYS = 30;

async function ensureRetentionTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(RETENTION_TABLE);
    return true;
  } catch {
    return false;
  }
}

/** In-memory counters — exposed via operator metrics; DB remains authoritative for audit. */
const counters = {
  signup: 0,
  login: 0,
  verification: 0,
  recovery: 0,
  passwordReset: 0,
  sessionCount: 0,
  failedLogins: 0,
  pinFailures: 0,
  deviceCount: 0,
  deletionRequests: 0,
  recoveryRequests: 0
};

export function incrementAuthMetric(name, amount = 1) {
  if (Object.prototype.hasOwnProperty.call(counters, name)) {
    counters[name] += Math.max(0, Number(amount) || 0);
  }
}

export function getAuthObservabilityMetrics() {
  return {
    ...counters,
    generatedAt: new Date().toISOString()
  };
}

export async function recordAccountDeletionRetention(member = {}, scheduledFor = null) {
  if (!(await ensureRetentionTable()) || !member?.id) return { ok: false, skipped: true };

  const retainUntil =
    scheduledFor ||
    new Date(Date.now() + DELETE_GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await query(
    `insert into member_account_retention (profile_id, retention_class, retain_until, policy_label, metadata)
     values ($1, 'grace_period', $2, 'default', $3::jsonb)
     on conflict (profile_id) do update set
       retention_class = 'grace_period',
       retain_until = excluded.retain_until,
       updated_at = now()`,
    [
      member.id,
      retainUntil,
      JSON.stringify({ scheduledAt: new Date().toISOString() })
    ]
  );

  incrementAuthMetric("deletionRequests");
  await recordLifecycleFromMember(member, {}, {
    newStatus: "disabled",
    reasonCode: "member_soft_delete",
    reason: "Account scheduled for deletion",
    actorRole: "member"
  });

  return { ok: true, retainUntil };
}

export async function recordAccountRestored(member = {}) {
  if (!(await ensureRetentionTable()) || !member?.id) return { ok: false, skipped: true };

  await query(
    `update member_account_retention
     set retention_class = 'soft_deleted',
         retain_until = null,
         updated_at = now()
     where profile_id = $1`,
    [member.id]
  );

  await recordLifecycleFromMember(member, {}, {
    newStatus: "recovered",
    reasonCode: "member_restore",
    reason: "Account restored from deletion grace period",
    actorRole: "member"
  });

  return { ok: true };
}

export async function recordPermanentDeletion(profileId) {
  if (!(await ensureRetentionTable()) || !profileId) return { ok: false };

  await query(
    `update member_account_retention
     set retention_class = 'archived',
         retain_until = null,
         updated_at = now(),
         metadata = metadata || $2::jsonb
     where profile_id = $1`,
    [profileId, JSON.stringify({ permanentlyDeletedAt: new Date().toISOString() })]
  );

  await recordLifecycleFromMember(
    { id: profileId, account_status: "deleted" },
    {},
    {
      newStatus: "archived",
      reasonCode: "grace_expired",
      reason: "Permanent deletion after grace period",
      actorRole: "system"
    }
  );

  return { ok: true };
}

export async function getAccountLifecycleSnapshot(member = {}, context = {}) {
  return {
    status: resolveAccountLifecycleStatus(member, context),
    accountStatus: member.account_status || "active",
    onboardingComplete: Boolean(member.onboarding_complete),
    profileId: member.id || null
  };
}

export { counters as authMetricCounters };
