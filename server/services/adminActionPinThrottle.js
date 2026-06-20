import { createHash } from "node:crypto";
import { isDatabaseReady, query } from "../db.js";
import { rateLimitIp } from "./rateLimit.js";
import { ensurePinAuthAttemptsTable } from "./pinAuthThrottle.js";

const ACTION = "admin_action_pin";
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export const ADMIN_ACTION_PIN_MAX_ATTEMPTS = MAX_ATTEMPTS;
export const ADMIN_ACTION_PIN_WINDOW_MS = WINDOW_MS;
export const ADMIN_ACTION_PIN_LOCK_MS = LOCK_MS;
export const INVALID_ADMIN_ACTION_PIN_MESSAGE = "Invalid action PIN.";
export const ADMIN_ACTION_PIN_LOCKED_MESSAGE = "Too many attempts. Please try again later.";

function hashUserAgent(userAgent = "") {
  const value = String(userAgent || "").trim();
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function throttleKeyFromRequest(req) {
  const ip = rateLimitIp(req);
  const userAgent = String(req?.headers?.["user-agent"] || "").trim();
  return { ip, userAgentHash: hashUserAgent(userAgent) };
}

async function loadAttemptRow({ identifier, ip, userAgentHash }) {
  if (!isDatabaseReady()) return null;
  await ensurePinAuthAttemptsTable();
  const result = await query(
    `select *
     from pin_auth_attempts
     where action = $1
       and identifier = $2
       and coalesce(ip, '') = coalesce($3, '')
       and coalesce(user_agent_hash, '') = coalesce($4, '')
     limit 1`,
    [ACTION, identifier, ip || null, userAgentHash || null]
  );
  return result.rows[0] || null;
}

async function upsertAttemptRow({ identifier, ip, userAgentHash, success }) {
  if (!isDatabaseReady()) {
    return { ok: true, attempts: 0, locked: false, lockedUntil: null };
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const windowStartIso = new Date(now.getTime() - WINDOW_MS).toISOString();

  await ensurePinAuthAttemptsTable();
  const row = await loadAttemptRow({ identifier, ip, userAgentHash });

  if (success) {
    if (row?.id) {
      await query("delete from pin_auth_attempts where id = $1", [row.id]);
    }
    return { ok: true, attempts: 0, locked: false, lockedUntil: null };
  }

  if (row?.locked_until && new Date(row.locked_until).getTime() > now.getTime()) {
    return {
      ok: false,
      attempts: row.attempt_count || 0,
      locked: true,
      lockedUntil: row.locked_until
    };
  }

  let attempts = row ? Number(row.attempt_count || 0) : 0;
  let firstAttemptAt = row?.first_attempt_at ? new Date(row.first_attempt_at).toISOString() : nowIso;

  if (!row || new Date(firstAttemptAt).getTime() < new Date(windowStartIso).getTime()) {
    attempts = 0;
    firstAttemptAt = nowIso;
  }

  attempts += 1;
  const lockedUntil = null;

  if (row?.id) {
    await query(
      `update pin_auth_attempts
       set attempt_count = $2,
           first_attempt_at = $3,
           last_attempt_at = $4,
           locked_until = $5
       where id = $1`,
      [row.id, attempts, firstAttemptAt, nowIso, lockedUntil]
    );
  } else {
    await query(
      `insert into pin_auth_attempts (
         action, identifier, ip, user_agent_hash,
         attempt_count, first_attempt_at, last_attempt_at, locked_until
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [ACTION, identifier, ip || null, userAgentHash || null, attempts, firstAttemptAt, nowIso, lockedUntil]
    );
  }

  return { ok: true, attempts, locked: false, lockedUntil: null };
}

export async function checkAdminActionPinThrottle(req, adminEmail) {
  const identifier = String(adminEmail || "").trim().toLowerCase();
  if (!identifier) {
    return { ok: true, locked: false, lockedUntil: null };
  }
  if (!isDatabaseReady()) {
    return { ok: true, locked: false, lockedUntil: null };
  }

  await ensurePinAuthAttemptsTable();
  const { ip, userAgentHash } = throttleKeyFromRequest(req);
  const row = await loadAttemptRow({ identifier, ip, userAgentHash });

  if (row?.locked_until) {
    const lockedUntilMs = new Date(row.locked_until).getTime();
    if (lockedUntilMs > Date.now()) {
      return { ok: false, locked: true, lockedUntil: row.locked_until };
    }
  }

  if (row && Number(row.attempt_count || 0) >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCK_MS).toISOString();
    await query(
      `update pin_auth_attempts
       set locked_until = $2,
           last_attempt_at = now()
       where id = $1`,
      [row.id, lockedUntil]
    );
    return { ok: false, locked: true, lockedUntil };
  }

  return { ok: true, locked: false, lockedUntil: null };
}

export async function recordAdminActionPinFailure(req, adminEmail) {
  const identifier = String(adminEmail || "").trim().toLowerCase();
  const { ip, userAgentHash } = throttleKeyFromRequest(req);
  return upsertAttemptRow({ identifier, ip, userAgentHash, success: false });
}

export async function recordAdminActionPinSuccess(adminEmail) {
  const identifier = String(adminEmail || "").trim().toLowerCase();
  if (!identifier || !isDatabaseReady()) {
    return { ok: true, attempts: 0, locked: false, lockedUntil: null };
  }
  await ensurePinAuthAttemptsTable();
  await query(`delete from pin_auth_attempts where action = $1 and identifier = $2`, [
    ACTION,
    identifier
  ]);
  return { ok: true, attempts: 0, locked: false, lockedUntil: null };
}
