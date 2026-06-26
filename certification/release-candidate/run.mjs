#!/usr/bin/env node
/**
 * Release Candidate Certification™ — final release gate.
 *
 * Usage: npm run certify:rc
 * Aggregates every certification subsystem before production deployment.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RC1_LABEL } from "../../shared/releaseCandidateCertificationSubsystems.mjs";
import { config } from "./config.mjs";
import {
  buildRcNumber,
  collectRcSubsystemScores,
  flattenRcIssues,
  buildDomainPillars,
  readBuildMetadata,
  readEnvironment,
  readGitCommit
} from "./lib/collect.mjs";
import {
  buildBlockers,
  buildRcOverallScore,
  buildRcReleaseDecision,
  buildSignOffs,
  countPassedChecks
} from "./lib/score.mjs";
import { writeRcReports } from "./lib/report.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

function main() {
  console.log(`\n=== Release Candidate Certification™ (${RC1_LABEL}) ===\n`);
  console.log(`Run ID: ${config.runId}\n`);

  const buildMeta = readBuildMetadata();
  const git = readGitCommit();
  const environment = readEnvironment();
  const rcNumber = buildRcNumber(buildMeta, config.runId);

  const rawSubsystems = collectRcSubsystemScores();
  const subsystemScores = rawSubsystems.map(({ issues, ...entry }) => entry);
  const { criticalIssues, warnings } = flattenRcIssues(rawSubsystems);
  const overallScore = buildRcOverallScore(subsystemScores);
  const blockers = buildBlockers(subsystemScores, criticalIssues);
  const decision = buildRcReleaseDecision(overallScore, criticalIssues, warnings, blockers);
  const passedChecks = countPassedChecks(subsystemScores);

  const domainPillars = buildDomainPillars(subsystemScores);
  const certificationTimestamp = new Date().toISOString();
  const signOffs = buildSignOffs(decision, certificationTimestamp);

  const report = {
    runId: config.runId,
    rcLabel: RC1_LABEL,
    rcNumber,
    certificationTimestamp,
    gitCommit: git.gitCommit,
    gitCommitShort: git.gitCommitShort,
    buildVersion: buildMeta.buildVersion,
    buildCode: buildMeta.buildCode,
    cacheVersion: buildMeta.cacheVersion,
    environment,
    overallScore,
    releaseDecision: decision.releaseDecision,
    releaseDecisionLabel: decision.releaseDecisionLabel,
    releaseDecisionDetail: decision.releaseDecisionDetail,
    passed: decision.passed,
    passedChecks,
    subsystemScores,
    domainPillars,
    signOffs,
    criticalIssues,
    warnings,
    blockers,
    summaryLine: `${decision.releaseDecisionLabel} · ${overallScore}% · ${passedChecks}/${subsystemScores.length} passed · ${blockers.length} blockers`,
    source: "cli"
  };

  const paths = writeRcReports(outputDir, report);

  console.log(`RC Number: ${rcNumber}`);
  console.log(`Git commit: ${git.gitCommitShort}`);
  console.log(`Build: ${buildMeta.buildVersion} (${buildMeta.buildCode})`);
  console.log(`Environment: ${environment}`);
  console.log(`Overall score: ${overallScore}%`);
  console.log(`Passed checks: ${passedChecks}/${subsystemScores.length}`);
  console.log(`Decision: ${decision.releaseDecisionLabel}`);
  console.log(`Blockers: ${blockers.length} · Warnings: ${warnings.length}`);
  console.log(`JSON: ${paths.jsonPath}`);
  console.log(`Markdown: ${paths.mdPath}`);
  console.log(`PDF: ${paths.pdfPath}\n`);

  if (!decision.passed) {
    console.error("Release Candidate certification: NO GO — production deployment blocked.\n");
    for (const item of blockers.slice(0, 10)) {
      console.error(`  • [${item.subsystemId}] ${item.title}`);
    }
    process.exit(1);
  }

  console.log(`Release Candidate certification: ${decision.releaseDecisionLabel}\n`);
}

main();
