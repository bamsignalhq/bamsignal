#!/usr/bin/env node
/**
 * Dependency & Supply Chain Certification™ — dependency gate.
 *
 * Usage: npm run certify:dependencies
 * Blocks release when critical dependency vulnerabilities exist.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEPENDENCY_CERT_CATEGORIES } from "../../shared/dependencyCertificationDomains.mjs";
import { config } from "./config.mjs";
import { buildRecommendations, runAllDependencyChecks } from "./lib/checks.mjs";
import {
  buildDependencyScore,
  countSeverities,
  evaluateReleaseGate,
  summarizeInventory
} from "./lib/score.mjs";
import { writeDependencyReports } from "./lib/report.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

function summarizeCategories(findings) {
  return DEPENDENCY_CERT_CATEGORIES.map((category) => {
    const categoryFindings = findings.filter((item) => item.categoryId === category.id);
    const criticalCount = categoryFindings.filter(
      (item) => !item.passed && item.severity === "critical"
    ).length;
    return {
      ...category,
      findingsCount: categoryFindings.length,
      criticalCount,
      passed: criticalCount === 0
    };
  });
}

function main() {
  console.log("\n=== Dependency & Supply Chain Certification™ ===\n");
  console.log(`Run ID: ${config.runId}\n`);

  const { findings, inventory } = runAllDependencyChecks();
  const counts = countSeverities(findings);
  const dependencyScore = buildDependencyScore(findings);
  const passed = evaluateReleaseGate(counts, inventory.criticalVulnerabilities);
  const recommendations = buildRecommendations(findings, inventory);
  const categories = summarizeCategories(findings);
  const inventorySummary = summarizeInventory(inventory);

  const failures = [
    ...findings.filter((item) => !item.passed && item.severity === "critical").map(
      (item) => `${item.title}: ${item.detail}`
    ),
    ...inventory.criticalVulnerabilities.map((item) => `Critical CVE: ${item.name}`)
  ];

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    dependencyScore,
    passed,
    counts,
    packagesScanned: inventorySummary.packagesScanned,
    categories,
    findings,
    criticalVulnerabilities: inventory.criticalVulnerabilities,
    upgradeCandidates: inventory.upgradeCandidates,
    unusedDependencies: inventory.unusedDependencies,
    duplicatePackages: inventory.duplicatePackages,
    recommendations,
    failures,
    auditCounts: inventory.auditCounts,
    source: "cli"
  };

  const paths = writeDependencyReports(outputDir, report);

  console.log(`Dependency score: ${dependencyScore}%`);
  console.log(`Packages scanned: ${inventorySummary.packagesScanned}`);
  console.log(
    `CVEs — critical: ${inventory.auditCounts.critical}, high: ${inventory.auditCounts.high}`
  );
  console.log(
    `Upgrade candidates: ${inventory.upgradeCandidates.length} · Unused: ${inventory.unusedDependencies.length}`
  );
  console.log(`Release gate: ${passed ? "PASS" : "BLOCKED"}`);
  console.log(`Report: ${paths.jsonPath}\n`);

  if (!passed) {
    console.error("Dependency certification FAILED — resolve critical vulnerabilities before release.\n");
    for (const failure of failures.slice(0, 10)) {
      console.error(`  • ${failure}`);
    }
    process.exit(1);
  }

  console.log("Dependency certification PASSED.\n");
}

main();
