/**
 * Sprint 7 — Observability completeness audit.
 */

import { getInfrastructureMetrics } from "../infrastructureObservability.js";
import { getAuthObservabilityMetrics } from "../auth/observability.js";
import { getFinancialObservabilityMetrics } from "../finance/observability.js";
import { getMessagingObservabilityMetrics } from "../messaging/observability.js";
import { getOperationsObservabilityMetrics } from "../operations/observability.js";
import { getPassportIntegrationMetrics } from "../passportIntegration/observability.js";
import { getPassportSignalMetrics } from "../passportSignals/observability.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

export function runObservabilityAudit() {
  const infrastructure = getInfrastructureMetrics();
  const domains = {
    infrastructure: {
      diagnosticsFailures: infrastructure.diagnosticsFailures,
      readinessRequests: infrastructure.readinessRequests,
      fallbackActivations: infrastructure.fallbackActivations
    },
    authentication: getAuthObservabilityMetrics(),
    finance: getFinancialObservabilityMetrics(),
    messaging: getMessagingObservabilityMetrics(),
    operations: getOperationsObservabilityMetrics(),
    trustSync: getPassportIntegrationMetrics(),
    passportSignals: getPassportSignalMetrics()
  };

  const operator = readFileSync(join(rootPath, "server/services/operatorDashboardContract.js"), "utf8");
  const checks = [
    { name: "api_errors", passed: operator.includes("recentAlerts") || operator.includes("diagnostics"), domain: "infrastructure" },
    { name: "auth_failures", passed: "failedLogins" in domains.authentication, domain: "authentication" },
    { name: "payment_failures", passed: "duplicateWebhooks" in domains.finance, domain: "finance" },
    { name: "messaging_delivery", passed: "messagesSent" in domains.messaging, domain: "messaging" },
    { name: "moderation_queue", passed: "moderationQueueDepth" in domains.operations, domain: "operations" },
    { name: "trust_sync_failures", passed: "syncFailures" in domains.trustSync, domain: "trustSync" },
    { name: "notification_outbox", passed: readFileSync(join(rootPath, "server/services/messaging/notifications.js"), "utf8").includes("markNotificationFailed"), domain: "messaging" },
    { name: "passport_ingestion", passed: "ingestionFailure" in domains.passportSignals || "ingestionSuccess" in domains.passportSignals, domain: "passportSignals" }
  ];

  const passed = checks.every((c) => c.passed);

  return {
    domain: "observability",
    passed,
    status: passed ? "PASS" : "WARN",
    checks,
    domains,
    alertingRecommendations: [
      "Alert on /ready 503 sustained > 2 minutes",
      "Alert on payment webhook failure rate spike",
      "Alert on passport_sync_queue failed count > 0 for 15 minutes",
      "Alert on moderation queue depth anomaly"
    ]
  };
}
