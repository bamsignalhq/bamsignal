import { createHash } from "node:crypto";
import { isDatabaseReady, query } from "../db.js";
import { rateLimitIp } from "./rateLimit.js";
import {
  checkMemoryMemberThrottle,
  logMemberMemoryThrottleUsed,
  logThrottleDbUnavailable,
  recordMemoryMemberThrottleFailure
} from "./memoryThrottle.js";
import {
  logObservabilityEvent,
  observabilityContext
} from "./observability.js";
import { sanitizeApiErrorForLog } from "./errorResponse.js";
import { assertSchemaTable } from "./schemaVerification.js";

const ENDPOINT = "payment_initialize";

export const PAYMENT_INITIALIZE_WINDOW_MS = 60 * 1000;
export const PAYMENT_INITIALIZE_MAX_REQUESTS = 5;
export const PAYMENT_INITIALIZE_BURST_WINDOW_MS = 10 * 1000;
export const PAYMENT_INITIALIZE_BURST_MAX_REQUESTS = 3;
export const PAYMENT_INITIALIZE_RATE_LIMITED_MESSAGE = "Too many attempts. Please try again later.";

function hashValue(value = "") {
  const text = String(value || "").trim();
  if (!text) return null;
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function paymentMemberId(memberAuth = {}) {
  return String(memberAuth.authUserId || memberAuth.memberId || memberAuth.userKey || "").trim();
}

function paymentClientFingerprint(req) {
  const ip = rateLimitIp(req);
  const userAgent = String(req?.headers?.["user-agent"] || "").trim();
  const userAgentHash = hashValue(userAgent);
  const clientHash = ip && userAgentHash ? hashValue(`${ip}|${userAgentHash}`) : null;
  return { ip, ipHash: hashValue(ip), userAgentHash, clientHash };
}

export async function ensurePaymentInitializeThrottleTable() {
  if (!isDatabaseReady()) return;
  await assertSchemaTable("payment_initialize_rate_events");
}

async function countRecentEvents({ memberId, ip, clientHash, sinceIso }) {
  const result = await query(
    `select
       count(*) filter (where member_id = $3)::int as member_count,
       count(*) filter (where $4::text is not null and ip = $4)::int as ip_count,
       count(*) filter (where $5::text is not null and client_hash = $5)::int as client_count
     from payment_initialize_rate_events
     where endpoint = $1
       and created_at >= $2
       and (
         member_id = $3
         or ($4::text is not null and ip = $4)
         or ($5::text is not null and client_hash = $5)
       )`,
    [ENDPOINT, sinceIso, memberId, ip || null, clientHash || null]
  );
  const row = result.rows[0] || {};
  return {
    member: Number(row.member_count || 0),
    ip: Number(row.ip_count || 0),
    client: Number(row.client_count || 0)
  };
}

function exceededScope(counts, maxRequests) {
  for (const scope of ["member", "ip", "client"]) {
    if (Number(counts[scope] || 0) > maxRequests) return scope;
  }
  return null;
}

async function checkPersistentThrottle({ req, action, memberId, ip, ipHash, userAgentHash, clientHash }) {
  await ensurePaymentInitializeThrottleTable();
  await query(
    `insert into payment_initialize_rate_events (
       endpoint, initialize_action, member_id, ip, user_agent_hash, client_hash
     ) values ($1, $2, $3, $4, $5, $6)`,
    [ENDPOINT, action, memberId, ip || null, userAgentHash || null, clientHash || null]
  );

  const now = Date.now();
  const windowCounts = await countRecentEvents({
    memberId,
    ip,
    clientHash,
    sinceIso: new Date(now - PAYMENT_INITIALIZE_WINDOW_MS).toISOString()
  });
  const windowScope = exceededScope(windowCounts, PAYMENT_INITIALIZE_MAX_REQUESTS);
  if (windowScope) {
    return {
      ok: false,
      store: "database",
      reason: "window",
      scope: windowScope,
      counts: windowCounts,
      ipHash,
      userAgentHash
    };
  }

  const burstCounts = await countRecentEvents({
    memberId,
    ip,
    clientHash,
    sinceIso: new Date(now - PAYMENT_INITIALIZE_BURST_WINDOW_MS).toISOString()
  });
  const burstScope = exceededScope(burstCounts, PAYMENT_INITIALIZE_BURST_MAX_REQUESTS);
  if (burstScope) {
    return {
      ok: false,
      store: "database",
      reason: "burst",
      scope: burstScope,
      counts: burstCounts,
      ipHash,
      userAgentHash
    };
  }

  return { ok: true, store: "database" };
}

function memoryLimitConfig(windowMs, maxRequests) {
  return {
    windowMs,
    lockMs: windowMs,
    maxAttempts: maxRequests + 1
  };
}

function recordMemoryLimit({ action, identifier, windowMs, maxRequests }) {
  const config = {
    action,
    identifier,
    ip: null,
    userAgentHash: null,
    ...memoryLimitConfig(windowMs, maxRequests)
  };
  const existing = checkMemoryMemberThrottle(config);
  if (!existing.ok) return { ok: false, attempts: existing.attempts || 0 };
  const recorded = recordMemoryMemberThrottleFailure(config);
  return { ok: recorded.ok, attempts: recorded.attempts || 0 };
}

function checkMemoryDimension({ action, identifier }) {
  const windowResult = recordMemoryLimit({
    action,
    identifier,
    windowMs: PAYMENT_INITIALIZE_WINDOW_MS,
    maxRequests: PAYMENT_INITIALIZE_MAX_REQUESTS
  });
  if (!windowResult.ok) return { ok: false, reason: "window", attempts: windowResult.attempts };

  const burstResult = recordMemoryLimit({
    action: `${action}_burst`,
    identifier,
    windowMs: PAYMENT_INITIALIZE_BURST_WINDOW_MS,
    maxRequests: PAYMENT_INITIALIZE_BURST_MAX_REQUESTS
  });
  if (!burstResult.ok) return { ok: false, reason: "burst", attempts: burstResult.attempts };

  return { ok: true };
}

function checkMemoryThrottle({ action, memberId, ip, ipHash, userAgentHash, clientHash }) {
  const dimensions = [
    { scope: "member", identifier: `member:${memberId}` },
    ip ? { scope: "ip", identifier: `ip:${hashValue(ip)}` } : null,
    clientHash ? { scope: "client", identifier: `client:${clientHash}` } : null
  ].filter(Boolean);

  for (const dimension of dimensions) {
    const result = checkMemoryDimension({
      action: ENDPOINT,
      identifier: dimension.identifier
    });
    if (!result.ok) {
      return {
        ok: false,
        store: "memory",
        reason: result.reason,
        scope: dimension.scope,
        attempts: result.attempts,
        ipHash,
        userAgentHash
      };
    }
  }

  return { ok: true, store: "memory", action };
}

function logRateLimited(req, { action, memberId, result }) {
  logObservabilityEvent(
    "payment_initialize_rate_limited",
    observabilityContext(req, {
      action,
      store: result.store,
      reason: result.reason,
      scope: result.scope,
      memberHash: hashValue(memberId),
      ipHash: result.ipHash || null,
      userAgentHash: result.userAgentHash || null,
      limit: PAYMENT_INITIALIZE_MAX_REQUESTS,
      windowMs: PAYMENT_INITIALIZE_WINDOW_MS,
      burstLimit: PAYMENT_INITIALIZE_BURST_MAX_REQUESTS,
      burstWindowMs: PAYMENT_INITIALIZE_BURST_WINDOW_MS
    }),
    "warn"
  );
}

async function checkWithMemoryFallback(args, reason = "database_unavailable") {
  logThrottleDbUnavailable(ENDPOINT, "payment");
  logMemberMemoryThrottleUsed(ENDPOINT);
  const result = checkMemoryThrottle(args);
  if (!result.ok) {
    logRateLimited(args.req, { action: args.action, memberId: args.memberId, result: { ...result, reason } });
    return {
      ok: false,
      status: 429,
      error: PAYMENT_INITIALIZE_RATE_LIMITED_MESSAGE,
      store: result.store
    };
  }
  return result;
}

export async function enforcePaymentInitializeThrottle({ req, action, memberAuth }) {
  const memberId = paymentMemberId(memberAuth);
  if (!memberId) {
    return { ok: false, status: 401, error: "not_authorized" };
  }

  const client = paymentClientFingerprint(req);
  const throttleArgs = { req, action, memberId, ...client };

  if (!isDatabaseReady()) {
    return checkWithMemoryFallback(throttleArgs);
  }

  try {
    const result = await checkPersistentThrottle(throttleArgs);
    if (!result.ok) {
      logRateLimited(req, { action, memberId, result });
      return {
        ok: false,
        status: 429,
        error: PAYMENT_INITIALIZE_RATE_LIMITED_MESSAGE,
        store: result.store
      };
    }
    return result;
  } catch (error) {
    const sanitized = sanitizeApiErrorForLog(error);
    logObservabilityEvent(
      "throttle_db_unavailable",
      observabilityContext(req, {
        action: ENDPOINT,
        scope: "payment",
        reason: sanitized.category,
        error: sanitized.message
      }),
      "warn"
    );
    return checkWithMemoryFallback(throttleArgs, "persistence_unavailable");
  }
}
