/**
 * Sprint 7 — Performance baseline audit contract.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getInfrastructureMetrics } from "../infrastructureObservability.js";
import { getAuthObservabilityMetrics } from "../auth/observability.js";
import { getFinancialObservabilityMetrics } from "../finance/observability.js";
import { getMessagingObservabilityMetrics } from "../messaging/observability.js";
import { getOperationsObservabilityMetrics } from "../operations/observability.js";
import { getPassportIntegrationMetrics } from "../passportIntegration/observability.js";
import { getPassportSignalMetrics } from "../passportSignals/observability.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(rel) {
  return readFileSync(join(rootPath, rel), "utf8");
}

export const PERFORMANCE_THRESHOLDS = Object.freeze({
  startupMaxMs: 30_000,
  migrationMaxMs: 60_000,
  apiP95TargetMs: 500,
  readinessMaxMs: 2_000,
  healthMaxMs: 200
});

export function runPerformanceAudit() {
  const infrastructure = getInfrastructureMetrics();
  const findings = [];

  findings.push({
    name: "startup_duration",
    valueMs: infrastructure.startupDurationMs || 0,
    thresholdMs: PERFORMANCE_THRESHOLDS.startupMaxMs,
    passed: (infrastructure.startupDurationMs || 0) < PERFORMANCE_THRESHOLDS.startupMaxMs
  });

  findings.push({
    name: "migration_duration",
    valueMs: infrastructure.migrationDurationMs || 0,
    thresholdMs: PERFORMANCE_THRESHOLDS.migrationMaxMs,
    passed: (infrastructure.migrationDurationMs || 0) < PERFORMANCE_THRESHOLDS.migrationMaxMs
  });

  const rateLimit = read("server/services/rateLimit.js");
  findings.push({
    name: "rate_limit_configurable",
    passed: rateLimit.includes("getRateLimitConfig") && rateLimit.includes("RATE_LIMIT_"),
    detail: "Rate limits configurable via environment"
  });

  const messaging = read("server/services/messaging/delivery.js");
  findings.push({
    name: "delivery_retry_backoff",
    passed: messaging.includes("computeRetryBackoff") || messaging.includes("next_retry_at"),
    detail: "Message delivery uses retry backoff"
  });

  const observability = {
    auth: getAuthObservabilityMetrics(),
    finance: getFinancialObservabilityMetrics(),
    messaging: getMessagingObservabilityMetrics(),
    operations: getOperationsObservabilityMetrics(),
    passport: getPassportIntegrationMetrics(),
    signals: getPassportSignalMetrics()
  };

  const passed = findings.every((f) => f.passed !== false);

  return {
    domain: "performance",
    passed,
    status: passed ? "PASS" : "WARN",
    thresholds: PERFORMANCE_THRESHOLDS,
    findings,
    observabilitySnapshot: observability,
    recommendations: [
      "Run npm run certify:performance before launch cutover",
      "Run npm run certify:platform-load for traffic simulation",
      "Monitor API P95 via Coolify metrics and /ready?details=1"
    ]
  };
}
