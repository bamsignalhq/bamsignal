import { config } from "../config.js";
import { checkSchema, getDatabaseError, getDatabaseStatus } from "../db.js";
import { getFirebaseHealth } from "../firebase.js";
import { getStartupValidation } from "./startupBootstrap.js";
import {
  buildRegistryAdminHealthSnapshot,
  getServiceRegistry,
  registryFeatureSnapshot
} from "./serviceRegistry.js";

export function livenessPayload() {
  return { ok: true, service: "bamsignal", alive: true };
}

/**
 * Readiness is READY only when all CRITICAL registry services are configured and database is connected.
 * Important/optional integrations never fail readiness.
 */
export function isReadinessChecksReady(checks = {}) {
  return Boolean(checks.criticalReady && checks.databaseReady);
}

async function evaluateReadinessChecks() {
  const registry = getServiceRegistry();
  const readiness = await registry.isReady(process.env);
  const health = await registry.healthCheckAll(process.env);
  const databaseHealth = health.database;
  const database =
    databaseHealth?.ok === true
      ? "connected"
      : getDatabaseStatus() === "dry-run"
        ? "dry-run"
        : getDatabaseStatus();

  const features = registryFeatureSnapshot(process.env).map((service) => ({
    id: service.id,
    label: service.label,
    tier: service.tier,
    enabled: service.enabled,
    healthy: service.healthy,
    reason: service.reason
  }));

  return {
    database,
    databaseReady: database === "connected",
    criticalReady: readiness.ready && Boolean(config.databaseUrl),
    features
  };
}

export async function isProductionReady() {
  const checks = await evaluateReadinessChecks();
  return isReadinessChecksReady(checks);
}

export async function readinessPayload(options = {}) {
  const checks = await evaluateReadinessChecks();
  const ready = isReadinessChecksReady(checks);
  const validation = getStartupValidation();
  const registry = getServiceRegistry();

  if (!options.detailed) {
    return {
      ok: ready,
      service: "bamsignal",
      ready
    };
  }

  const schemaStatus = config.databaseUrl ? await checkSchema({ force: true }) : null;
  const adminHealth = await buildRegistryAdminHealthSnapshot(process.env);

  return {
    ok: ready,
    service: "bamsignal",
    ready,
    mode: validation?.mode,
    database: checks.database,
    databaseError: getDatabaseError() || undefined,
    schema: schemaStatus
      ? {
          ok: schemaStatus.ok,
          reason: schemaStatus.reason,
          missing: schemaStatus.missing?.length ? schemaStatus.missing : undefined
        }
      : undefined,
    features: registryFeatureSnapshot(process.env).map((feature) => ({
      id: feature.id,
      label: feature.label,
      tier: feature.tier,
      enabled: feature.enabled,
      healthy: feature.healthy,
      featureState: feature.featureState,
      reason: feature.reason,
      metrics: feature.metrics
    })),
    integrations: registryFeatureSnapshot(process.env).map((feature) => ({
      id: feature.id,
      label: feature.label,
      tier: feature.tier,
      enabled: feature.enabled,
      healthy: feature.healthy,
      reason: feature.reason
    })),
    registry: {
      services: registry.snapshot(process.env),
      timing: registry.startupTimingReport()
    },
    enabledFeatures: validation?.enabledFeatures,
    disabledFeatures: validation?.disabledFeatures,
    paystack: adminHealth.paystack,
    resend: adminHealth.resend,
    signupEmail: adminHealth.signupEmail,
    sendchamp: adminHealth.sendchamp,
    firebase: adminHealth.firebase,
    photoStorage: adminHealth.photoStorage,
    telegram: adminHealth.telegram,
    ...getFirebaseHealth()
  };
}
