import { DUPLICATE_GROUPS, ENV_REGISTRY, PLACEHOLDER_PATTERNS, registryForEnvironment } from "./environmentRegistry.mjs";

function isEmpty(value) {
  return !String(value ?? "").trim();
}

function isPlaceholder(value) {
  const v = String(value ?? "").trim();
  return PLACEHOLDER_PATTERNS.some((re) => re.test(v));
}

/**
 * @param {{ nodeEnv?: string, env?: Record<string, string|undefined>, failFast?: boolean }} options
 */
export function validateStartupEnvironment(options = {}) {
  const nodeEnv = String(options.nodeEnv || options.env?.NODE_ENV || "development").toLowerCase();
  const env = options.env || {};
  const target =
    nodeEnv === "production" ? "production" : nodeEnv === "test" ? "local" : "development";
  const registry = registryForEnvironment(target);
  const failFast = options.failFast ?? nodeEnv === "production";

  /** @type {Array<{ level: "error"|"warn", name: string, detail: string, remediation: string }>} */
  const findings = [];

  for (const entry of registry) {
    const value = env[entry.name];
    const mandatory = entry.required === "critical";

    if (mandatory && isEmpty(value)) {
      findings.push({
        level: "error",
        name: entry.name,
        detail: `${entry.group} — required for ${target}`,
        remediation: `Set ${entry.name} in Coolify runtime secrets or ${target === "development" ? ".env.local / .env.staging" : "production environment"}. See docs/operations/environment/required-secrets.md`
      });
      continue;
    }

    if (!isEmpty(value) && isPlaceholder(value)) {
      findings.push({
        level: "error",
        name: entry.name,
        detail: "placeholder value detected",
        remediation: `Replace ${entry.name} with a real credential — never commit secrets to git.`
      });
    }

    if (!mandatory && isEmpty(value) && entry.required === "warning") {
      findings.push({
        level: "warn",
        name: entry.name,
        detail: `${entry.group} integration not configured`,
        remediation: entry.group === "google-calendar" || entry.group === "zoom" || entry.group === "google-meet"
          ? `Optional for Signal Concierge — configure ${entry.name} when enabling meetings.`
          : `Set ${entry.name} when enabling ${entry.group} features.`
      });
    }
  }

  for (const group of DUPLICATE_GROUPS) {
    const present = group.variables.filter((name) => !isEmpty(env[name]));
    if (present.length < 2) continue;
    const values = [...new Set(present.map((name) => env[name]))];
    if (values.length > 1) {
      findings.push({
        level: "error",
        name: group.canonical,
        detail: `Conflicting values across ${present.join(", ")}`,
        remediation: `Use one canonical variable (${group.canonical}) and remove duplicates.`
      });
    }
  }

  const errors = findings.filter((item) => item.level === "error");
  const warnings = findings.filter((item) => item.level === "warn");

  return {
    target,
    failFast,
    errors,
    warnings,
    shouldExit: failFast && errors.length > 0
  };
}

/**
 * Log startup validation results (never prints secret values).
 * @param {{ errors: Array, warnings: Array, shouldExit?: boolean }} result
 */
export function logStartupValidation(result) {
  for (const item of result.errors) {
    console.error(`[bamsignal] env error: ${item.name} — ${item.detail}`);
    console.error(`[bamsignal] remediation: ${item.remediation}`);
  }
  for (const item of result.warnings.slice(0, 12)) {
    console.warn(`[bamsignal] env warn: ${item.name} — ${item.detail}`);
  }
  if (result.warnings.length > 12) {
    console.warn(`[bamsignal] env warn: …and ${result.warnings.length - 12} more optional integration warnings`);
  }
}
