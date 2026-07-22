import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { recordAuthSecurityEvent } from "./securityEvents.js";
import { parseAuthRequestContext } from "./requestContext.js";

const TABLE = "member_auth_devices";

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
 * Register or update device on login. Respects privacy — uses client-supplied device id only.
 */
export async function registerAuthDevice(req, input = {}) {
  if (!(await ensureTable()) || !input.authUserId) return { ok: false, skipped: true };

  const ctx = parseAuthRequestContext(req, input);
  if (!ctx.deviceId) return { ok: false, skipped: true, reason: "no_device_id" };

  try {
    const existing = await query(
      `select id, trusted, revoked, session_count from member_auth_devices
       where device_id = $1 and auth_user_id = $2`,
      [ctx.deviceId, input.authUserId]
    );

    const isNew = !existing.rows[0];
    const sessionCount = (Number(existing.rows[0]?.session_count) || 0) + (input.incrementSession ? 1 : 0);

    await query(
      `insert into member_auth_devices (
         device_id, auth_user_id, profile_id, device_name, platform, browser,
         push_token, trusted, session_count, current_session_id, last_seen_at
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())
       on conflict (device_id, auth_user_id) do update set
         profile_id = coalesce(excluded.profile_id, member_auth_devices.profile_id),
         device_name = coalesce(excluded.device_name, member_auth_devices.device_name),
         platform = coalesce(excluded.platform, member_auth_devices.platform),
         browser = coalesce(excluded.browser, member_auth_devices.browser),
         push_token = coalesce(excluded.push_token, member_auth_devices.push_token),
         session_count = $9,
         current_session_id = coalesce(excluded.current_session_id, member_auth_devices.current_session_id),
         last_seen_at = now(),
         revoked = false,
         revoked_at = null,
         updated_at = now()`,
      [
        ctx.deviceId,
        input.authUserId,
        input.profileId || null,
        ctx.deviceName,
        ctx.platform,
        ctx.browser,
        input.pushToken || null,
        Boolean(input.trusted || existing.rows[0]?.trusted),
        sessionCount,
        input.sessionId || null
      ]
    );

    if (isNew) {
      await recordAuthSecurityEvent({
        eventType: "device_registered",
        authUserId: input.authUserId,
        profileId: input.profileId || null,
        deviceId: ctx.deviceId,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        summary: "Device registered"
      });
    }

    return { ok: true, deviceId: ctx.deviceId, isNew };
  } catch (error) {
    console.warn("[auth:devices] register failed", error?.message || error);
    return { ok: false, error: error?.message || "register_failed" };
  }
}

export async function listAuthDevices(authUserId, options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
  const { rows } = await query(
    `select device_id, device_name, platform, browser, trusted, revoked,
            session_count, current_session_id, first_seen_at, last_seen_at
     from member_auth_devices
     where auth_user_id = $1
       and ($2::boolean is null or revoked = $2)
     order by last_seen_at desc
     limit $3`,
    [authUserId, options.revokedOnly === true ? true : null, limit]
  );
  return rows;
}

export async function revokeAuthDevice(authUserId, deviceId, reason = "member_revoked") {
  if (!(await ensureTable()) || !authUserId || !deviceId) return { ok: false };

  const result = await query(
    `update member_auth_devices
     set revoked = true,
         revoked_at = now(),
         trusted = false,
         updated_at = now()
     where auth_user_id = $1 and device_id = $2 and revoked = false
     returning profile_id`,
    [authUserId, deviceId]
  );

  if (result.rows[0]) {
    try {
      const { query: dbQuery } = await import("../../db.js");
      await dbQuery(
        `update member_auth_sessions
         set status = 'revoked',
             server_session_status = 'device_removed',
             revoked_at = now(),
             revocation_reason = $3,
             updated_at = now()
         where auth_user_id = $1 and device_id = $2 and server_session_status = 'active'`,
        [authUserId, deviceId, reason]
      );
    } catch {
      /* session update must not block device revoke */
    }
    await recordAuthSecurityEvent({
      eventType: "device_removed",
      authUserId,
      profileId: result.rows[0].profile_id,
      deviceId,
      summary: "Device revoked",
      metadata: { reason }
    });
  }

  return { ok: Boolean(result.rows[0]) };
}

export async function setDeviceTrusted(authUserId, deviceId, trusted = true) {
  if (!(await ensureTable())) return { ok: false };
  const result = await query(
    `update member_auth_devices
     set trusted = $3, updated_at = now()
     where auth_user_id = $1 and device_id = $2 and revoked = false
     returning device_id`,
    [authUserId, deviceId, Boolean(trusted)]
  );
  return { ok: Boolean(result.rows[0]) };
}
