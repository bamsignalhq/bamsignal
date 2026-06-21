import { isDatabaseReady, query } from "../db.js";

export const DAY_MS = 24 * 60 * 60 * 1000;

export const API_RATE_EVENTS_RETENTION_MS = 7 * DAY_MS;
export const PAYMENT_INITIALIZE_EVENTS_RETENTION_MS = 30 * DAY_MS;
export const OTP_ATTEMPTS_RETENTION_MS = 7 * DAY_MS;
export const PIN_AUTH_ATTEMPTS_RETENTION_MS = 30 * DAY_MS;

export const DEFAULT_CLEANUP_BATCH_SIZE = 500;
export const DEFAULT_CLEANUP_MAX_BATCHES = 20;
export const DEFAULT_CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

const ALLOWED_RETENTION_TARGETS = new Set([
  "api_rate_events:created_at",
  "payment_initialize_rate_events:created_at",
  "pin_auth_attempts:last_attempt_at",
  "email_verification_codes:expires_at",
  "pin_reset_codes:expires_at",
  "whatsapp_verification_codes:expires_at"
]);

export function retentionCutoffIso(retentionMs, nowMs = Date.now()) {
  return new Date(nowMs - retentionMs).toISOString();
}

export function batchDeletePlan({
  table,
  column,
  retentionMs,
  batchSize = DEFAULT_CLEANUP_BATCH_SIZE,
  maxBatches = DEFAULT_CLEANUP_MAX_BATCHES,
  nowMs = Date.now()
}) {
  const targetKey = `${table}:${column}`;
  if (!ALLOWED_RETENTION_TARGETS.has(targetKey)) {
    throw new Error(`Unsupported retention target: ${targetKey}`);
  }

  return {
    table,
    column,
    olderThanIso: retentionCutoffIso(retentionMs, nowMs),
    batchSize,
    maxBatches
  };
}

export async function batchDeleteOlderThan({
  table,
  column,
  olderThanIso,
  batchSize = DEFAULT_CLEANUP_BATCH_SIZE,
  maxBatches = DEFAULT_CLEANUP_MAX_BATCHES
}) {
  if (!isDatabaseReady()) {
    return { deleted: 0, batches: 0, skipped: true };
  }

  const targetKey = `${table}:${column}`;
  if (!ALLOWED_RETENTION_TARGETS.has(targetKey)) {
    throw new Error(`Unsupported retention target: ${targetKey}`);
  }

  let deleted = 0;
  let batches = 0;

  for (; batches < maxBatches; batches += 1) {
    const result = await query(
      `with doomed as (
         select ctid
         from ${table}
         where ${column} < $1::timestamptz
         limit $2
       )
       delete from ${table} target
       using doomed
       where target.ctid = doomed.ctid`,
      [olderThanIso, batchSize]
    );
    const batchDeleted = Number(result.rowCount || 0);
    deleted += batchDeleted;
    if (batchDeleted < batchSize) break;
  }

  return { deleted, batches, skipped: false };
}
