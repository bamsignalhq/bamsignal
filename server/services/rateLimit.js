import { createHash } from "node:crypto";
import { isDatabaseReady, normalizeUserKey, query } from "../db.js";
import { createModerationFlag } from "../memberTrust.js";
import { assertSchemaTable } from "./schemaVerification.js";
import {
  API_RATE_EVENTS_RETENTION_MS,
  batchDeleteOlderThan,
  batchDeletePlan
} from "./retentionBatchDelete.js";
import {
  checkMemoryMemberThrottle,
  logMemberMemoryThrottleUsed,
  logThrottleDbUnavailable,
  recordMemoryMemberThrottleFailure
} from "./memoryThrottle.js";
import { recordFallbackActivation } from "./infrastructureObservability.js";

export { API_RATE_EVENTS_RETENTION_MS };

const DEFAULT_LIMITS = {
  search: { windowMs: 60_000, max: 30 },
  "profile-view": { windowMs: 3_600_000, max: 100 },
  discover: { windowMs: 60_000, max: 60 },
  "home-feed": { windowMs: 60_000, max: 60 }
};

function parseEnvLimit(name, fallback) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Configurable via RATE_LIMIT_<ENDPOINT>_MAX and RATE_LIMIT_<ENDPOINT>_WINDOW_MS env vars. */
export function getRateLimitConfig(endpoint) {
  const base = DEFAULT_LIMITS[endpoint];
  if (!base) return null;
  const envKey = String(endpoint).toUpperCase().replace(/[^A-Z0-9]/g, "_");
  return {
    windowMs: parseEnvLimit(`RATE_LIMIT_${envKey}_WINDOW_MS`, base.windowMs),
    max: parseEnvLimit(`RATE_LIMIT_${envKey}_MAX`, base.max)
  };
}

export const LIMITS = DEFAULT_LIMITS;

export async function ensureRateLimitSchema() {
  if (!isDatabaseReady()) return;
  await assertSchemaTable("api_rate_events");
}

export async function pruneRateLimitEvents(options = {}) {
  if (!isDatabaseReady()) {
    return { deleted: 0, skipped: true };
  }

  await ensureRateLimitSchema();
  const plan = batchDeletePlan({
    table: "api_rate_events",
    column: "created_at",
    retentionMs: API_RATE_EVENTS_RETENTION_MS,
    batchSize: options.batchSize,
    maxBatches: options.maxBatches,
    nowMs: options.nowMs
  });

  return batchDeleteOlderThan(plan);
}

function clientIp(req) {
  const forwarded = String(req?.headers?.["x-forwarded-for"] || "").split(",")[0]?.trim();
  return forwarded || req?.socket?.remoteAddress || null;
}

function memoryIdentifier(endpoint, userKey, ip) {
  const parts = [endpoint, userKey || "", ip || ""].filter(Boolean);
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 24);
}

const loggedRateLimitFallback = new Set();

function checkMemoryRateLimit({ endpoint, userKey, ip, config }) {
  const fallbackKey = `rate_limit:${endpoint}`;
  if (!loggedRateLimitFallback.has(fallbackKey)) {
    loggedRateLimitFallback.add(fallbackKey);
    logThrottleDbUnavailable(fallbackKey, "rate_limit");
    logMemberMemoryThrottleUsed(fallbackKey);
    recordFallbackActivation("rate_limit_memory", { endpoint });
  }

  const action = `rate_limit:${endpoint}`;
  const identifier = memoryIdentifier(endpoint, userKey, ip);
  const throttleConfig = {
    action,
    identifier,
    ip: null,
    userAgentHash: null,
    windowMs: config.windowMs,
    lockMs: config.windowMs,
    maxAttempts: config.max + 1
  };

  const existing = checkMemoryMemberThrottle(throttleConfig);
  if (!existing.ok) {
    return {
      ok: false,
      error: "Please slow down a little.",
      retryAfterMs: config.windowMs,
      store: "memory"
    };
  }

  const recorded = recordMemoryMemberThrottleFailure(throttleConfig);
  if (!recorded.ok) {
    return {
      ok: false,
      error: "Please slow down a little.",
      retryAfterMs: config.windowMs,
      store: "memory"
    };
  }

  return { ok: true, store: "memory" };
}

export async function checkRateLimit({ req, endpoint, email, phone }) {
  const config = getRateLimitConfig(endpoint);
  if (!config) return { ok: true };

  const userKey = normalizeUserKey({ email, phone });
  const ip = clientIp(req);

  if (!isDatabaseReady()) {
    return checkMemoryRateLimit({ endpoint, userKey, ip, config });
  }

  await ensureRateLimitSchema();
  const since = new Date(Date.now() - config.windowMs).toISOString();

  await query(
    `insert into api_rate_events (endpoint, user_key, ip) values ($1, $2, $3)`,
    [endpoint, userKey || null, ip]
  );

  const result = await query(
    `select count(*)::int as count
     from api_rate_events
     where endpoint = $1
       and created_at >= $2
       and (
         ($3::text is not null and user_key = $3)
         or ($4::text is not null and ip = $4)
       )`,
    [endpoint, since, userKey || null, ip]
  );
  const count = Number(result.rows[0]?.count || 0);
  if (count > config.max) {
    if (count > config.max * 2 && userKey) {
      await createModerationFlag({
        userKey,
        reason: "scraping_suspected",
        severity: count > config.max * 4 ? "high" : "medium",
        metadata: { endpoint, count, windowMs: config.windowMs, ip }
      });
    }
    return { ok: false, error: "Please slow down a little.", retryAfterMs: config.windowMs, store: "database" };
  }
  return { ok: true, store: "database" };
}

export function rateLimitIp(req) {
  return clientIp(req);
}
