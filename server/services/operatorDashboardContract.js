/**
 * Operator dashboard contract — backend snapshot for future operations UI.
 * No frontend. Never exposes secrets.
 */

import { getDeploymentMetadata, getUptimeSeconds } from "../deployMetadata.js";
import { getDatabaseStatus, getDatabaseError, checkSchema } from "../db.js";
import { getStartupValidation } from "./startupBootstrap.js";
import { getInfrastructureMetrics } from "./infrastructureObservability.js";
import { registryFeatureSnapshot } from "./serviceRegistry.js";
import { PRODUCTION_CERT_VERSION } from "../../shared/productionCertification.mjs";
import { getAuthObservabilityMetrics } from "./auth/observability.js";
import { getFinancialObservabilityMetrics } from "./finance/observability.js";
import { getMessagingObservabilityMetrics } from "./messaging/observability.js";

export async function buildOperatorDashboardSnapshot() {
  const deploy = getDeploymentMetadata("bamsignal");
  const validation = getStartupValidation();
  const schema = await checkSchema();
  const infrastructure = getInfrastructureMetrics();
  const features = registryFeatureSnapshot(process.env);

  return {
    generatedAt: new Date().toISOString(),
    deployment: {
      application: deploy.application,
      version: deploy.version,
      environment: deploy.environment,
      platform: deploy.platform,
      provider: deploy.provider,
      commit: deploy.commit,
      buildTime: deploy.buildTime,
      uptimeSeconds: getUptimeSeconds()
    },
    migration: {
      status: schema.ok ? "verified" : schema.skipped ? "skipped" : "degraded",
      appliedTableCount: schema.present?.length || 0,
      missingTableCount: schema.missing?.length || 0
    },
    environment: {
      mode: validation?.mode || "unknown",
      ok: validation?.ok ?? null,
      enabledFeatures: validation?.enabledFeatures || [],
      disabledFeatures: validation?.disabledFeatures || [],
      warningCount: validation?.warnings?.length || 0
    },
    readiness: {
      database: getDatabaseStatus(),
      hasDatabaseError: Boolean(getDatabaseError()),
      criticalFeatures: features.filter((f) => f.tier === "critical").map((f) => ({
        id: f.id,
        enabled: f.enabled,
        healthy: f.healthy
      }))
    },
    health: {
      status:
        getDatabaseStatus() === "connected" && validation?.ok ? "operational" : "degraded"
    },
    recentAlerts: [],
    diagnostics: {
      failures: infrastructure.diagnosticsFailures,
      readinessRequests: infrastructure.readinessRequests,
      healthRequests: infrastructure.healthRequests
    },
    certification: {
      version: PRODUCTION_CERT_VERSION,
      executions: infrastructure.certificationExecutions
    },
    observability: {
      startupDurationMs: infrastructure.startupDurationMs,
      migrationDurationMs: infrastructure.migrationDurationMs,
      fallbackActivations: infrastructure.fallbackActivations,
      rateLimitMemoryFallbacks: infrastructure.rateLimitMemoryFallbacks,
      pinAuthMemoryFallbacks: infrastructure.pinAuthMemoryFallbacks,
      auth: getAuthObservabilityMetrics(),
      finance: getFinancialObservabilityMetrics(),
      messaging: getMessagingObservabilityMetrics()
    }
  };
}
