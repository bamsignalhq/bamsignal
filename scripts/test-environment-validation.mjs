#!/usr/bin/env node
/**
 * Environment validation tooling tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  certificationModeDescription,
  resolveCertificationExecutionMode
} from "../shared/certificationEnvironment.mjs";
import { buildEnvironmentDependencyReport } from "../shared/environmentDependencyReport.mjs";
import { ENV_USED_IN, ENV_REGISTRY, registryForEnvironment } from "../shared/environmentRegistry.mjs";
import { validateStartupEnvironment } from "../shared/environmentStartupValidation.mjs";
import { buildProductionEnvironmentAuditReport } from "../shared/productionEnvironmentAuditScan.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const auditSource = read("scripts/audit-production-environment.mjs");
assert(auditSource.includes("buildProductionEnvironmentAuditReport"), "production audit runner");
assert(auditSource.includes("buildStartupHealthVerification"), "startup health verification");

const scanSource = read("shared/productionEnvironmentAuditScan.mjs");
assert(scanSource.includes("scanEnvironmentUsage"), "environment usage scan");
assert(scanSource.includes("renderCleanupReportMarkdown"), "cleanup report");

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts["audit:production-environment"], "audit:production-environment script");
assert(packageJson.scripts["validate:environment"], "validate:environment script");

for (const file of [
  ".env.development",
  ".env.staging",
  ".env.production.example",
  "shared/certificationEnvironment.mjs",
  "shared/environmentConnectivity.mjs",
  "shared/environmentStartupValidation.mjs",
  "shared/environmentDependencyReport.mjs",
  "shared/loadCertificationEnv.mjs",
  "shared/productionEnvironmentAuditScan.mjs",
  "scripts/audit-production-environment.mjs"
]) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

assert(resolveCertificationExecutionMode({}) === "dry-run", "dry-run without DATABASE_URL");
assert(
  resolveCertificationExecutionMode({ DATABASE_URL: "postgres://x", ENV_TARGET: "staging" }) === "staging",
  "staging with database"
);
assert(
  resolveCertificationExecutionMode({
    DATABASE_URL: "postgres://x",
    ENV_TARGET: "production",
    PUBLIC_APP_URL: "https://bamsignal.com"
  }) === "production",
  "production mode"
);
assert(certificationModeDescription("dry-run").includes("Dry Run"), "dry-run description");

const registry = registryForEnvironment("staging");
assert(registry.length > 20, "staging registry entries");
assert(registry.some((entry) => entry.name === "DATABASE_URL"), "DATABASE_URL in staging registry");
assert(ENV_REGISTRY.some((entry) => entry.name === "OPENAI_API_KEY"), "OpenAI in registry");
assert(ENV_USED_IN.DATABASE_URL?.includes("server/db.js"), "DATABASE_URL usedIn");

const report = buildEnvironmentDependencyReport("staging");
assert(report.length === ENV_REGISTRY.length, "dependency report covers registry");
assert(report.every((row) => row.variable && row.group), "dependency rows complete");

const startup = validateStartupEnvironment({ nodeEnv: "development", env: {}, failFast: false });
assert(startup.errors.length === 0 || startup.target === "development", "development startup lenient");

const auditReport = buildProductionEnvironmentAuditReport(rootPath);
assert(auditReport.uniqueVariables > 80, "audit scan finds production variables");
assert(auditReport.summary.duplicateGroups.length >= 5, "duplicate group analysis");
assert(auditReport.cleanup.rename.length >= 4, "rename recommendations");

const validateSource = read("scripts/validate-environment.mjs");
assert(validateSource.includes("runConnectivityProbes"), "connectivity probes wired");
assert(validateSource.includes("remediation"), "remediation steps");
assert(validateSource.includes("dependencyReport"), "dependency report export");

const configSource = read("server/config.js");
assert(configSource.includes("validateStartupEnvironment"), "startup validation in config");

const databaseRun = read("certification/database/run.mjs");
assert(databaseRun.includes("executionMode"), "database cert execution mode");

if (failed > 0) {
  console.error(`\n${failed} environment validation test(s) failed.\n`);
  process.exit(1);
}

console.log("Environment validation tests passed.\n");
