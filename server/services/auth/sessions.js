import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { recordAuthSecurityEvent } from "./securityEvents.js";
import { parseAuthRequestContext } from "./requestContext.js";

const TABLE = "member_auth_sessions";
const DEFAULT_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Server-side session view — independent of Supabase JWT lifecycle. */
export const SERVER_SESSION_STATUSES = Object.freeze([
  "active",
  "revoked",
  "expired",
  "compromised",
  "admin_revoked",
  "device_removed"
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

function hashToken(value = "") {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function deriveSessionId(session = {}) {
  const refresh = String(session?.refresh_token || "").trim();
  if (refresh) return hashToken(refresh).slice(0, 32);
  const access = String(session?.access_token || "").trim();
  if (access) return hashToken(access).slice(0, 32);
  return crypto.randomUUID().replace(/-/g, "").slice(0, 32);
}

export function resolveServerSessionStatus(reason = "", actor = "member") {
  const text = String(reason || "").toLowerCase();
  if (text.includes("compromised")) return "compromised";
  if (text.includes("device")) return "device_removed";
  if (text.includes("expired")) return "expired";
  if (actor === "admin" || text.includes("admin") || text.includes("operator")) {
    return "admin_revoked";
  }
  return "revoked";
}

function coarseStatusFromServer(serverSessionStatus) {
  if (serverSessionStatus === "active") return "active";
  if (serverSessionStatus === "expired") return "expired";
  return "revoked";
}

/**
 * Register or refresh session metadata after successful login.
 */
export async function registerAuthSession(req, input = {}) {
  if (!(await ensureTable())) return { ok: false, skipped: true };

  const ctx = parseAuthRequestContext(req, input);
  const session = input.session && typeof input.session === "object" ? input.session : {};
  const sessionId = input.sessionId || deriveSessionId(session);
  const expiresAt = session.expires_at
    ? new Date(Number(session.expires_at) * 1000).toISOString()
    : new Date(Date.now() + DEFAULT_SESSION_TTL_MS).toISOString();

  try {
    await query(
      `insert into member_auth_sessions (
         session_id, auth_user_id, profile_id, device_id, device_name,
         platform, browser, ip, approximate_location, refresh_token_hash,
         status, server_session_status, last_activity_at, expires_at
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active','active',now(),$11)
       on conflict (session_id) do update set
         last_activity_at = now(),
         status = 'active',
         server_session_status = 'active',
         revoked_at = null,
         revocation_reason = null,
         device_id = coalesce(excluded.device_id, member_auth_sessions.device_id),
         updated_at = now()`,
      [
        sessionId,
        input.authUserId,
        input.profileId || null,
        ctx.deviceId,
        ctx.deviceName,
        ctx.platform,
        ctx.browser,
        ctx.ip,
        ctx.approximateLocation,
        session.refresh_token ? hashToken(session.refresh_token) : null,
        expiresAt
      ]
    );

    await recordAuthSecurityEvent({
      eventType: "login",
      authUserId: input.authUserId,
      profileId: input.profileId || null,
      sessionId,
      deviceId: ctx.deviceId,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      userKey: input.userKey || null,
      summary: "Session registered",
      metadata: { platform: ctx.platform, browser: ctx.browser }
    });

    return { ok: true, sessionId };
  } catch (error) {
    console.warn("[auth:sessions] register failed", error?.message || error);
    return { ok: false, error: error?.message || "register_failed" };
  }
}

export async function touchAuthSession(sessionId) {
  if (!(await ensureTable()) || !sessionId) return { ok: false };
  await query(
    `update member_auth_sessions
     set last_activity_at = now(), updated_at = now()
     where session_id = $1 and server_session_status = 'active'`,
    [sessionId]
  );
  return { ok: true };
}

export async function listAuthSessions(authUserId, options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
  const filterStatus = options.serverSessionStatus || options.status || null;
  const { rows } = await query(
    `select session_id, device_id, device_name, platform, browser, ip,
            approximate_location, status, server_session_status,
            last_activity_at, expires_at, created_at
     from member_auth_sessions
     where auth_user_id = $1
       and ($2::text is null or server_session_status = $2)
     order by last_activity_at desc
     limit $3`,
    [authUserId, filterStatus, limit]
  );
  return rows;
}

export async function revokeAuthSession(sessionId, reason = "member_revoked", actor = "member") {
  if (!(await ensureTable()) || !sessionId) return { ok: false };

  const serverSessionStatus = resolveServerSessionStatus(reason, actor);
  const status = coarseStatusFromServer(serverSessionStatus);

  const result = await query(
    `update member_auth_sessions
     set status = $3,
         server_session_status = $4,
         revoked_at = now(),
         revocation_reason = $2,
         updated_at = now()
     where session_id = $1 and server_session_status = 'active'
     returning auth_user_id, profile_id, device_id`,
    [sessionId, reason, status, serverSessionStatus]
  );

  const row = result.rows[0];
  if (row) {
    await recordAuthSecurityEvent({
      eventType: "session_revoked",
      authUserId: row.auth_user_id,
      profileId: row.profile_id,
      sessionId,
      deviceId: row.device_id,
      summary: `Session revoked by ${actor}`,
      metadata: { reason, serverSessionStatus }
    });
  }

  return { ok: Boolean(row), revoked: Boolean(row), serverSessionStatus };
}

export async function revokeAllAuthSessions(authUserId, exceptSessionId = null, reason = "logout_all", actor = "member") {
  if (!(await ensureTable()) || !authUserId) return { ok: false, revoked: 0 };

  const serverSessionStatus = resolveServerSessionStatus(reason, actor);
  const status = coarseStatusFromServer(serverSessionStatus);

  const result = await query(
    `update member_auth_sessions
     set status = $4,
         server_session_status = $5,
         revoked_at = now(),
         revocation_reason = $3,
         updated_at = now()
     where auth_user_id = $1
       and server_session_status = 'active'
       and ($2::text is null or session_id <> $2)
     returning session_id, profile_id, device_id`,
    [authUserId, exceptSessionId, reason, status, serverSessionStatus]
  );

  for (const row of result.rows) {
    await recordAuthSecurityEvent({
      eventType: "session_revoked",
      authUserId,
      profileId: row.profile_id,
      sessionId: row.session_id,
      deviceId: row.device_id,
      summary: "Bulk session revocation",
      metadata: { reason, serverSessionStatus }
    });
  }

  return { ok: true, revoked: result.rows.length, serverSessionStatus };
}

export async function markSessionCompromised(sessionId, reason = "compromised") {
  return revokeAuthSession(sessionId, reason, "admin");
}

export async function recordAuthLogout(req, input = {}) {
  const sessionId = input.sessionId || null;
  if (sessionId) {
    await revokeAuthSession(sessionId, "logout", "member");
  }
  await recordAuthSecurityEvent({
    eventType: "logout",
    authUserId: input.authUserId || null,
    profileId: input.profileId || null,
    sessionId,
    deviceId: input.deviceId || null,
    ip: parseAuthRequestContext(req).ip,
    userAgent: parseAuthRequestContext(req).userAgent,
    summary: "Logout"
  });
  return { ok: true };
}

export { deriveSessionId };
