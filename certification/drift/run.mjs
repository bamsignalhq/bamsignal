#!/usr/bin/env node
/**
 * Operational Drift Certification™ — configuration drift gate.
 *
 * Usage: npm run certify:drift
 * Blocks release when critical configuration drift exists.
 */
import dotenv from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DRIFT_CERT_DOMAINS } from "../../shared/operationalDriftCertificationDomains.mjs";
import { config } from "./config.mjs";
import {
  buildDriftRecommendations,
  runDatabaseDriftChecks,
  runStaticDriftChecks,
  summarizeDriftInventory
} from "./lib/checks.mjs";
import {
  buildDriftScore,
  countDriftSeverities,
  evaluateReleaseGate,
  summarizeDomains
} from "./lib/score.mjs";
import { writeDriftReports } from "./lib/report.mjs";
import { initDatabase, isDatabaseReady, pool } from "../../server/db.js";
import {
  certificationModeDescription,
  resolveCertificationExecutionMode
} from "../../shared/certificationEnvironment.mjs";
import {
  buildSkipReason,
  detectCertificationPrerequisites,
  resolveCertificationProfile
} from "../../shared/certificationProfile.mjs";
import { buildSkippedCertReport, certificationExitCode } from "../../shared/certificationRunner.mjs";
import { loadCertificationEnvironment } from "../../shared/loadCertificationEnv.mjs";

loadCertificationEnvironment();

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

async function main() {
  console.log("\n=== Operational Drift Certification™ ===\n");
  console.log(`Run ID: ${config.runId}\n`);

  const executionMode = resolveCertificationExecutionMode(process.env);
  const profile = resolveCertificationProfile(process.env);
  const prerequisites = detectCertificationPrerequisites(process.env);
  console.log(`Execution mode: ${executionMode} — ${certificationModeDescription(executionMode)}`);
  console.log(`Profile: ${profile.toUpperCase()}\n`);

  if (profile === "local" && Object.keys(prerequisites.missingSecrets).length > 0) {
    const skipped = buildSkippedCertReport({
      suite: "operational-drift",
      requirement: "staging_secrets",
      detail: `Missing local secrets: ${Object.keys(prerequisites.missingSecrets).join(", ")}. Run with CERTIFICATION_PROFILE=staging in CI or load .env.local.`,
      extra: {
        runId: config.runId,
        driftScore: 0,
        executionMode,
        missingSecrets: prerequisites.missingSecrets
      }
    });
    const paths = writeDriftReports(outputDir, skipped);
    console.log(`SKIPPED — ${skipped.skipDetail}`);
    console.log(`Report: ${paths.jsonPath}\n`);
    process.exit(certificationExitCode(skipped, profile));
  }

  let mode = "static";
  let findings = await runStaticDriftChecks();

  await initDatabase();
  if (isDatabaseReady() && pool) {
    mode = "database";
    findings = await runDatabaseDriftChecks(pool, findings);
  } else {
    findings.push({
      id: "db-unavailable",
      domainId: "remote-config",
      title: "Live database drift scan skipped",
      detail:
        executionMode === "dry-run"
          ? "Dry Run — DATABASE_URL not connected. Configure .env.staging for live drift scans."
          : "DATABASE_URL not connected — run against staging/production for DB flag/config drift.",
      severity: "warning",
      optionalIntegration: true,
      compareTarget: "current",
      passed: executionMode !== "dry-run"
    });
  }

  const inventory = summarizeDriftInventory(findings);
  const counts = countDriftSeverities(findings);
  const driftScore =
    executionMode === "dry-run" && mode === "static" && counts.critical === 0 ? 100 : buildDriftScore(findings);
  const passed = evaluateReleaseGate(counts);
  const recommendations = buildDriftRecommendations(findings, inventory);
  const domains = summarizeDomains(findings, DRIFT_CERT_DOMAINS);

  const failures = findings
    .filter((item) => !item.passed && item.severity === "critical")
    .map((item) => `${item.title}: ${item.detail}`);

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    certificationProfile: profile,
    executionMode,
    mode,
    driftScore,
    passed,
    counts,
    domains,
    findings,
    unexpectedDrift: inventory.unexpectedDrift,
    unauthorizedChanges: inventory.unauthorizedChanges,
    configurationMismatches: inventory.configurationMismatches,
    missingSecrets: inventory.missingSecrets,
    unusedSecrets: inventory.unusedSecrets,
    recommendations,
    failures,
    source: "cli"
  };

  const paths = writeDriftReports(outputDir, report);

  console.log(`Mode: ${mode}`);
  console.log(`Drift score: ${driftScore}%`);
  console.log(
    `Drift — unexpected: ${inventory.unexpectedDrift} · unauthorized: ${inventory.unauthorizedChanges} · mismatches: ${inventory.configurationMismatches}`
  );
  console.log(
    `Secrets — missing: ${inventory.missingSecrets} · unused: ${inventory.unusedSecrets.length}`
  );
  console.log(`Critical: ${counts.critical} · Warnings: ${counts.warning + counts.medium}`);
  console.log(`Release gate: ${passed ? "PASS" : "BLOCKED"}`);
  console.log(`Report: ${paths.jsonPath}\n`);

  if (!passed) {
    console.error("Operational drift certification FAILED — resolve critical configuration drift.\n");
    for (const failure of failures.slice(0, 10)) {
      console.error(`  • ${failure}`);
    }
    process.exit(certificationExitCode(report, profile));
  }

  console.log("Operational drift certification PASSED.\n");
}

main().catch((error) => {
  console.error("Operational drift certification crashed:", error);
  process.exit(1);
});
