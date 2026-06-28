#!/usr/bin/env node
/**
 * Release Candidate Certification™ — final release gate.
 *
 * Usage:
 *   npm run certify:rc                 # profile from CERTIFICATION_PROFILE or auto-detect
 *   npm run certify:rc:local           # advisory local report
 *   npm run certify:rc:staging         # full staging integration gate
 *   npm run certify:rc:production      # official production RC gate
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RC1_LABEL } from "../../shared/releaseCandidateCertificationSubsystems.mjs";
import {
  certificationProfileDescription,
  mergeExecutionContext,
  resolveCertificationProfile
} from "../../shared/certificationProfile.mjs";
import { buildReleaseManifest, writeReleaseManifest } from "../../shared/certificationManifest.mjs";
import { loadCertificationEnvironment } from "../../shared/loadCertificationEnv.mjs";
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
  loadCertificationEnvironment();
  const context = mergeExecutionContext(process.env);
  const profile = resolveCertificationProfile(process.env);

  console.log(`\n=== Release Candidate Certification™ (${RC1_LABEL}) ===\n`);
  console.log(`Run ID: ${config.runId}`);
  console.log(`Profile: ${profile.toUpperCase()} — ${certificationProfileDescription(profile)}\n`);

  const buildMeta = readBuildMetadata();
  const git = readGitCommit();
  const environment = readEnvironment();
  const rcNumber = buildRcNumber(buildMeta, config.runId);

  const rawSubsystems = collectRcSubsystemScores(profile);
  const subsystemScores = rawSubsystems.map(({ issues, ...entry }) => entry);
  const { criticalIssues, warnings } = flattenRcIssues(rawSubsystems);
  const overallScore = buildRcOverallScore(subsystemScores);
  const blockers = buildBlockers(subsystemScores, criticalIssues, profile);
  const decision = buildRcReleaseDecision(overallScore, criticalIssues, warnings, blockers, profile);
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
    certificationProfile: profile,
    profileDescription: context.profileDescription,
    executionMode: context.executionMode,
    advisoryOnly: decision.advisoryOnly,
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
    skippedSubsystems: subsystemScores.filter((item) => item.skipped),
    prerequisites: context.prerequisites,
    summaryLine: `${decision.releaseDecisionLabel} · ${overallScore}% · ${passedChecks}/${subsystemScores.length} passed · ${blockers.length} blockers · profile=${profile}`,
    source: "cli"
  };

  const paths = writeRcReports(outputDir, report);
  const manifest = buildReleaseManifest({ rootPath, rcReport: report, env: process.env });
  const manifestPaths = writeReleaseManifest(rootPath, manifest);

  console.log(`RC Number: ${rcNumber}`);
  console.log(`Git commit: ${git.gitCommitShort}`);
  console.log(`Build: ${buildMeta.buildVersion} (${buildMeta.buildCode})`);
  console.log(`Profile: ${profile}`);
  console.log(`Overall score: ${overallScore}%`);
  console.log(`Passed checks: ${passedChecks}/${subsystemScores.length}`);
  console.log(`Skipped: ${report.skippedSubsystems.length}`);
  console.log(`Decision: ${decision.releaseDecisionLabel}`);
  console.log(`Blockers: ${blockers.length} · Warnings: ${warnings.length}`);
  console.log(`JSON: ${paths.jsonPath}`);
  console.log(`Manifest: ${manifestPaths.latest}\n`);

  if (!decision.passed) {
    console.error("Release Candidate certification: NO GO — production deployment blocked.\n");
    for (const item of blockers.slice(0, 10)) {
      console.error(`  • [${item.subsystemId}] ${item.title}`);
    }
    process.exit(1);
  }

  if (decision.advisoryOnly) {
    console.log("Release Candidate certification: LOCAL ADVISORY — does not block production.\n");
    return;
  }

  console.log(`Release Candidate certification: ${decision.releaseDecisionLabel}\n`);
}

main();
