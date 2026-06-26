#!/usr/bin/env node
/**
 * Production Smoke Suite™ — post-deploy production validation.
 *
 * Usage: npm run smoke:production
 * Validates HTTP, response time, expected UI markers, and production readiness.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTION_SMOKE_BRAND } from "../../shared/productionSmokeChecks.mjs";
import { config } from "./config.mjs";
import {
  buildSmokeFailures,
  buildSmokeRecommendations,
  runProductionSmokeChecks
} from "./lib/checks.mjs";
import { buildSmokeScore, countSeverities, evaluateSmokeGate } from "./lib/score.mjs";
import { writeProductionSmokeReports } from "./lib/report.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

async function main() {
  console.log(`\n=== ${PRODUCTION_SMOKE_BRAND} ===\n`);
  console.log(`Target: ${config.baseUrl}`);
  console.log(`Run ID: ${config.runId}\n`);

  const { checks, deploymentBuildId, deploymentTimestamp, commitSha } =
    await runProductionSmokeChecks();
  const counts = countSeverities(checks);
  const smokeScore = buildSmokeScore(checks);
  const passed = evaluateSmokeGate(counts);
  const recommendations = buildSmokeRecommendations(checks);
  const failures = buildSmokeFailures(checks);
  const checksPassed = checks.filter((item) => item.passed).length;
  const checksFailed = checks.length - checksPassed;

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    baseUrl: config.baseUrl,
    deploymentTimestamp,
    commitSha,
    deploymentBuildId,
    smokeScore,
    passed,
    counts,
    checksPassed,
    checksFailed,
    checks,
    recommendations,
    failures,
    source: "cli"
  };

  const paths = writeProductionSmokeReports(outputDir, report);

  console.log(`Smoke score: ${smokeScore}%`);
  console.log(`Checks: ${checksPassed}/${checks.length} passed`);
  console.log(`Deployment build: ${deploymentBuildId || "unknown"}`);
  console.log(`Commit SHA: ${commitSha || "unknown"}`);
  console.log(`Deployment timestamp: ${deploymentTimestamp || "unknown"}`);
  console.log(`Critical failures: ${counts.critical}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Report: ${paths.jsonPath}\n`);

  if (!passed) {
    console.error("Production smoke FAILED — deployed environment is not healthy.\n");
    for (const failure of failures.slice(0, 12)) {
      console.error(`  • ${failure}`);
    }
    process.exit(1);
  }

  console.log("Production smoke PASSED.\n");
}

main().catch((error) => {
  console.error("Production smoke runner failed:", error);
  process.exit(1);
});
