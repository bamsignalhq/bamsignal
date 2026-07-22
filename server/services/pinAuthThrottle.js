import { createHash } from "node:crypto";
import { isDatabaseReady, query } from "../db.js";
import { rateLimitIp } from "./rateLimit.js";
import {
  checkMemoryMemberThrottle,
  clearMemoryMemberThrottleForIdentifier,
  logMemberMemoryThrottleUsed,
  logThrottleDbUnavailable,
  recordMemoryMemberThrottleFailure
} from "./memoryThrottle.js";
import { recordFallbackActivation } from "./infrastructureObservability.js";
import { assertSchemaTable } from "./schemaVerification.js";
import {
  PIN_AUTH_ATTEMPTS_RETENTION_MS,
  batchDeleteOlderThan,
  batchDeletePlan
} from "./retentionBatchDelete.js";

export { PIN_AUTH_ATTEMPTS_RETENTION_MS };

function parseEnvMs(name, fallback) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseEnvInt(name, fallback) {
  const parsed = Number.parseInt(String(process.env[name] ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const WINDOW_MS = parseEnvMs("PIN_AUTH_WINDOW_MS", 15 * 60 * 1000);
const LOCK_MS = parseEnvMs("PIN_AUTH_LOCK_MS", 15 * 60 * 1000);
const MAX_ATTEMPTS = parseEnvInt("PIN_AUTH_MAX_ATTEMPTS", 5);

export async function ensurePinAuthAttemptsTable() {
  if (!isDatabaseReady()) return;
  await assertSchemaTable("pin_auth_attempts");
}

export async function prunePinAuthThrottleEvents(options = {}) {
  if (!isDatabaseReady()) {
    return { deleted: 0, skipped: true };
  }

  await ensurePinAuthAttemptsTable();
  const plan = batchDeletePlan({
    table: "pin_auth_attempts",
    column: "last_attempt_at",
    retentionMs: PIN_AUTH_ATTEMPTS_RETENTION_MS,
    batchSize: options.batchSize,
    maxBatches: options.maxBatches,
    nowMs: options.nowMs
  });

  return batchDeleteOlderThan(plan);
}

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

function memoryThrottleConfig() {
  return {
    windowMs: WINDOW_MS,
    lockMs: LOCK_MS,
    maxAttempts: MAX_ATTEMPTS
  };
}

function useMemberMemoryFallback(action) {
  if (isDatabaseReady()) return false;
  logThrottleDbUnavailable(action, "member");
  logMemberMemoryThrottleUsed(action);
  recordFallbackActivation("pin_auth_memory", { action });
  return true;
}

async function loadAttemptRow({ action, identifier, ip, userAgentHash }) {
  if (!isDatabaseReady()) {
    return null;
  }

  await ensurePinAuthAttemptsTable();

  const result = await query(
    `select *
     from pin_auth_attempts
     where action = $1
       and identifier = $2
       and coalesce(ip, '') = coalesce($3, '')
       and coalesce(user_agent_hash, '') = coalesce($4, '')
     limit 1`,
    [action, identifier, ip || null, userAgentHash || null]
  );
  return result.rows[0] || null;
}

async function upsertAttemptRow({ action, identifier, ip, userAgentHash, success }) {
  if (useMemberMemoryFallback(action)) {
    if (success) {
      clearMemoryMemberThrottleForIdentifier(action, identifier);
      return { ok: true, attempts: 0, locked: false, lockedUntil: null };
    }
    return recordMemoryMemberThrottleFailure({
      action,
      identifier,
      ip,
      userAgentHash,
      ...memoryThrottleConfig()
    });
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const windowStartIso = new Date(now.getTime() - WINDOW_MS).toISOString();

  await ensurePinAuthAttemptsTable();

  const row = await loadAttemptRow({ action, identifier, ip, userAgentHash });

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

  const locked = attempts >= MAX_ATTEMPTS;
  const lockedUntil = locked ? new Date(now.getTime() + LOCK_MS).toISOString() : null;

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
      `insert into pin_auth_attempts (action, identifier, ip, user_agent_hash, attempt_count, first_attempt_at, last_attempt_at, locked_until)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [action, identifier, ip || null, userAgentHash || null, attempts, firstAttemptAt, nowIso, lockedUntil]
    );
  }

  return { ok: !locked, attempts, locked, lockedUntil };
}

async function checkThrottleGeneric({ action, identifier, req }) {
  if (!identifier) {
    return { ok: true, locked: false, lockedUntil: null };
  }

  const { ip, userAgentHash } = throttleKeyFromRequest(req);

  if (useMemberMemoryFallback(action)) {
    return checkMemoryMemberThrottle({
      action,
      identifier,
      ip,
      userAgentHash,
      ...memoryThrottleConfig()
    });
  }

  await ensurePinAuthAttemptsTable();
  const row = await loadAttemptRow({ action, identifier, ip, userAgentHash });

  if (!row?.locked_until) {
    return { ok: true, locked: false, lockedUntil: null };
  }

  const now = Date.now();
  const lockedUntilMs = new Date(row.locked_until).getTime();
  if (lockedUntilMs <= now) {
    return { ok: true, locked: false, lockedUntil: null };
  }

  return { ok: false, locked: true, lockedUntil: row.locked_until };
}

export async function checkPinLoginThrottle(req, username) {
  const identifier = String(username || "").trim().toLowerCase();
  return checkThrottleGeneric({ action: "pin_login", identifier, req });
}

export async function recordPinLoginFailure(req, username) {
  const identifier = String(username || "").trim().toLowerCase();
  const { ip, userAgentHash } = throttleKeyFromRequest(req);
  return upsertAttemptRow({ action: "pin_login", identifier, ip, userAgentHash, success: false });
}

export async function recordPinLoginSuccess(username) {
  const identifier = String(username || "").trim().toLowerCase();
  if (!identifier) return { ok: true, attempts: 0, locked: false, lockedUntil: null };
  if (useMemberMemoryFallback("pin_login")) {
    clearMemoryMemberThrottleForIdentifier("pin_login", identifier);
    return { ok: true, attempts: 0, locked: false, lockedUntil: null };
  }
  await ensurePinAuthAttemptsTable();
  await query(`delete from pin_auth_attempts where action = $1 and identifier = $2`, [
    "pin_login",
    identifier
  ]);
  return { ok: true, attempts: 0, locked: false, lockedUntil: null };
}

export async function checkPinResetThrottle(req, email) {
  const identifier = String(email || "").trim().toLowerCase();
  return checkThrottleGeneric({ action: "pin_reset_complete", identifier, req });
}

export async function recordPinResetFailure(req, email) {
  const identifier = String(email || "").trim().toLowerCase();
  const { ip, userAgentHash } = throttleKeyFromRequest(req);
  return upsertAttemptRow({
    action: "pin_reset_complete",
    identifier,
    ip,
    userAgentHash,
    success: false
  });
}

export async function recordPinResetSuccess(email) {
  const identifier = String(email || "").trim().toLowerCase();
  if (!identifier) return { ok: true, attempts: 0, locked: false, lockedUntil: null };
  if (useMemberMemoryFallback("pin_reset_complete")) {
    clearMemoryMemberThrottleForIdentifier("pin_reset_complete", identifier);
    return { ok: true, attempts: 0, locked: false, lockedUntil: null };
  }
  await ensurePinAuthAttemptsTable();
  await query(`delete from pin_auth_attempts where action = $1 and identifier = $2`, [
    "pin_reset_complete",
    identifier
  ]);
  return { ok: true, attempts: 0, locked: false, lockedUntil: null };
}

export const PIN_AUTH_WINDOW_MS = WINDOW_MS;
export const PIN_AUTH_LOCK_MS = LOCK_MS;
export const PIN_AUTH_MAX_ATTEMPTS = MAX_ATTEMPTS;
