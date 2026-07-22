/**
 * Infrastructure observability — startup, migrations, fallbacks, certification, health probes.
 */

import { logObservabilityEvent } from "./observability.js";

const metrics = {
  startupDurationMs: 0,
  migrationDurationMs: 0,
  fallbackActivations: 0,
  rateLimitMemoryFallbacks: 0,
  pinAuthMemoryFallbacks: 0,
  certificationExecutions: 0,
  healthRequests: 0,
  readinessRequests: 0,
  diagnosticsFailures: 0
};

export function recordStartupDuration(ms) {
  metrics.startupDurationMs = Math.max(0, Math.round(ms));
  logObservabilityEvent("infrastructure_startup_complete", { durationMs: metrics.startupDurationMs });
}

export function recordMigrationDuration(ms) {
  metrics.migrationDurationMs = Math.max(0, Math.round(ms));
  logObservabilityEvent("infrastructure_migration_complete", { durationMs: metrics.migrationDurationMs });
}

export function recordFallbackActivation(kind, detail = {}) {
  metrics.fallbackActivations += 1;
  if (kind === "rate_limit_memory") metrics.rateLimitMemoryFallbacks += 1;
  if (kind === "pin_auth_memory") metrics.pinAuthMemoryFallbacks += 1;
  logObservabilityEvent("infrastructure_fallback_activated", { kind, ...detail }, "warn");
}

export function recordCertificationExecution({ passed, suite = "production" } = {}) {
  metrics.certificationExecutions += 1;
  logObservabilityEvent("infrastructure_certification_executed", { passed: Boolean(passed), suite });
}

export function recordHealthRequest(kind = "health") {
  if (kind === "ready") metrics.readinessRequests += 1;
  else metrics.healthRequests += 1;
}

export function recordDiagnosticsFailure(detail = {}) {
  metrics.diagnosticsFailures += 1;
  logObservabilityEvent("diagnostics_access_failed", detail, "warn");
}

export function getInfrastructureMetrics() {
  return { ...metrics };
}
