#!/usr/bin/env node
/**
 * Validate environment configuration without printing secret values.
 *
 * Usage:
 *   npm run env:validate
 *   ENV_TARGET=production npm run env:validate
 *   node scripts/validate-environment.mjs --target staging --env-file .env
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DUPLICATE_GROUPS,
  ENV_REGISTRY,
  PLACEHOLDER_PATTERNS,
  registryForEnvironment
} from "../shared/environmentRegistry.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const args = { target: process.env.ENV_TARGET || process.env.NODE_ENV || "production", envFile: ".env", report: null, strict: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--target" && argv[i + 1]) args.target = argv[++i];
    else if (argv[i] === "--env-file" && argv[i + 1]) args.envFile = argv[++i];
    else if (argv[i] === "--report" && argv[i + 1]) args.report = argv[++i];
    else if (argv[i] === "--strict") args.strict = true;
  }
  return args;
}

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

function loadEnvMap(envFile) {
  const paths = [join(root, envFile), join(root, ".env.example")];
  const merged = {};
  for (const path of paths) {
    if (!existsSync(path)) continue;
    Object.assign(merged, parseEnvFile(readFileSync(path, "utf8")));
  }
  if (existsSync(join(root, ".env"))) {
    Object.assign(merged, parseEnvFile(readFileSync(join(root, ".env"), "utf8")));
  }
  if (existsSync(join(root, envFile)) && envFile !== ".env") {
    Object.assign(merged, parseEnvFile(readFileSync(join(root, envFile), "utf8")));
  }
  return merged;
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
        return "expected Supabase project URL (*.supabase.co)";
      }
      return null;
    case "postgres-url":
      if (!/^postgres(ql)?:\/\//i.test(v)) return "expected postgres:// URL";
      return null;
    case "paystack-secret":
      if (!/^sk_(test|live)_/.test(v)) return "expected sk_test_ or sk_live_ prefix";
      if (target === "production" && v.startsWith("sk_test_")) return "test secret in production target";
      return null;
    case "paystack-public":
      if (!/^pk_(test|live)_/.test(v)) return "expected pk_test_ or pk_live_ prefix";
      if (target === "production" && v.startsWith("pk_test_")) return "test public key in production target";
      return null;
    case "resend-key":
      if (!/^re_/.test(v)) return "expected re_ prefix";
      return null;
    case "supabase-anon":
      if (v.length < 20 && !v.startsWith("eyJ")) return "anon key format suspicious";
      return null;
    case "supabase-service":
      if (!v.startsWith("eyJ") && !v.startsWith("sb_secret_")) return "service key format suspicious";
      return null;
    case "boolean":
      if (!/^(true|false|1|0)$/i.test(v)) return "expected boolean";
      return null;
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.split("<").pop()?.replace(">", "").trim() || v)) {
        return "invalid email";
      }
      return null;
    case "deep-link-scheme":
      if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) return "expected custom URL scheme";
      return null;
    case "json":
      try {
        JSON.parse(v);
      } catch {
        return "invalid JSON";
      }
      return null;
    default:
      if (rule?.startsWith("enum:")) {
        const allowed = rule.slice(5).split(",");
        if (!allowed.includes(v)) return `expected one of ${allowed.join(", ")}`;
      }
      return null;
  }
}

function productionUrlDrift(name, value, target) {
  if (target !== "production") return null;
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return null;
  if (name.includes("URL") && (v.includes("localhost") || v.includes("127.0.0.1") || v.includes(".local"))) {
    return "localhost/local URL in production target";
  }
  if (name === "PUBLIC_APP_URL" && !v.includes("bamsignal.com")) {
    return "production PUBLIC_APP_URL should use bamsignal.com";
  }
  return null;
}

function main() {
  const args = parseArgs(process.argv);
  const target = args.target.toLowerCase();
  const envMap = loadEnvMap(args.envFile);
  const registry = registryForEnvironment(target);

  /** @type {Array<{level:string,code:string,name?:string,detail:string}>} */
  const findings = [];

  for (const entry of registry) {
    const value = envMap[entry.name];
    const required = entry.required === "critical" || (args.strict && entry.required === "warning");

    if (required && isEmpty(value)) {
      findings.push({ level: "error", code: "missing", name: entry.name, detail: `${entry.group} — required for ${target}` });
      continue;
    }
    if (!isEmpty(value) && isPlaceholder(value)) {
      findings.push({ level: "error", code: "placeholder", name: entry.name, detail: "placeholder value" });
    }
    if (!isEmpty(value) && entry.validate) {
      const err = validateRule(entry.validate, value, target);
      if (err) findings.push({ level: "error", code: "invalid", name: entry.name, detail: err });
    }
    const drift = productionUrlDrift(entry.name, value, target);
    if (drift) findings.push({ level: "error", code: "drift", name: entry.name, detail: drift });
  }

  for (const group of DUPLICATE_GROUPS) {
    const present = group.variables.filter((name) => !isEmpty(envMap[name]));
    if (present.length < 2) continue;
    const values = [...new Set(present.map((name) => envMap[name]))];
    if (values.length > 1) {
      findings.push({
        level: "error",
        code: "duplicate-conflict",
        name: group.canonical,
        detail: `conflicting values across ${present.join(", ")}`
      });
    }
  }

  const viteUrl = envMap.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const supUrl = envMap.SUPABASE_URL?.replace(/\/$/, "");
  if (viteUrl && supUrl && viteUrl !== supUrl && target === "production") {
    findings.push({
      level: "error",
      code: "drift",
      name: "SUPABASE_URL",
      detail: "VITE_SUPABASE_URL and SUPABASE_URL differ — client/server project mismatch"
    });
  }

  const examplePath = join(root, ".env.example");
  if (existsSync(examplePath)) {
    const exampleKeys = new Set(Object.keys(parseEnvFile(readFileSync(examplePath, "utf8"))));
    for (const key of Object.keys(envMap)) {
      if (!exampleKeys.has(key) && !key.startsWith("npm_")) {
        findings.push({ level: "warn", code: "unknown", name: key, detail: "not documented in .env.example" });
      }
    }
  }

  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warn");

  const report = {
    at: new Date().toISOString(),
    target,
    envFile: args.envFile,
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      checked: registry.length,
      status: errors.length ? "fail" : warnings.length ? "warn" : "pass"
    },
    findings: findings.map(({ name, code, detail, level }) => ({ level, code, name, detail }))
  };

  console.log(`\n[bamsignal] Environment validation — target: ${target}`);
  console.log(`  checked: ${report.summary.checked} registry entries`);
  console.log(`  errors:  ${report.summary.errors}`);
  console.log(`  warnings: ${report.summary.warnings}`);
  console.log(`  status:  ${report.summary.status.toUpperCase()}\n`);

  if (errors.length) {
    console.log("Errors (names only — values never printed):");
    for (const f of errors) {
      console.log(`  - ${f.name}: [${f.code}] ${f.detail}`);
    }
    console.log("");
  }
  if (warnings.length && warnings.length <= 20) {
    console.log("Warnings:");
    for (const f of warnings.slice(0, 20)) {
      console.log(`  - ${f.name}: [${f.code}] ${f.detail}`);
    }
    console.log("");
  }

  const outPath = args.report || join(root, "play-store", "environment-validation-report.json");
  try {
    writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`Report: ${outPath.replace(`${root}/`, "")}\n`);
  } catch {
    /* optional report path */
  }

  if (errors.length) process.exit(1);
}

main();
