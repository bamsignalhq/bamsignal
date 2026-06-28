import { config } from "../config.js";
import { checkSchema, getDatabaseError, getDatabaseStatus, pingDatabase } from "../db.js";
import { getFirebaseHealth } from "../firebase.js";
import { featureSnapshot, getRegisteredFeatures, getStartupValidation } from "./startupBootstrap.js";

export function livenessPayload() {
  return { ok: true, service: "bamsignal", alive: true };
}

/**
 * Readiness is READY only when all CRITICAL features are configured and database is connected.
 * Important/optional integrations never fail readiness.
 */
export function isReadinessChecksReady(checks = {}) {
  return Boolean(checks.criticalReady && checks.databaseReady);
}

async function evaluateReadinessChecks() {
  let database = getDatabaseStatus();
  if (database === "connected") {
    const alive = await pingDatabase();
    database = alive ? "connected" : "disconnected";
  }

  const features = getRegisteredFeatures();
  const criticalFeatures = features.filter((f) => f.tier === "critical");
  const criticalReady = criticalFeatures.every((f) => f.enabled);

  return {
    database,
    databaseReady: database === "connected",
    criticalReady: criticalReady && Boolean(config.databaseUrl),
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

  if (!options.detailed) {
    return {
      ok: ready,
      service: "bamsignal",
      ready
    };
  }

  const schemaStatus = config.databaseUrl ? await checkSchema({ force: true }) : null;

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
    features: featureSnapshot(),
    integrations: featureSnapshot(),
    enabledFeatures: validation?.enabledFeatures,
    disabledFeatures: validation?.disabledFeatures,
    ...getFirebaseHealth()
  };
}
