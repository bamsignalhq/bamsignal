/**
 * Enterprise startup validation engine — returns structured data only (never exits).
 */
import { PLACEHOLDER_PATTERNS } from "./environmentRegistry.mjs";
import {
  DEVELOPMENT_ONLY_ENV,
  evaluateAllFeatures,
  STARTUP_FEATURE_DEFINITIONS
} from "./environmentClassification.mjs";
import { resolveStartupMode } from "./startupExecutionMode.mjs";

function isEmpty(value) {
  return !String(value ?? "").trim();
}

function isPlaceholder(value) {
  const v = String(value ?? "").trim();
  return PLACEHOLDER_PATTERNS.some((re) => re.test(v));
}

/**
 * @param {Record<string, string|undefined>} env
 * @param {{ mode?: string }} [options]
 */
export function validateEnterpriseStartup(env = process.env, options = {}) {
  const mode = options.mode || resolveStartupMode(env);
  const features = evaluateAllFeatures(env);
  const smokeMode = mode === "smoke" || mode === "smoke-import";

  /** @type {Array<{ feature: string, tier: string, reason: string }>} */
  const critical = [];
  /** @type {Array<{ feature: string, tier: string, reason: string }>} */
  const important = [];
  /** @type {Array<{ feature: string, tier: string, reason: string }>} */
  const optional = [];
  /** @type {Array<{ name: string, detail: string }>} */
  const warnings = [];
  /** @type {string[]} */
  const missing = [];
  /** @type {string[]} */
  const enabledFeatures = [];
  /** @type {string[]} */
  const disabledFeatures = [];

  for (const feature of features) {
    const entry = { feature: feature.label, tier: feature.tier, reason: feature.reason };
    const listName = feature.label;
    if (feature.enabled) {
      enabledFeatures.push(listName);
    } else {
      disabledFeatures.push(listName);
      for (const name of STARTUP_FEATURE_DEFINITIONS.find((d) => d.id === feature.id)?.requiredEnv ||
        []) {
        if (isEmpty(env[name])) missing.push(name);
      }
    }

    if (feature.tier === "critical" && !feature.enabled && !smokeMode && mode === "production") {
      critical.push(entry);
    } else if (feature.tier === "important" && !feature.enabled) {
      important.push(entry);
    } else if (feature.tier === "optional" && !feature.enabled) {
      optional.push(entry);
    }
  }

  for (const name of DEVELOPMENT_ONLY_ENV) {
    if (!isEmpty(env[name])) {
      warnings.push({ name, detail: "development-only variable present" });
    }
  }

  for (const feature of features) {
    for (const name of STARTUP_FEATURE_DEFINITIONS.find((d) => d.id === feature.id)?.requiredEnv ||
      []) {
      const value = env[name];
      if (!isEmpty(value) && isPlaceholder(value)) {
        warnings.push({ name, detail: "placeholder value detected" });
      }
    }
  }

  const ok = smokeMode || mode === "development" ? true : critical.length === 0;

  return {
    ok,
    mode,
    critical,
    important,
    optional,
    warnings,
    missing: [...new Set(missing)],
    enabledFeatures: [...new Set(enabledFeatures)],
    disabledFeatures: [...new Set(disabledFeatures)],
    features
  };
}

/**
 * Backwards-compatible wrapper for legacy validateStartupEnvironment callers.
 * @param {{ nodeEnv?: string, env?: Record<string, string|undefined>, failFast?: boolean, mode?: string }} options
 */
export function validateStartupEnvironment(options = {}) {
  const env = options.env || {};
  const mode =
    options.mode ||
    (options.failFast === false
      ? "development"
      : String(options.nodeEnv || env.NODE_ENV || "development").toLowerCase() === "production"
        ? "production"
        : "development");
  const result = validateEnterpriseStartup(env, { mode });
  return {
    target: mode === "production" ? "production" : "development",
    failFast: mode === "production",
    errors: result.critical.map((item) => ({
      level: "error",
      name: item.feature,
      detail: item.reason,
      remediation: `Configure ${item.feature} before production startup.`
    })),
    warnings: [
      ...result.important.map((item) => ({
        level: "warn",
        name: item.feature,
        detail: item.reason,
        remediation: `Optional integration — enable ${item.feature} when needed.`
      })),
      ...result.optional.map((item) => ({
        level: "warn",
        name: item.feature,
        detail: item.reason,
        remediation: `Optional integration — enable ${item.feature} when needed.`
      }))
    ],
    shouldExit: false,
    enterprise: result
  };
}

/** @param {ReturnType<typeof validateStartupEnvironment>} result */
export function logStartupValidation(result) {
  void result;
}
