import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { recordAuthSecurityEvent } from "./securityEvents.js";

const TABLE = "member_account_lifecycle_log";

/** Canonical lifecycle states — Sprint 2. */
export const LIFECYCLE_STATUSES = Object.freeze([
  "pending",
  "email_verification",
  "profile_completion",
  "active",
  "suspended",
  "locked",
  "disabled",
  "deleted",
  "recovered",
  "archived"
]);

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(TABLE);
    return true;
  } catch {
    return false;
  }
}

/**
 * Derive lifecycle status from existing member profile + auth context.
 * Does not mutate account_status — maps existing fields.
 */
export function resolveAccountLifecycleStatus(member = {}, context = {}) {
  const accountStatus = String(member.account_status || "active").toLowerCase();
  const pinLocked = Boolean(context.pinLocked);
  const emailVerified = context.emailVerified !== false;

  if (accountStatus === "deleted") return "archived";
  if (accountStatus === "deleted_pending") return "disabled";
  if (pinLocked) return "locked";
  if (member.shadow_banned) return "suspended";
  if (!member.onboarding_complete) {
    if (context.signupStage === "pending") return "pending";
    if (!emailVerified) return "email_verification";
    return "profile_completion";
  }
  if (accountStatus === "active") return "active";
  return "active";
}

export async function transitionAccountLifecycle(input = {}) {
  const newStatus = String(input.newStatus || "").trim();
  if (!LIFECYCLE_STATUSES.includes(newStatus)) {
    return { ok: false, error: "invalid_status" };
  }
  if (!(await ensureTable())) return { ok: false, skipped: true };

  const previousStatus = String(input.previousStatus || "unknown");
  const logId = String(input.logId || crypto.randomUUID());

  try {
    await query(
      `insert into member_account_lifecycle_log (
         log_id, profile_id, auth_user_id, previous_status, new_status,
         reason_code, reason, actor, actor_role, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
       on conflict (log_id) do nothing`,
      [
        logId,
        input.profileId || null,
        input.authUserId || null,
        previousStatus,
        newStatus,
        String(input.reasonCode || "system"),
        String(input.reason || "").slice(0, 500),
        String(input.actor || "system"),
        ["member", "admin", "system"].includes(input.actorRole) ? input.actorRole : "system",
        JSON.stringify(input.metadata && typeof input.metadata === "object" ? input.metadata : {})
      ]
    );

    const securityType = lifecycleToSecurityEvent(newStatus, previousStatus);
    if (securityType) {
      await recordAuthSecurityEvent({
        eventType: securityType,
        authUserId: input.authUserId || null,
        profileId: input.profileId || null,
        reasonCode: input.reasonCode || null,
        summary: `${previousStatus} → ${newStatus}`,
        metadata: { logId, reason: input.reason || "" }
      });
    }

    if (input.profileId) {
      const trustEvent =
        newStatus === "profile_completion" || newStatus === "active"
          ? "profile_completed"
          : newStatus === "email_verification"
            ? "email_verified"
            : null;
      if (trustEvent) {
        void import("../passportIntegration/index.js")
          .then(({ handlePlatformTrustEvent }) =>
            handlePlatformTrustEvent({
              memberId: input.profileId,
              sourceSystem: "authentication",
              eventType: trustEvent,
              correlationId: `lifecycle:${logId}`
            })
          )
          .catch(() => {});
      }
    }

    return { ok: true, logId, previousStatus, newStatus };
  } catch (error) {
    console.warn("[auth:lifecycle] transition failed", error?.message || error);
    return { ok: false, error: error?.message || "transition_failed" };
  }
}

function lifecycleToSecurityEvent(newStatus, previousStatus) {
  if (newStatus === "locked") return "account_locked";
  if (newStatus === "suspended") return "account_suspended";
  if (newStatus === "disabled" && previousStatus !== "disabled") return "account_deleted";
  if (newStatus === "recovered") return "account_restored";
  if (newStatus === "archived" || newStatus === "deleted") return "account_deleted";
  return null;
}

export async function recordLifecycleFromMember(member = {}, context = {}, transition = {}) {
  const previousStatus = resolveAccountLifecycleStatus(member, context.previous || {});
  const newStatus = transition.newStatus || resolveAccountLifecycleStatus(member, context.current || {});
  if (previousStatus === newStatus && !transition.force) {
    return { ok: true, unchanged: true, status: newStatus };
  }
  return transitionAccountLifecycle({
    profileId: member.id || transition.profileId || null,
    authUserId: transition.authUserId || member.auth_user_id || null,
    previousStatus,
    newStatus,
    reasonCode: transition.reasonCode || "system",
    reason: transition.reason || "",
    actor: transition.actor || "system",
    actorRole: transition.actorRole || "system",
    metadata: transition.metadata || {}
  });
}

export async function listLifecycleTransitions(profileId, options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select log_id, previous_status, new_status, reason_code, reason, actor, actor_role, occurred_at
     from member_account_lifecycle_log
     where profile_id = $1
     order by occurred_at desc
     limit $2`,
    [profileId, limit]
  );
  return rows;
}
