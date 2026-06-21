#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_RATE_EVENTS_RETENTION_MS,
  OTP_ATTEMPTS_RETENTION_MS,
  PAYMENT_INITIALIZE_EVENTS_RETENTION_MS,
  PIN_AUTH_ATTEMPTS_RETENTION_MS,
  batchDeletePlan,
  retentionCutoffIso
} from "../server/services/retentionBatchDelete.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const rateLimitSource = read("server/services/rateLimit.js");
const paymentThrottleSource = read("server/services/paymentInitializeThrottle.js");
const pinAuthThrottleSource = read("server/services/pinAuthThrottle.js");
const retentionSource = read("server/services/rateLimitRetention.js");
const batchSource = read("server/services/retentionBatchDelete.js");
const migrationSource = read("migrations/0003_rate_limit_retention_indexes.sql");
const productionSource = read("server/production.js");

assert(
  rateLimitSource.includes("export async function pruneRateLimitEvents") &&
    paymentThrottleSource.includes("export async function prunePaymentThrottleEvents") &&
    pinAuthThrottleSource.includes("export async function prunePinAuthThrottleEvents") &&
    retentionSource.includes("export async function pruneOtpAttemptRecords") &&
    retentionSource.includes("export async function runRateLimitRetentionCleanup") &&
    retentionSource.includes("startRateLimitRetentionScheduler"),
  "rate-limit retention helpers and scheduler must be exported"
);

assert(
  API_RATE_EVENTS_RETENTION_MS === 7 * 24 * 60 * 60 * 1000 &&
    PAYMENT_INITIALIZE_EVENTS_RETENTION_MS === 30 * 24 * 60 * 60 * 1000 &&
    OTP_ATTEMPTS_RETENTION_MS === 7 * 24 * 60 * 60 * 1000 &&
    PIN_AUTH_ATTEMPTS_RETENTION_MS === 30 * 24 * 60 * 60 * 1000,
  "retention windows must match product policy"
);

assert(
  batchSource.includes("with doomed as") &&
    batchSource.includes("limit $2") &&
    batchSource.includes("DEFAULT_CLEANUP_BATCH_SIZE = 500") &&
    batchSource.includes("DEFAULT_CLEANUP_MAX_BATCHES = 20"),
  "retention cleanup must batch deletes to avoid long locks"
);

assert(
  migrationSource.includes("api_rate_events_created_at_idx") &&
    migrationSource.includes("payment_initialize_rate_events_created_at_idx") &&
    migrationSource.includes("pin_auth_attempts_last_attempt_at_idx") &&
    migrationSource.includes("email_verification_codes_expires_at_idx") &&
    migrationSource.includes("pin_reset_codes_expires_at_idx") &&
    migrationSource.includes("whatsapp_verification_codes_expires_at_idx"),
  "retention indexes must exist for timestamp-based cleanup"
);

assert(
  productionSource.includes("startRateLimitRetentionScheduler") &&
    !rateLimitSource.includes("create table if not exists") &&
    !paymentThrottleSource.includes("delete from api_rate_events"),
  "scheduler must run in production without changing request-path rate-limit behavior"
);

const now = Date.parse("2026-06-21T12:00:00.000Z");
const apiPlan = batchDeletePlan({
  table: "api_rate_events",
  column: "created_at",
  retentionMs: API_RATE_EVENTS_RETENTION_MS,
  nowMs: now
});
const paymentPlan = batchDeletePlan({
  table: "payment_initialize_rate_events",
  column: "created_at",
  retentionMs: PAYMENT_INITIALIZE_EVENTS_RETENTION_MS,
  nowMs: now
});

assert(
  apiPlan.olderThanIso === retentionCutoffIso(API_RATE_EVENTS_RETENTION_MS, now) &&
    paymentPlan.olderThanIso === retentionCutoffIso(PAYMENT_INITIALIZE_EVENTS_RETENTION_MS, now),
  "retention cutoffs must be computed from policy windows"
);

function simulateBatchCleanup(rows, cutoffIso, batchSize = 2, maxBatches = 10) {
  const remaining = [...rows];
  let deleted = 0;
  let batches = 0;

  for (; batches < maxBatches; batches += 1) {
    const doomed = remaining.filter((row) => row.created_at < cutoffIso).slice(0, batchSize);
    if (!doomed.length) break;
    for (const row of doomed) {
      const index = remaining.indexOf(row);
      if (index >= 0) remaining.splice(index, 1);
    }
    deleted += doomed.length;
    if (doomed.length < batchSize) break;
  }

  return { deleted, remaining, batches };
}

const fixtureNow = Date.parse("2026-06-21T12:00:00.000Z");
const cutoff = retentionCutoffIso(API_RATE_EVENTS_RETENTION_MS, fixtureNow);
const rows = [
  { id: "old-1", created_at: "2026-06-01T12:00:00.000Z" },
  { id: "old-2", created_at: "2026-06-02T12:00:00.000Z" },
  { id: "old-3", created_at: "2026-06-03T12:00:00.000Z" },
  { id: "fresh", created_at: "2026-06-20T12:00:00.000Z" }
];

const firstPass = simulateBatchCleanup(rows, cutoff, 2, 1);
assert(firstPass.deleted === 2, "large-table cleanup must delete expired rows in bounded batches");
const secondPass = simulateBatchCleanup(firstPass.remaining, cutoff, 2, 5);
assert(secondPass.deleted === 1 && secondPass.remaining.length === 1, "expired rows must be fully removable across batches");
assert(secondPass.remaining[0].id === "fresh", "recent rows must be preserved during retention cleanup");

assert(
  rateLimitSource.includes("from api_rate_events") &&
    rateLimitSource.includes("created_at >=") &&
    paymentThrottleSource.includes("from payment_initialize_rate_events") &&
    paymentThrottleSource.includes("created_at >="),
  "rate-limit queries must continue using recent-window counts after retention work"
);

console.log("rate-limit retention tests ok");
