import { createHash } from "node:crypto";
import { isDatabaseReady, normalizeUserKey, query } from "../db.js";
import { createModerationFlag } from "../memberTrust.js";

const LIMITS = {
  search: { windowMs: 60_000, max: 30 },
  "profile-view": { windowMs: 3_600_000, max: 100 },
  discover: { windowMs: 60_000, max: 60 },
  "home-feed": { windowMs: 60_000, max: 60 }
};

export async function ensureRateLimitSchema() {
  if (!isDatabaseReady()) return;
  await query(`
    create table if not exists api_rate_events (
      id uuid primary key default gen_random_uuid(),
      endpoint text not null,
      user_key text,
      ip text,
      created_at timestamptz not null default now()
    )
  `);
  await query(
    "create index if not exists api_rate_events_lookup_idx on api_rate_events (endpoint, user_key, ip, created_at desc)"
  );
}

function clientIp(req) {
  const forwarded = String(req?.headers?.["x-forwarded-for"] || "").split(",")[0]?.trim();
  return forwarded || req?.socket?.remoteAddress || null;
}

export async function checkRateLimit({ req, endpoint, email, phone }) {
  if (!isDatabaseReady()) return { ok: true };
  const config = LIMITS[endpoint];
  if (!config) return { ok: true };

  await ensureRateLimitSchema();
  const userKey = normalizeUserKey({ email, phone });
  const ip = clientIp(req);
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
    return { ok: false, error: "Please slow down a little.", retryAfterMs: config.windowMs };
  }
  return { ok: true };
}

export function rateLimitIp(req) {
  return clientIp(req);
}
