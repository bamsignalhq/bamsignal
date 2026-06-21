import { isDatabaseReady } from "../db.js";
import { logObservabilityEvent } from "./observability.js";
import { prunePaymentThrottleEvents } from "./paymentInitializeThrottle.js";
import { prunePinAuthThrottleEvents } from "./pinAuthThrottle.js";
import { pruneRateLimitEvents } from "./rateLimit.js";
import {
  DEFAULT_CLEANUP_INTERVAL_MS,
  OTP_ATTEMPTS_RETENTION_MS,
  batchDeleteOlderThan,
  retentionCutoffIso,
  DEFAULT_CLEANUP_BATCH_SIZE,
  DEFAULT_CLEANUP_MAX_BATCHES
} from "./retentionBatchDelete.js";

export {
  API_RATE_EVENTS_RETENTION_MS,
  PAYMENT_INITIALIZE_EVENTS_RETENTION_MS,
  OTP_ATTEMPTS_RETENTION_MS,
  PIN_AUTH_ATTEMPTS_RETENTION_MS,
  DEFAULT_CLEANUP_BATCH_SIZE,
  DEFAULT_CLEANUP_MAX_BATCHES,
  DEFAULT_CLEANUP_INTERVAL_MS,
  DAY_MS,
  batchDeleteOlderThan,
  batchDeletePlan,
  retentionCutoffIso
} from "./retentionBatchDelete.js";

let retentionSchedulerTimer = null;

export async function pruneOtpAttemptRecords(options = {}) {
  if (!isDatabaseReady()) {
    return { deleted: 0, skipped: true, tables: {} };
  }

  const olderThanIso = retentionCutoffIso(OTP_ATTEMPTS_RETENTION_MS, options.nowMs);
  const batchOptions = {
    olderThanIso,
    batchSize: options.batchSize || DEFAULT_CLEANUP_BATCH_SIZE,
    maxBatches: options.maxBatches || DEFAULT_CLEANUP_MAX_BATCHES
  };

  const [emailCodes, pinResetCodes, whatsappCodes] = await Promise.all([
    batchDeleteOlderThan({ table: "email_verification_codes", column: "expires_at", ...batchOptions }),
    batchDeleteOlderThan({ table: "pin_reset_codes", column: "expires_at", ...batchOptions }),
    batchDeleteOlderThan({ table: "whatsapp_verification_codes", column: "expires_at", ...batchOptions })
  ]);

  return {
    deleted: emailCodes.deleted + pinResetCodes.deleted + whatsappCodes.deleted,
    skipped: false,
    tables: {
      email_verification_codes: emailCodes.deleted,
      pin_reset_codes: pinResetCodes.deleted,
      whatsapp_verification_codes: whatsappCodes.deleted
    }
  };
}

export async function runRateLimitRetentionCleanup(options = {}) {
  if (!isDatabaseReady()) {
    return { ok: true, skipped: true, totals: { deleted: 0 } };
  }

  const [apiRateEvents, paymentInitializeEvents, pinAuthAttempts, otpAttempts] = await Promise.all([
    pruneRateLimitEvents(options),
    prunePaymentThrottleEvents(options),
    prunePinAuthThrottleEvents(options),
    pruneOtpAttemptRecords(options)
  ]);

  const deleted =
    Number(apiRateEvents.deleted || 0) +
    Number(paymentInitializeEvents.deleted || 0) +
    Number(pinAuthAttempts.deleted || 0) +
    Number(otpAttempts.deleted || 0);

  const summary = {
    ok: true,
    skipped: false,
    totals: { deleted },
    apiRateEvents,
    paymentInitializeEvents,
    pinAuthAttempts,
    otpAttempts
  };

  if (deleted > 0) {
    logObservabilityEvent("rate_limit_retention_cleanup", summary, "info");
  }

  return summary;
}

export function startRateLimitRetentionScheduler(options = {}) {
  if (retentionSchedulerTimer || !process.env.DATABASE_URL?.trim()) {
    return { started: false, reason: retentionSchedulerTimer ? "already_running" : "database_not_configured" };
  }

  const intervalMs = Number(
    options.intervalMs || process.env.RATE_LIMIT_CLEANUP_INTERVAL_MS || DEFAULT_CLEANUP_INTERVAL_MS
  );
  const startupDelayMs = Number(options.startupDelayMs ?? 30_000);

  const runCleanup = () => {
    void runRateLimitRetentionCleanup().catch((error) => {
      logObservabilityEvent(
        "rate_limit_retention_cleanup_failed",
        { error: error?.message || String(error) },
        "warn"
      );
    });
  };

  if (startupDelayMs > 0) {
    const startupTimer = setTimeout(runCleanup, startupDelayMs);
    if (typeof startupTimer.unref === "function") startupTimer.unref();
  }

  retentionSchedulerTimer = setInterval(runCleanup, intervalMs);
  if (typeof retentionSchedulerTimer.unref === "function") {
    retentionSchedulerTimer.unref();
  }

  return { started: true, intervalMs, startupDelayMs };
}

export function stopRateLimitRetentionScheduler() {
  if (!retentionSchedulerTimer) return false;
  clearInterval(retentionSchedulerTimer);
  retentionSchedulerTimer = null;
  return true;
}
