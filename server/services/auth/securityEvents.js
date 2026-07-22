import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

const TABLE = "member_auth_security_events";

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
 * Append-only authentication security event.
 * Never throws — audit must not break auth flows.
 */
export async function recordAuthSecurityEvent(input = {}) {
  if (!(await ensureTable())) return { ok: false, skipped: true };

  const eventId = String(input.eventId || crypto.randomUUID());
  const eventType = String(input.eventType || "unknown").trim();
  if (!eventType) return { ok: false, skipped: true };

  try {
    await query(
      `insert into member_auth_security_events (
         event_id, event_type, auth_user_id, profile_id, user_key,
         session_id, device_id, ip, user_agent, reason_code, summary, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
       on conflict (event_id) do nothing`,
      [
        eventId,
        eventType,
        input.authUserId || null,
        input.profileId || null,
        input.userKey || null,
        input.sessionId || null,
        input.deviceId || null,
        input.ip || null,
        input.userAgent || null,
        input.reasonCode || null,
        String(input.summary || "").slice(0, 500),
        JSON.stringify(input.metadata && typeof input.metadata === "object" ? input.metadata : {})
      ]
    );
    return { ok: true, eventId };
  } catch (error) {
    console.warn("[auth:security-event] write failed", error?.message || error);
    return { ok: false, error: error?.message || "write_failed" };
  }
}

export async function listAuthSecurityEventsForProfile(profileId, options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select event_id, event_type, session_id, device_id, reason_code, summary, occurred_at
     from member_auth_security_events
     where profile_id = $1
     order by occurred_at desc
     limit $2`,
    [profileId, limit]
  );
  return rows;
}
