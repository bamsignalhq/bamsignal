import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

const LOG_TABLE = "ops_user_safety_action_log";

export const SAFETY_ACTION_TYPES = Object.freeze([
  "suspend",
  "unsuspend",
  "shadow_ban",
  "remove_shadow_ban",
  "temporary_lock",
  "permanent_lock",
  "photo_approval",
  "profile_approval",
  "identity_review",
  "trust_review",
  "genotype_review",
  "verification_override"
]);

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(LOG_TABLE);
    return true;
  } catch {
    return false;
  }
}

async function recordSafetyAction(input = {}) {
  if (!(await ensureTable())) return { ok: false, skipped: true };
  const actionType = String(input.actionType || "").trim();
  if (!SAFETY_ACTION_TYPES.includes(actionType)) return { ok: false, error: "invalid_action" };

  const reason = String(input.reason || "").trim();
  if (!reason) return { ok: false, error: "reason_required" };

  const logId = String(input.logId || crypto.randomUUID());
  const correlationId = input.correlationId || logId;

  await query(
    `insert into ops_user_safety_action_log (
       log_id, action_type, target_profile_id, target_user_key,
       previous_state, new_state, reason, actor, actor_role, correlation_id, metadata
     ) values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9,$10,$11::jsonb)
     on conflict (log_id) do nothing`,
    [
      logId,
      actionType,
      input.targetProfileId || null,
      input.targetUserKey || null,
      JSON.stringify(input.previousState || {}),
      JSON.stringify(input.newState || {}),
      reason.slice(0, 500),
      String(input.actor || "system"),
      String(input.actorRole || "system"),
      correlationId,
      JSON.stringify(input.metadata || {})
    ]
  );

  const { writeImmutableAudit } = await import("./audit.js");
  await writeImmutableAudit({
    actor: input.actor || "system",
    actorRole: input.actorRole || "system",
    action: `user_safety.${actionType}`,
    entityType: "member_profile",
    entityId: String(input.targetProfileId || input.targetUserKey || ""),
    oldValue: input.previousState || null,
    newValue: input.newState || null,
    reason,
    correlationId,
    ip: input.ip || null,
    device: input.device || null
  });

  const { publishAdminEvent } = await import("./eventBus.js");
  const eventType =
    actionType === "suspend"
      ? "user.suspended"
      : actionType === "unsuspend" || actionType === "remove_shadow_ban"
        ? "user.restored"
        : `user_safety.${actionType}`;
  await publishAdminEvent({
    eventType,
    payload: {
      actionType,
      targetProfileId: input.targetProfileId,
      targetUserKey: input.targetUserKey,
      correlationId
    },
    actor: input.actor || "system",
    correlationId,
    idempotencyKey: `safety:${actionType}:${logId}`
  });

  const { incrementOperationsMetric } = await import("./observability.js");
  incrementOperationsMetric("safetyActions", 1);
  incrementOperationsMetric(`safety_${actionType}`, 1);

  return { ok: true, logId, correlationId, actionType };
}

export async function suspendMember(input = {}) {
  if (!input.targetProfileId) return { ok: false, error: "missing_profile" };
  await query(
    `update app_member_profiles
     set account_suspended = true,
         suspension_reason = $2,
         suspended_at = now(),
         suspended_by = $3,
         updated_at = now()
     where id = $1`,
    [
      input.targetProfileId,
      String(input.reason || "Suspended by moderator").slice(0, 500),
      String(input.actor || "system").toLowerCase()
    ]
  ).catch(() => null);

  return recordSafetyAction({
    ...input,
    actionType: "suspend",
    previousState: { suspended: false },
    newState: { suspended: true, reason: input.reason }
  });
}

export async function unsuspendMember(input = {}) {
  if (!input.targetProfileId) return { ok: false, error: "missing_profile" };
  await query(
    `update app_member_profiles
     set account_suspended = false,
         suspension_reason = null,
         suspended_at = null,
         suspended_by = null,
         updated_at = now()
     where id = $1`,
    [input.targetProfileId]
  ).catch(() => null);

  return recordSafetyAction({
    ...input,
    actionType: "unsuspend",
    previousState: { suspended: true },
    newState: { suspended: false }
  });
}

export async function applyShadowBanOperation(input = {}) {
  const { applyShadowBan } = await import("../moderation.js");
  const result = await applyShadowBan({
    profileId: input.targetProfileId,
    operatorEmail: input.actor,
    reason: input.reason,
    moderationNotes: input.moderationNotes
  });
  if (!result.ok) return result;

  await recordSafetyAction({
    ...input,
    actionType: "shadow_ban",
    previousState: { shadowBanned: false },
    newState: { shadowBanned: true }
  });
  return result;
}

export async function removeShadowBanOperation(input = {}) {
  const { liftShadowBan } = await import("../moderation.js");
  const result = await liftShadowBan({
    profileId: input.targetProfileId,
    operatorEmail: input.actor,
    reason: input.reason
  });
  if (!result.ok) return result;

  await recordSafetyAction({
    ...input,
    actionType: "remove_shadow_ban",
    previousState: { shadowBanned: true },
    newState: { shadowBanned: false }
  });
  return result;
}

export async function temporaryLockMember(input = {}) {
  const expiresAt = input.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await query(
    `update app_member_profiles
     set account_locked = true,
         lock_expires_at = $2,
         lock_reason = $3,
         updated_at = now()
     where id = $1`,
    [input.targetProfileId, expiresAt, String(input.reason || "Temporary lock")]
  ).catch(() => null);

  return recordSafetyAction({
    ...input,
    actionType: "temporary_lock",
    previousState: { locked: false },
    newState: { locked: true, expiresAt }
  });
}

export async function permanentLockMember(input = {}) {
  await query(
    `update app_member_profiles
     set account_locked = true,
         lock_expires_at = null,
         lock_reason = $2,
         permanently_locked = true,
         updated_at = now()
     where id = $1`,
    [input.targetProfileId, String(input.reason || "Permanent lock")]
  ).catch(() => null);

  return recordSafetyAction({
    ...input,
    actionType: "permanent_lock",
    previousState: { permanentlyLocked: false },
    newState: { permanentlyLocked: true }
  });
}

export async function approvePhoto(input = {}) {
  return recordSafetyAction({
    ...input,
    actionType: "photo_approval",
    previousState: { photoReviewStatus: input.previousStatus || "pending" },
    newState: { photoReviewStatus: "approved" }
  });
}

export async function approveProfile(input = {}) {
  return recordSafetyAction({
    ...input,
    actionType: "profile_approval",
    previousState: { profileApproved: false },
    newState: { profileApproved: true }
  });
}

export async function reviewIdentity(input = {}) {
  return recordSafetyAction({
    ...input,
    actionType: "identity_review",
    previousState: input.previousState || {},
    newState: input.newState || { reviewed: true }
  });
}

export async function reviewTrust(input = {}) {
  return recordSafetyAction({
    ...input,
    actionType: "trust_review",
    previousState: input.previousState || {},
    newState: input.newState || { reviewed: true }
  });
}

export async function reviewGenotype(input = {}) {
  return recordSafetyAction({
    ...input,
    actionType: "genotype_review",
    previousState: input.previousState || {},
    newState: input.newState || { reviewed: true }
  });
}

export async function overrideVerification(input = {}) {
  return recordSafetyAction({
    ...input,
    actionType: "verification_override",
    previousState: input.previousState || {},
    newState: input.newState || { overridden: true }
  });
}

export async function listSafetyActions(options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 500);
  const params = [limit];
  let clause = "";
  if (options.targetProfileId) {
    params.unshift(options.targetProfileId);
    clause = "where target_profile_id = $1";
  }
  const { rows } = await query(
    `select log_id, action_type, target_profile_id, reason, actor, actor_role, correlation_id, occurred_at
     from ops_user_safety_action_log
     ${clause}
     order by occurred_at desc
     limit $${params.length}`,
    options.targetProfileId ? [options.targetProfileId, limit] : [limit]
  );
  return rows;
}
