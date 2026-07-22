/**
 * Sprint 7 — Resilience audit contract.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(rel) {
  return readFileSync(join(rootPath, rel), "utf8");
}

function check(name, passed, detail, risk = null) {
  return { name, passed, detail, remainingRisk: risk };
}

export function runResilienceAudit() {
  const findings = [];

  findings.push(
    check(
      "payment_idempotency",
      read("server/services/finance/idempotency.js").includes("resolveFinancialIdempotencyKey"),
      "Financial events use idempotency keys"
    )
  );
  findings.push(
    check(
      "messaging_idempotency",
      read("server/services/messaging/idempotency.js").includes("resolveMessageIdempotencyKey"),
      "Messaging pipeline uses idempotency keys"
    )
  );
  findings.push(
    check(
      "passport_async_sync",
      read("server/services/passportIntegration/bridge.js").includes("setImmediate"),
      "Trust sync is async — never blocks user actions"
    )
  );
  findings.push(
    check(
      "passport_sync_queue",
      read("migrations/0063_passport_integration.sql").includes("passport_sync_queue"),
      "Failed trust sync items persist for retry"
    )
  );
  findings.push(
    check(
      "delivery_retry",
      read("server/services/messaging/delivery.js").includes("retry_count"),
      "Message delivery queue supports retries"
    )
  );
  findings.push(
    check(
      "rate_limit_memory_fallback",
      read("server/services/rateLimit.js").includes("checkMemoryRateLimit"),
      "Rate limiting degrades to memory store when DB unavailable"
    )
  );
  findings.push(
    check(
      "pin_auth_memory_fallback",
      read("server/services/pinAuthThrottle.js").includes("recordFallbackActivation"),
      "PIN auth throttle has memory fallback"
    )
  );
  findings.push(
    check(
      "graceful_shutdown",
      read("server/production.js").includes("registerGracefulShutdownHandlers") ||
        read("server/services/gracefulShutdown.js").includes("SIGTERM"),
      "Production server handles shutdown signals via gracefulShutdown coordinator"
    )
  );

  const risks = findings.filter((f) => f.remainingRisk).map((f) => f.remainingRisk);
  const passed = findings.every((f) => f.passed);

  return {
    domain: "resilience",
    passed,
    status: passed ? "PASS" : "WARN",
    findings,
    remainingRisks: [
      ...risks,
      "Dead-letter queue for permanently failed passport_sync_queue items — manual reprocess via runbook",
      "Circuit breaker for external Paystack outages — monitor via payment webhook metrics"
    ]
  };
}
