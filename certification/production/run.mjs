#!/usr/bin/env node
/**
 * Production certification — single launch gate for Sprint 1.1.
 *
 * Usage: npm run certify:production
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRODUCTION_CERT_VERSION,
  buildProductionCertReport,
  evaluateEnvironmentCertification,
  runNpmScript,
  writeProductionCertReports
} from "../../shared/productionCertification.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, "certification/production/reports");

function main() {
  console.log(`\n=== Production Certification v${PRODUCTION_CERT_VERSION} ===\n`);
  const started = Date.now();
  const checks = [];

  const migrations = runNpmScript("certify:migrations");
  checks.push({ id: "migrations", label: "Migrations", ...migrations });

  const environment = evaluateEnvironmentCertification(process.env);
  checks.push({ id: "environment", label: "Environment", ...environment, durationMs: 0 });

  const lint = runNpmScript("lint");
  checks.push({ id: "lint", label: "Lint", ...lint });

  const typecheck = runNpmScript("typecheck");
  checks.push({ id: "typecheck", label: "Typecheck", ...typecheck });

  const build = runNpmScript("build");
  checks.push({ id: "build", label: "Build", ...build });

  const serverImport = runNpmScript("test:server-import");
  checks.push({ id: "server-import", label: "Server Import", ...serverImport });

  const sourceIntegrity = runNpmScript("test:source-integrity:web");
  checks.push({ id: "source-integrity", label: "Source Integrity", ...sourceIntegrity });

  const diagnostics = runNpmScript("test:diagnostics-access");
  checks.push({ id: "diagnostics", label: "Diagnostics", ...diagnostics });

  const readiness = runNpmScript("test:readiness-health");
  checks.push({ id: "readiness", label: "Readiness", ...readiness });

  const hardening = runNpmScript("test:production-hardening");
  checks.push({ id: "hardening", label: "Production Hardening", ...hardening });

  const authLifecycle = runNpmScript("test:auth-lifecycle");
  checks.push({ id: "auth-lifecycle", label: "Auth Lifecycle", ...authLifecycle });

  const financialCore = runNpmScript("test:financial-core");
  checks.push({ id: "financial-core", label: "Financial Core", ...financialCore });

  const fortress = runNpmScript("test:fortress");
  checks.push({ id: "fortress", label: "Fortress Suite", ...fortress });

  const report = buildProductionCertReport(checks, {
    profile: process.env.CERTIFICATION_PROFILE || "local"
  });
  report.durationMs = Date.now() - started;

  const paths = writeProductionCertReports(report, outputDir);

  console.log("");
  for (const section of report.sections) {
    console.log(`${section.status === "PASS" ? "✓" : "✕"} ${section.label} (${section.durationMs}ms)`);
  }
  console.log("");
  console.log(`Overall: ${report.status} — ${report.title}`);
  console.log(`Report: ${paths.mdPath}`);
  console.log(`JSON:   ${paths.jsonPath}`);
  console.log(`Manifest: ${paths.manifestJsonPath}`);
  console.log("");

  process.exit(report.passed ? 0 : 1);
}

main();
