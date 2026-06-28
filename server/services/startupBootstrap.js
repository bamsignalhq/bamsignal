/**
 * Enterprise startup bootstrap — validation, service registry registration, production gate.
 */
import { validateEnterpriseStartup } from "../../shared/enterpriseStartupValidation.mjs";
import { evaluateAllFeatures } from "../../shared/environmentClassification.mjs";
import { printStartupReport } from "../../shared/startupReport.mjs";
import {
  resolveStartupMode,
  shouldEnforceCriticalSecrets
} from "../../shared/startupExecutionMode.mjs";
import {
  getServiceRegistry,
  initializeServiceRegistry,
  registryFeatureSnapshot
} from "./serviceRegistry.js";

/** @type {import("../../shared/enterpriseStartupValidation.mjs").validateEnterpriseStartup extends (...args: any) => infer R ? R : never | null} */
let cachedValidation = null;
/** @type {ReturnType<typeof evaluateAllFeatures> | null} */
let cachedFeatures = null;

export function getStartupValidation() {
  return cachedValidation;
}

export function getRegisteredFeatures() {
  if (cachedFeatures) return cachedFeatures;
  const registryFeatures = registryFeatureSnapshot(process.env);
  if (registryFeatures.length) {
    return registryFeatures.map((service) => ({
      id: service.id,
      label: service.label,
      tier: service.tier,
      enabled: service.enabled,
      healthy: service.healthy,
      reason: service.reason
    }));
  }
  return evaluateAllFeatures(process.env);
}

/**
 * Validate environment and register services (no initialize).
 * @returns {import("../../shared/enterpriseStartupValidation.mjs").validateEnterpriseStartup extends (...args: any) => infer R ? R : never}
 */
export function bootstrapStartupValidation(env = process.env) {
  const mode = resolveStartupMode(env);
  const validation = validateEnterpriseStartup(env, { mode });
  cachedValidation = validation;
  cachedFeatures = validation.features;
  getServiceRegistry();
  return validation;
}

/**
 * Initialize registered services after migrations.
 * @param {Record<string, string|undefined>} [env]
 */
export async function bootstrapServiceRegistry(env = process.env) {
  const initResult = await initializeServiceRegistry(env);
  if (!initResult.ok && initResult.results?.length) {
    for (const item of initResult.results) {
      if (!item.ok) {
        console.warn(`[bamsignal] Service init failed: ${item.id} — ${item.reason || "unknown"}`);
      }
    }
  }
  return initResult;
}

/**
 * Run validation, print startup report. Service initialize is separate (post-migration).
 */
export async function bootstrapStartup(env = process.env) {
  const validation = bootstrapStartupValidation(env);
  const mode = resolveStartupMode(env);

  if (mode !== "smoke-import") {
    printStartupReport(validation, getServiceRegistry().startupTimingReport());
  }

  return validation;
}

/**
 * Complete startup: validate, initialize registry, print report with timing.
 */
export async function bootstrapStartupWithRegistry(env = process.env) {
  const validation = bootstrapStartupValidation(env);
  const mode = resolveStartupMode(env);
  await bootstrapServiceRegistry(env);

  if (mode !== "smoke-import") {
    printStartupReport(validation, getServiceRegistry().startupTimingReport());
  }

  return validation;
}

/**
 * Production gate — exit before listen when critical secrets missing.
 * @returns {boolean} true if startup may continue
 */
export function enforceProductionStartupGate(validation = cachedValidation) {
  if (!validation) return true;
  if (!shouldEnforceCriticalSecrets(process.env)) return true;
  if (validation.ok) return true;
  console.error(
    "[bamsignal] Production startup blocked — configure all CRITICAL integrations before accepting traffic."
  );
  process.exit(1);
}

export function featureSnapshot() {
  return registryFeatureSnapshot(process.env).map((feature) => ({
    id: feature.id,
    label: feature.label,
    tier: feature.tier,
    enabled: feature.enabled,
    healthy: feature.healthy,
    featureState: feature.featureState,
    reason: feature.reason,
    metrics: feature.metrics
  }));
}
