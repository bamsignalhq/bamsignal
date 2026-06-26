#!/usr/bin/env node
/**
 * Operational Drift Certification™ — configuration drift gate.
 *
 * Usage: npm run certify:drift
 * Blocks release when critical configuration drift exists.
 */
import dotenv from "dotenv";
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

dotenv.config();

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

async function main() {
  console.log("\n=== Operational Drift Certification™ ===\n");
  console.log(`Run ID: ${config.runId}\n`);

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
      detail: "DATABASE_URL not connected — run against staging/production for DB flag/config drift.",
      severity: "warning",
      compareTarget: "current",
      passed: false
    });
  }

  const inventory = summarizeDriftInventory(findings);
  const counts = countDriftSeverities(findings);
  const driftScore = buildDriftScore(findings);
  const passed = evaluateReleaseGate(counts);
  const recommendations = buildDriftRecommendations(findings, inventory);
  const domains = summarizeDomains(findings, DRIFT_CERT_DOMAINS);

  const failures = findings
    .filter((item) => !item.passed && item.severity === "critical")
    .map((item) => `${item.title}: ${item.detail}`);

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
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
    process.exit(1);
  }

  console.log("Operational drift certification PASSED.\n");
}

main().catch((error) => {
  console.error("Operational drift certification crashed:", error);
  process.exit(1);
});
