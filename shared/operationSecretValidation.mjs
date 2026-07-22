/**
 * Operation secret validation — ADMIN_SECRET, DIAGNOSTICS_SECRET, CRON_SECRET.
 * Never logs secret values.
 */
import { PLACEHOLDER_PATTERNS } from "./environmentRegistry.mjs";

const OPERATION_SECRETS = [
  { name: "ADMIN_SECRET", envKey: "ADMIN_SECRET", tier: "critical" },
  { name: "DIAGNOSTICS_SECRET", envKey: "DIAGNOSTICS_SECRET", tier: "required" },
  { name: "CRON_SECRET", envKey: "CRON_SECRET", tier: "critical" }
];

function trim(value) {
  return String(value ?? "").trim();
}

function isEmpty(value) {
  return !trim(value);
}

function isPlaceholder(value) {
  const v = trim(value);
  return PLACEHOLDER_PATTERNS.some((re) => re.test(v));
}

function collectSecretValues(env) {
  return OPERATION_SECRETS.map((def) => ({
    ...def,
    value: trim(env[def.envKey])
  })).filter((entry) => !isEmpty(entry.value));
}

/**
 * @param {Record<string, string|undefined>} env
 * @param {{ mode?: string }} [options]
 */
export function validateOperationSecrets(env = process.env, options = {}) {
  const mode = String(options.mode || env.NODE_ENV || "development").toLowerCase();
  const productionLike = mode === "production" || mode === "staging";

  /** @type {Array<{ name: string, level: string, detail: string, remediation: string }>} */
  const critical = [];
  /** @type {Array<{ name: string, level: string, detail: string, remediation: string }>} */
  const warnings = [];

  for (const def of OPERATION_SECRETS) {
    const value = trim(env[def.envKey]);
    if (productionLike && def.tier === "critical" && isEmpty(value)) {
      critical.push({
        name: def.name,
        level: "critical",
        detail: `${def.name} is required in ${mode}`,
        remediation: `Set ${def.envKey} in runtime secrets before production startup.`
      });
    }
    if (productionLike && def.tier === "required" && isEmpty(value)) {
      warnings.push({
        name: def.name,
        level: "required",
        detail: `${def.name} is recommended in ${mode}`,
        remediation: `Set ${def.envKey} for diagnostics and readiness detail probes.`
      });
    }
    if (!isEmpty(value) && isPlaceholder(value)) {
      warnings.push({
        name: def.name,
        level: "required",
        detail: `${def.name} appears to be a placeholder value`,
        remediation: `Replace ${def.envKey} with a production-safe secret.`
      });
    }
  }

  const populated = collectSecretValues(env);
  const byValue = new Map();
  for (const entry of populated) {
    if (!byValue.has(entry.value)) byValue.set(entry.value, []);
    byValue.get(entry.value).push(entry.name);
  }

  for (const [_, names] of byValue) {
    if (names.length > 1) {
      critical.push({
        name: names.join(", "),
        level: "critical",
        detail: `Duplicate secret value across: ${names.join(", ")}`,
        remediation: "Use unique values for ADMIN_SECRET, DIAGNOSTICS_SECRET, and CRON_SECRET."
      });
    }
  }

  const adminSecret = trim(env.ADMIN_SECRET);
  const cronSecret = trim(env.CRON_SECRET);
  if (adminSecret && cronSecret && adminSecret === cronSecret) {
    critical.push({
      name: "ADMIN_SECRET, CRON_SECRET",
      level: "critical",
      detail: "ADMIN_SECRET must not equal CRON_SECRET",
      remediation: "Generate distinct secrets for admin automation and cron jobs."
    });
  }

  const diagnosticsSecret = trim(env.DIAGNOSTICS_SECRET);
  if (diagnosticsSecret && cronSecret && diagnosticsSecret === cronSecret && productionLike) {
    warnings.push({
      name: "DIAGNOSTICS_SECRET, CRON_SECRET",
      level: "required",
      detail: "DIAGNOSTICS_SECRET should be distinct from CRON_SECRET",
      remediation: "Use separate diagnostics and cron secrets in production."
    });
  }

  if (productionLike && adminSecret && !cronSecret) {
    warnings.push({
      name: "CRON_SECRET",
      level: "required",
      detail: "CRON_SECRET missing while ADMIN_SECRET is set",
      remediation: "Configure CRON_SECRET for scheduled job authentication."
    });
  }

  return {
    ok: critical.length === 0,
    critical,
    warnings,
    checked: OPERATION_SECRETS.map((d) => d.name),
    uniqueSecretCount: byValue.size,
    productionLike
  };
}
