#!/usr/bin/env node
/**
 * Accessibility Certification™ — P0 release gate.
 *
 * Usage: npm run certify:accessibility
 * Blocks release when critical accessibility failures exist.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ACCESSIBILITY_CERT_DOMAINS } from "../../shared/accessibilityCertificationDomains.mjs";
import { config } from "./config.mjs";
import {
  buildRecommendations,
  buildViolations,
  runAllAccessibilityChecks
} from "./lib/checks.mjs";
import {
  buildAccessibilityScore,
  countSeverities,
  evaluateReleaseGate,
  summarizeDomains
} from "./lib/score.mjs";
import { writeAccessibilityReports } from "./lib/report.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

function main() {
  console.log("\n=== Accessibility Certification™ ===\n");
  console.log(`Run ID: ${config.runId}\n`);

  const { findings } = runAllAccessibilityChecks();
  const counts = countSeverities(findings);
  const accessibilityScore = buildAccessibilityScore(findings);
  const passed = evaluateReleaseGate(counts);
  const recommendations = buildRecommendations(findings);
  const violations = buildViolations(findings);
  const domains = summarizeDomains(findings, ACCESSIBILITY_CERT_DOMAINS);

  const failures = findings
    .filter((item) => !item.passed && item.severity === "critical")
    .map((item) => `${item.title}: ${item.detail}`);

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    accessibilityScore,
    passed,
    counts,
    domains,
    findings,
    violations,
    recommendations,
    failures,
    source: "cli"
  };

  const paths = writeAccessibilityReports(outputDir, report);

  console.log(`Accessibility score: ${accessibilityScore}%`);
  console.log(`Domains verified: ${domains.length}`);
  console.log(
    `Findings — critical: ${counts.critical}, high: ${counts.high}, warning: ${counts.warning}`
  );
  console.log(`Violations: ${violations.length}`);
  console.log(`Release gate: ${passed ? "PASS" : "BLOCKED"}`);
  console.log(`Report: ${paths.jsonPath}\n`);

  if (!passed) {
    console.error(
      "Accessibility certification FAILED — resolve critical failures before release.\n"
    );
    for (const failure of failures.slice(0, 10)) {
      console.error(`  • ${failure}`);
    }
    process.exit(1);
  }

  console.log("Accessibility certification PASSED.\n");
}

main();
