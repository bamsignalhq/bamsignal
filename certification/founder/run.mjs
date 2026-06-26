#!/usr/bin/env node
/**
 * Founder Launch Certification™ — master launch gate.
 *
 * Usage: npm run certify:founder
 * Combines QA, security, performance, reliability, and institutional subsystems.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.mjs";
import {
  buildResolvedSinceLastRelease,
  collectFounderSubsystemScores,
  flattenIssues,
  readReleaseCandidate
} from "./lib/collect.mjs";
import { buildFounderLaunchDecision, buildFounderOverallScore } from "./lib/score.mjs";
import { writeFounderReports } from "./lib/report.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

function loadPreviousReport() {
  const latestPath = join(outputDir, "latest.json");
  if (!existsSync(latestPath)) return null;
  try {
    return JSON.parse(readFileSync(latestPath, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  console.log("\n=== Founder Launch Certification™ ===\n");
  console.log(`Run ID: ${config.runId}\n`);

  const rawSubsystems = collectFounderSubsystemScores();
  const subsystemScores = rawSubsystems.map(({ issues, ...entry }) => entry);
  const { criticalIssues, warnings } = flattenIssues(rawSubsystems);
  const overallScore = buildFounderOverallScore(subsystemScores);
  const decision = buildFounderLaunchDecision(overallScore, criticalIssues, warnings);
  const previous = loadPreviousReport();
  const resolvedSinceLastRelease = buildResolvedSinceLastRelease(
    previous,
    criticalIssues,
    warnings
  );

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    releaseCandidate: readReleaseCandidate(),
    overallScore,
    releaseDecision: decision.releaseDecision,
    releaseDecisionLabel: decision.releaseDecisionLabel,
    releaseDecisionDetail: decision.releaseDecisionDetail,
    passed: decision.passed,
    subsystemScores,
    criticalIssues,
    warnings,
    resolvedSinceLastRelease,
    summaryLine: `${decision.releaseDecisionLabel} · ${overallScore}% · ${criticalIssues.length} critical · ${warnings.length} warnings`,
    source: "cli"
  };

  const paths = writeFounderReports(outputDir, report);

  console.log(`Release candidate: ${report.releaseCandidate}`);
  console.log(`Overall score: ${overallScore}%`);
  console.log(`Decision: ${decision.releaseDecisionLabel}`);
  console.log(`Critical: ${criticalIssues.length} · Warnings: ${warnings.length}`);
  console.log(`Resolved since last: ${resolvedSinceLastRelease.length}`);
  console.log(`JSON: ${paths.jsonPath}`);
  console.log(`Markdown: ${paths.mdPath}`);
  console.log(`Founder PDF: ${paths.founderPdfPath}`);
  console.log(`Board PDF: ${paths.boardPdfPath}\n`);

  if (!decision.passed) {
    console.error("Founder launch certification: NO GO — resolve critical blockers before launch.\n");
    for (const item of criticalIssues.slice(0, 8)) {
      console.error(`  • [${item.subsystemId}] ${item.title}`);
    }
    process.exit(1);
  }

  console.log(`Founder launch certification: ${decision.releaseDecisionLabel}\n`);
}

main();
