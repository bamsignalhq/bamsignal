#!/usr/bin/env node
/**
 * Enterprise environment validation — missing vars, placeholders, connectivity, dependency report.
 *
 * Usage:
 *   npm run validate:environment
 *   npm run env:validate
 *   ENV_TARGET=staging npm run validate:environment
 *   node scripts/validate-environment.mjs --target staging --env-file .env.staging --connectivity
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildEnvironmentDependencyReport,
  dependencyReportMarkdown
} from "../shared/environmentDependencyReport.mjs";
import { runConnectivityProbes } from "../shared/environmentConnectivity.mjs";
import {
  DUPLICATE_GROUPS,
  ENV_REGISTRY,
  PLACEHOLDER_PATTERNS,
  registryForEnvironment
} from "../shared/environmentRegistry.mjs";
import { resolveCertificationExecutionMode, certificationModeDescription } from "../shared/certificationEnvironment.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const args = {
    target: process.env.ENV_TARGET || process.env.CERTIFICATION_TARGET || "development",
    envFile: process.env.ENV_PROFILE || ".env.staging",
    report: null,
    dependencyReport: join(root, "docs/operations/environment/dependency-report.json"),
    strict: false,
    connectivity: false
  };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--target" && argv[i + 1]) args.target = argv[++i];
    else if (argv[i] === "--env-file" && argv[i + 1]) args.envFile = argv[++i];
    else if (argv[i] === "--report" && argv[i + 1]) args.report = argv[++i];
    else if (argv[i] === "--dependency-report" && argv[i + 1]) args.dependencyReport = argv[++i];
    else if (argv[i] === "--strict") args.strict = true;
    else if (argv[i] === "--connectivity") args.connectivity = true;
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

function loadEnvMap(envFile, target) {
  const profileByTarget = {
    local: ".env.development",
    development: ".env.development",
    staging: ".env.staging",
    production: ".env.production.example",
    preview: ".env.staging"
  };
  const profilePath = profileByTarget[target] || envFile;
  const paths = [
    join(root, ".env.production.example"),
    join(root, profilePath),
    join(root, ".env.example"),
    join(root, ".env.local"),
    join(root, ".env")
  ];
  if (envFile && envFile !== profilePath) {
    paths.push(join(root, envFile));
  }

  const merged = {};
  const loadedFrom = [];
  for (const path of paths) {
    if (!existsSync(path)) continue;
    Object.assign(merged, parseEnvFile(readFileSync(path, "utf8")));
    loadedFrom.push(path.replace(`${root}/`, ""));
  }
  return { env: merged, loadedFrom };
}

function isEmpty(value) {
  return !String(value ?? "").trim();
}

function isPlaceholder(value) {
  const v = String(value ?? "").trim();
  return PLACEHOLDER_PATTERNS.some((re) => re.test(v));
}

function remediationFor(entry, code, target) {
  if (code === "missing") {
    if (entry.required === "critical") {
      return `Set ${entry.name} in .env.local or Coolify runtime. Profile: ${target === "production" ? ".env.production.example" : ".env.staging"}. See docs/operations/environment/required-secrets.md`;
    }
    return `Optional — configure ${entry.name} when enabling ${entry.group}.`;
  }
  if (code === "placeholder") {
    return `Replace placeholder in ${entry.name} with a real value (never commit secrets).`;
  }
  if (code === "invalid") {
    return `Fix format for ${entry.name} (rule: ${entry.validate || "format"}).`;
  }
  if (code === "connectivity") {
    return `Verify ${entry.group} credentials and network access for ${entry.name}.`;
  }
  if (code === "duplicate-conflict") {
    return `Align duplicate env aliases to one canonical value (${entry.name}).`;
  }
  return `Review ${entry.name} in shared/environmentRegistry.mjs.`;
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
    case "port":
      if (!/^\d+$/.test(v) || Number(v) < 1 || Number(v) > 65535) return "invalid port";
      return null;
    case "pin":
      if (!/^\d{4,8}$/.test(v)) return "PIN must be 4–8 digits";
      return null;
    case "openai-key":
      if (!/^sk-/.test(v)) return "expected sk- prefix";
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

async function main() {
  const args = parseArgs(process.argv);
  const target = args.target.toLowerCase();
  const { env: envMap, loadedFrom } = loadEnvMap(args.envFile, target);
  const registry = registryForEnvironment(target);
  const executionMode = resolveCertificationExecutionMode(envMap);

  /** @type {Array<{level:string,code:string,name?:string,detail:string,remediation?:string}>} */
  const findings = [];

  for (const entry of registry) {
    const value = envMap[entry.name];

    if (entry.required === "critical" && isEmpty(value)) {
      const level = target === "development" || target === "local" ? "warn" : "error";
      findings.push({
        level,
        code: "missing",
        name: entry.name,
        detail: `${entry.group} — required for ${target}${level === "warn" ? " (configure .env.local / .env.staging)" : ""}`,
        remediation: remediationFor(entry, "missing", target)
      });
      continue;
    }

    if (entry.required === "warning" && isEmpty(value) && args.strict) {
      findings.push({
        level: "warn",
        code: "missing-optional",
        name: entry.name,
        detail: `${entry.group} — recommended for ${target}`,
        remediation: remediationFor(entry, "missing", target)
      });
    }

    if (!isEmpty(value) && isPlaceholder(value)) {
      findings.push({
        level: "error",
        code: "placeholder",
        name: entry.name,
        detail: "placeholder value",
        remediation: remediationFor(entry, "placeholder", target)
      });
    }
    if (!isEmpty(value) && entry.validate) {
      const err = validateRule(entry.validate, value, target);
      if (err) {
        findings.push({
          level: "error",
          code: "invalid",
          name: entry.name,
          detail: err,
          remediation: remediationFor(entry, "invalid", target)
        });
      }
    }
    const drift = productionUrlDrift(entry.name, value, target);
    if (drift) {
      findings.push({
        level: "error",
        code: "drift",
        name: entry.name,
        detail: drift,
        remediation: `Use production URLs for ${entry.name} in production target.`
      });
    }
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
        detail: `conflicting values across ${present.join(", ")}`,
        remediation: remediationFor({ name: group.canonical, group: "duplicate" }, "duplicate-conflict", target)
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
      detail: "VITE_SUPABASE_URL and SUPABASE_URL differ — client/server project mismatch",
      remediation: "Set SUPABASE_URL to match VITE_SUPABASE_URL for the same Supabase project."
    });
  }

  let connectivity = [];
  if (args.connectivity || process.env.ENV_VALIDATE_CONNECTIVITY === "1") {
    connectivity = await runConnectivityProbes(envMap);
    for (const probe of connectivity) {
      if (probe.skipped) continue;
      if (!probe.ok) {
        findings.push({
          level: probe.name === "DATABASE_URL" && executionMode !== "dry-run" ? "error" : "warn",
          code: "connectivity",
          name: probe.name,
          detail: `${probe.group}: ${probe.detail}`,
          remediation: remediationFor({ name: probe.name, group: probe.group }, "connectivity", target)
        });
      }
    }
  }

  const dependencyRows = buildEnvironmentDependencyReport(target);
  const dependencyMd = dependencyReportMarkdown(dependencyRows, target);

  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warn");

  const readinessScore =
    errors.length === 0
      ? warnings.length === 0
        ? 100
        : Math.max(70, 100 - warnings.length * 2)
      : Math.max(0, 100 - errors.length * 8 - warnings.length * 2);

  const report = {
    at: new Date().toISOString(),
    target,
    executionMode,
    executionModeDescription: certificationModeDescription(executionMode),
    envFilesLoaded: loadedFrom,
    envFile: args.envFile,
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      checked: registry.length,
      readinessScore,
      status: errors.length ? "fail" : warnings.length ? "warn" : "pass"
    },
    connectivity,
    dependencyReport: dependencyRows,
    findings: findings.map(({ name, code, detail, level, remediation }) => ({
      level,
      code,
      name,
      detail,
      remediation
    }))
  };

  console.log(`\n[bamsignal] Environment validation — target: ${target}`);
  console.log(`  execution mode: ${executionMode} (${certificationModeDescription(executionMode)})`);
  console.log(`  loaded: ${loadedFrom.join(", ") || "(none)"}`);
  console.log(`  checked: ${report.summary.checked} registry entries`);
  console.log(`  readiness: ${readinessScore}%`);
  console.log(`  errors:  ${report.summary.errors}`);
  console.log(`  warnings: ${report.summary.warnings}`);
  console.log(`  status:  ${report.summary.status.toUpperCase()}\n`);

  if (errors.length) {
    console.log("Errors (names only — values never printed):");
    for (const f of errors) {
      console.log(`  - ${f.name}: [${f.code}] ${f.detail}`);
      if (f.remediation) console.log(`    → ${f.remediation}`);
    }
    console.log("");
  }
  if (warnings.length) {
    console.log("Warnings:");
    for (const f of warnings.slice(0, 25)) {
      console.log(`  - ${f.name}: [${f.code}] ${f.detail}`);
      if (f.remediation) console.log(`    → ${f.remediation}`);
    }
    if (warnings.length > 25) console.log(`  … and ${warnings.length - 25} more`);
    console.log("");
  }

  if (connectivity.length) {
    console.log("Connectivity:");
    for (const probe of connectivity) {
      const status = probe.skipped ? "SKIP" : probe.ok ? "OK" : "FAIL";
      console.log(`  - ${probe.name}: ${status} — ${probe.detail}`);
    }
    console.log("");
  }

  const outPath = args.report || join(root, "play-store", "environment-validation-report.json");
  try {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`Report: ${outPath.replace(`${root}/`, "")}`);
  } catch {
    /* optional */
  }

  if (args.dependencyReport) {
    try {
      mkdirSync(dirname(args.dependencyReport), { recursive: true });
      writeFileSync(args.dependencyReport, `${JSON.stringify({ target, rows: dependencyRows }, null, 2)}\n`, "utf8");
      const mdPath = args.dependencyReport.replace(/\.json$/, ".md");
      writeFileSync(mdPath, `${dependencyMd}\n`, "utf8");
      console.log(`Dependency report: ${args.dependencyReport.replace(`${root}/`, "")}`);
    } catch {
      /* optional */
    }
  }

  console.log("");

  if (errors.length) process.exit(1);
}

main().catch((error) => {
  console.error("Environment validation failed:", error);
  process.exit(1);
});
