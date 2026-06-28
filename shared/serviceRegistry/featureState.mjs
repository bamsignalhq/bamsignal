/**
 * Feature state helpers — enabled / disabled / unavailable.
 */
import { evaluateFeature, STARTUP_FEATURE_DEFINITIONS } from "../environmentClassification.mjs";

/**
 * @param {string} featureId
 * @param {Record<string, string|undefined>} env
 * @returns {'disabled'|'enabled'}
 */
export function featureStateFromClassification(featureId, env = process.env) {
  const definition = STARTUP_FEATURE_DEFINITIONS.find((item) => item.id === featureId);
  if (!definition) {
    return "disabled";
  }
  const evaluated = evaluateFeature(definition, env);
  return evaluated.enabled ? "enabled" : "disabled";
}

/**
 * @param {string} featureId
 * @param {Record<string, string|undefined>} env
 * @returns {'disabled'|'enabled'|'unavailable'}
 */
export function resolveRegistryFeatureState(featureId, env = process.env, runtimeOk = true) {
  const base = featureStateFromClassification(featureId, env);
  if (base === "disabled") return "disabled";
  return runtimeOk ? "enabled" : "unavailable";
}
