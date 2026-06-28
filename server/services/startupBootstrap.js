/**
 * Enterprise startup bootstrap — validation, feature registration, production gate.
 */
import { validateEnterpriseStartup } from "../../shared/enterpriseStartupValidation.mjs";
import { evaluateAllFeatures } from "../../shared/environmentClassification.mjs";
import { printStartupReport } from "../../shared/startupReport.mjs";
import {
  resolveStartupMode,
  shouldEnforceCriticalSecrets
} from "../../shared/startupExecutionMode.mjs";

/** @type {import("../../shared/enterpriseStartupValidation.mjs").validateEnterpriseStartup extends (...args: any) => infer R ? R : never | null} */
let cachedValidation = null;
/** @type {ReturnType<typeof evaluateAllFeatures> | null} */
let cachedFeatures = null;

export function getStartupValidation() {
  return cachedValidation;
}

export function getRegisteredFeatures() {
  return cachedFeatures || evaluateAllFeatures(process.env);
}

/**
 * Run enterprise startup validation and print the single startup report.
 * Never calls process.exit — caller decides whether to abort before listen().
 * @returns {import("../../shared/enterpriseStartupValidation.mjs").validateEnterpriseStartup extends (...args: any) => infer R ? R : never}
 */
export function bootstrapStartup(env = process.env) {
  const mode = resolveStartupMode(env);
  const validation = validateEnterpriseStartup(env, { mode });
  const features = validation.features;
  cachedValidation = validation;
  cachedFeatures = features;

  if (mode !== "smoke-import") {
    printStartupReport(validation);
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
  return getRegisteredFeatures().map((feature) => ({
    id: feature.id,
    label: feature.label,
    tier: feature.tier,
    enabled: feature.enabled,
    healthy: feature.healthy,
    reason: feature.reason
  }));
}
