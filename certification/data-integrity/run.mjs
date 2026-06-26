#!/usr/bin/env node
/**
 * Data Integrity Certification™ — database consistency gate.
 *
 * Usage: npm run certify:data-integrity
 * Blocks release when critical integrity issues > 0.
 */
import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.mjs";
import { runDatabaseIntegrityChecks, runStaticIntegrityChecks } from "./lib/checks.mjs";
import { runSafeIntegrityRepairs } from "./lib/repair.mjs";
import {
  buildIntegrityScore,
  evaluateReleaseGate,
  flattenIssues,
  summarizeScan
} from "./lib/score.mjs";
import { writeDataIntegrityReports } from "./lib/report.mjs";
import { initDatabase, isDatabaseReady, pool } from "../../server/db.js";

dotenv.config();

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

async function main() {
  console.log("\n=== Data Integrity Certification™ ===\n");
  console.log(`Run ID: ${config.runId}\n`);

  await initDatabase();
  const staticScan = await runStaticIntegrityChecks();

  let domains = [];
  let mode = "static";
  let repairs = [];
  let flaggedForReview = [];
  let objectsRepaired = 0;

  if (isDatabaseReady() && pool) {
    mode = "database";
    const repairResult = await runSafeIntegrityRepairs(pool);
    repairs = repairResult.repairs;
    flaggedForReview = repairResult.flaggedForReview;
    objectsRepaired = repairResult.objectsRepaired;

    domains = await runDatabaseIntegrityChecks(pool);
    for (const domain of domains) {
      domain.objectsRepaired = 0;
    }
  } else {
    console.warn("Database not connected — running static integrity checks only.\n");
    domains = staticScan.criticalIssues.length || staticScan.warnings.length
      ? [
          {
            id: "schema",
            label: "Schema",
            objectsScanned: staticScan.objectsScanned,
            objectsRepaired: 0,
            objectsRequiringReview: staticScan.warnings.length,
            criticalIssues: staticScan.criticalIssues,
            warnings: [
              ...staticScan.warnings,
              {
                id: "db-unavailable",
                domainId: "schema",
                title: "Live database scan skipped",
                detail: "DATABASE_URL not connected — run against production/staging for full certification.",
                severity: "warning",
                count: 1
              }
            ],
            passed: staticScan.criticalIssues.length === 0
          }
        ]
      : [
          {
            id: "schema",
            label: "Schema",
            objectsScanned: staticScan.objectsScanned,
            objectsRepaired: 0,
            objectsRequiringReview: 1,
            criticalIssues: [],
            warnings: [
              {
                id: "db-unavailable",
                domainId: "schema",
                title: "Live database scan skipped",
                detail: "DATABASE_URL not connected — run against production/staging for full certification.",
                severity: "warning",
                count: 1
              }
            ],
            passed: true
          }
        ];
    flaggedForReview = flaggedForReview.length
      ? flaggedForReview
      : [{ action: "full-db-scan", detail: "Connect DATABASE_URL for live orphan/FK scans.", safe: false }];
  }

  const totals = summarizeScan(domains);
  totals.objectsRepaired = objectsRepaired;
  const { criticalIssues, warnings } = flattenIssues(domains);
  const integrityScore = buildIntegrityScore(domains);
  const passed = evaluateReleaseGate(criticalIssues.length);

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    mode,
    integrityScore,
    passed,
    objectsScanned: totals.objectsScanned,
    objectsRepaired: totals.objectsRepaired,
    objectsRequiringReview: totals.objectsRequiringReview + flaggedForReview.length,
    domains,
    criticalIssues,
    warnings,
    repairs,
    flaggedForReview,
    source: "cli"
  };

  const paths = writeDataIntegrityReports(outputDir, report);

  console.log(`Mode: ${mode}`);
  console.log(`Integrity score: ${integrityScore}%`);
  console.log(
    `Scanned: ${totals.objectsScanned} · Repaired: ${totals.objectsRepaired} · Review: ${report.objectsRequiringReview}`
  );
  console.log(`Critical: ${criticalIssues.length} · Warnings: ${warnings.length}`);
  console.log(`Release gate: ${passed ? "PASS" : "BLOCKED"}`);
  console.log(`Report: ${paths.jsonPath}\n`);

  if (!passed) {
    console.error("Data integrity certification FAILED — resolve critical issues before release.\n");
    for (const item of criticalIssues.slice(0, 10)) {
      console.error(`  • [${item.domainLabel}] ${item.title}: ${item.detail}`);
    }
    process.exit(1);
  }

  console.log("Data integrity certification PASSED.\n");
}

main().catch((error) => {
  console.error("Data integrity certification crashed:", error);
  process.exit(1);
});
