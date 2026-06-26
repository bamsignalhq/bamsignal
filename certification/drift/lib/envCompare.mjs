import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DUPLICATE_GROUPS,
  ENV_REGISTRY,
  PLACEHOLDER_PATTERNS,
  registryForEnvironment
} from "../../../shared/environmentRegistry.mjs";

function parseEnvFile(content) {
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../../..");

export function loadEnvironmentMaps() {
  const examplePath = join(rootPath, ".env.example");
  const envPath = join(rootPath, ".env");
  const expected = existsSync(examplePath) ? parseEnvFile(readFileSync(examplePath, "utf8")) : {};
  const dotEnv = existsSync(envPath) ? parseEnvFile(readFileSync(envPath, "utf8")) : {};
  const current = { ...expected, ...dotEnv };

  for (const entry of ENV_REGISTRY) {
    const runtimeValue = process.env[entry.name];
    if (runtimeValue) current[entry.name] = runtimeValue;
    for (const alias of entry.aliases || []) {
      const aliasValue = process.env[alias];
      if (aliasValue) current[alias] = aliasValue;
    }
  }

  return { expected, current };
}

function isEmpty(value) {
  return !String(value ?? "").trim();
}

function isPlaceholder(value) {
  const v = String(value ?? "").trim();
  return PLACEHOLDER_PATTERNS.some((re) => re.test(v));
}

function validateRule(rule, value, target) {
  const v = String(value ?? "").trim();
  if (!v) return null;
  switch (rule) {
    case "url":
      try {
        const u = new URL(v);
        if (!/^https?:$/i.test(u.protocol)) return "invalid URL protocol";
      } catch {
        return "invalid URL";
      }
      return null;
    case "supabase-url":
      if (!/^https:\/\/.+\.supabase\.co\/?$/i.test(v) && !v.includes("127.0.0.1") && !v.includes("localhost")) {
        return "expected Supabase project URL";
      }
      return null;
    case "postgres-url":
      if (!/^postgres(ql)?:\/\//i.test(v)) return "expected postgres:// URL";
      return null;
    case "paystack-secret":
      if (!/^sk_(test|live)_/.test(v)) return "expected sk_test_ or sk_live_ prefix";
      if (target === "production" && v.startsWith("sk_test_")) return "test secret in production";
      return null;
    case "paystack-public":
      if (!/^pk_(test|live)_/.test(v)) return "expected pk_test_ or pk_live_ prefix";
      if (target === "production" && v.startsWith("pk_test_")) return "test public key in production";
      return null;
    case "resend-key":
      if (!/^re_/.test(v)) return "expected re_ prefix";
      return null;
    default:
      if (rule?.startsWith("enum:")) {
        const allowed = rule.slice(5).split(",");
        if (!allowed.includes(v)) return `expected one of ${allowed.join(", ")}`;
      }
      return null;
  }
}

export function compareEnvironmentTarget(target, envMap) {
  const registry = registryForEnvironment(target);
  const issues = [];

  for (const entry of registry) {
    const value = envMap[entry.name];
    if (entry.required === "critical" && isEmpty(value)) {
      issues.push({
        id: `missing-${entry.name}`,
        domainId: entry.group === "payments" ? "payment-configuration" : entry.group,
        title: "Missing secret",
        detail: `${entry.name} required for ${target} but unset.`,
        severity: "critical",
        compareTarget: target,
        variable: entry.name
      });
    }
    if (!isEmpty(value) && isPlaceholder(value)) {
      issues.push({
        id: `placeholder-${entry.name}`,
        domainId: "environment-variables",
        title: "Placeholder configuration",
        detail: `${entry.name} still uses a placeholder value.`,
        severity: "critical",
        compareTarget: target,
        variable: entry.name
      });
    }
    if (!isEmpty(value) && entry.validate) {
      const err = validateRule(entry.validate, value, target);
      if (err) {
        issues.push({
          id: `invalid-${entry.name}`,
          domainId: entry.group === "payments" ? "payment-configuration" : "environment-variables",
          title: "Configuration mismatch",
          detail: `${entry.name}: ${err}`,
          severity: target === "production" ? "critical" : "warning",
          compareTarget: target,
          variable: entry.name
        });
      }
    }
  }

  for (const group of DUPLICATE_GROUPS) {
    const present = group.variables.filter((name) => !isEmpty(envMap[name]));
    if (present.length < 2) continue;
    const values = [...new Set(present.map((name) => envMap[name]))];
    if (values.length > 1) {
      issues.push({
        id: `duplicate-${group.id}`,
        domainId: "environment-variables",
        title: "Configuration drift",
        detail: `Conflicting values across ${present.join(", ")}.`,
        severity: "critical",
        compareTarget: target,
        variable: group.canonical
      });
    }
  }

  const viteUrl = envMap.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const supUrl = envMap.SUPABASE_URL?.replace(/\/$/, "");
  if (viteUrl && supUrl && viteUrl !== supUrl) {
    issues.push({
      id: "supabase-url-mismatch",
      domainId: "supabase",
      title: "Supabase client/server drift",
      detail: "VITE_SUPABASE_URL and SUPABASE_URL reference different projects.",
      severity: "critical",
      compareTarget: target
    });
  }

  return issues;
}

export function compareExpectedVsCurrent(expected, current) {
  const issues = [];
  const registryNames = new Set(ENV_REGISTRY.map((entry) => entry.name));

  for (const entry of ENV_REGISTRY) {
    const expectedValue = expected[entry.name];
    const currentValue = current[entry.name];
    if (!isEmpty(expectedValue) && isEmpty(currentValue)) {
      issues.push({
        id: `expected-missing-${entry.name}`,
        domainId: "environment-variables",
        title: "Missing from current",
        detail: `${entry.name} documented in .env.example but absent in current environment.`,
        severity: entry.required === "critical" ? "critical" : "warning",
        compareTarget: "expected-vs-current",
        variable: entry.name
      });
    }
    if (!isEmpty(expectedValue) && !isEmpty(currentValue) && expectedValue !== currentValue) {
      issues.push({
        id: `value-drift-${entry.name}`,
        domainId: "environment-variables",
        title: "Unexpected drift",
        detail: `${entry.name} differs from .env.example baseline.`,
        severity: "warning",
        compareTarget: "expected-vs-current",
        variable: entry.name
      });
    }
  }

  const exampleKeys = existsSync(join(rootPath, ".env.example"))
    ? new Set(Object.keys(parseEnvFile(readFileSync(join(rootPath, ".env.example"), "utf8"))))
    : registryNames;

  for (const key of Object.keys(current)) {
    if (key.startsWith("npm_")) continue;
    if (registryNames.has(key)) continue;
    if (!exampleKeys.has(key)) {
      issues.push({
        id: `unused-secret-${key}`,
        domainId: "environment-variables",
        title: "Unused secret",
        detail: `${key} present in current environment but not in registry or .env.example.`,
        severity: "warning",
        compareTarget: "current",
        variable: key
      });
    }
  }

  return issues;
}

export function compareProductionVsStaging(current) {
  const productionIssues = compareEnvironmentTarget("production", current);
  const stagingIssues = compareEnvironmentTarget("staging", current);
  const issues = [];

  const prodPaystack = current.PAYSTACK_SECRET_KEY || "";
  const stagingOnly = stagingIssues.filter(
    (item) => !productionIssues.some((prod) => prod.id === item.id)
  );

  if (prodPaystack.startsWith("sk_test_")) {
    issues.push({
      id: "prod-paystack-test-key",
      domainId: "payment-configuration",
      title: "Production payment drift",
      detail: "PAYSTACK_SECRET_KEY uses test prefix in production comparison.",
      severity: "critical",
      compareTarget: "production"
    });
  }

  for (const item of stagingOnly.slice(0, 10)) {
    issues.push({
      ...item,
      compareTarget: "production-vs-staging",
      severity: item.severity === "critical" ? "warning" : item.severity
    });
  }

  return issues;
}
