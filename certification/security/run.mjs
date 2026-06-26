#!/usr/bin/env node
/**
 * Security Certification™ — release security gate.
 *
 * Usage: npm run certify:security
 * Blocks release when critical > 0 or high > 0.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.mjs";
import { runAllSecurityChecks, buildRecommendations } from "./lib/checks.mjs";
import {
  buildOwaspFinding,
  buildSecurityScore,
  countSeverities,
  evaluateReleaseGate
} from "./lib/score.mjs";
import { writeSecurityReports } from "./lib/report.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

function main() {
  console.log("\n=== Security Certification™ ===\n");
  console.log(`Run ID: ${config.runId}\n`);

  const baseFindings = runAllSecurityChecks();
  const owaspFinding = buildOwaspFinding(baseFindings);
  const findings = [owaspFinding, ...baseFindings];
  const counts = countSeverities(findings);
  const securityScore = buildSecurityScore(findings);
  const passed = evaluateReleaseGate(counts);
  const recommendations = buildRecommendations(findings);
  const failures = findings
    .filter((item) => !item.passed && (item.severity === "critical" || item.severity === "high"))
    .map((item) => `${item.title}: ${item.detail}`);

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    securityScore,
    passed,
    counts,
    findings,
    recommendations,
    failures,
    source: "cli"
  };

  const paths = writeSecurityReports(outputDir, report);

  console.log(`Security score: ${securityScore}%`);
  console.log(
    `Severity — critical: ${counts.critical}, high: ${counts.high}, medium: ${counts.medium}, low: ${counts.low}`
  );
  console.log(`Release gate: ${passed ? "PASS" : "BLOCKED"}`);
  console.log(`Report: ${paths.jsonPath}\n`);

  if (!passed) {
    console.error("Security certification FAILED — resolve critical/high findings before release.\n");
    for (const failure of failures) {
      console.error(`  • ${failure}`);
    }
    process.exit(1);
  }

  console.log("Security certification PASSED.\n");
}

main();
