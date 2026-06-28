/**
 * Canonical Release Manifest — machine-readable certification artifact.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { mergeExecutionContext } from "./certificationProfile.mjs";
import { RC_CERT_SUBSYSTEMS } from "./releaseCandidateCertificationSubsystems.mjs";
import {
  delegatedStagingSubsystems,
  evaluateSubsystemGate,
  reportOutcome,
  requiredSubsystemsForProfile
} from "./releaseCandidateGate.mjs";

export const MANIFEST_SCHEMA_VERSION = "1.0.0";
export const MANIFEST_DEFAULT_DIR = "certification/manifest";

/**
 * @param {string} rootPath
 */
export function readBuildMetadata(rootPath) {
  try {
    const source = readFileSync(join(rootPath, "src/buildInfo.ts"), "utf8");
    return {
      buildVersion: source.match(/BUILD_VERSION = "([^"]+)"/)?.[1] ?? "unknown",
      buildCode: source.match(/BUILD_CODE = "([^"]+)"/)?.[1] ?? "0",
      cacheVersion: source.match(/CACHE_VERSION = "([^"]+)"/)?.[1] ?? "unknown",
      buildTime: source.match(/BUILD_TIME = "([^"]+)"/)?.[1] ?? null
    };
  } catch {
    return { buildVersion: "unknown", buildCode: "0", cacheVersion: "unknown", buildTime: null };
  }
}

/**
 * @param {string} rootPath
 */
export function readGitCommit(rootPath) {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: rootPath,
    encoding: "utf8"
  });
  const full = result.stdout?.trim() || "unknown";
  return { gitCommit: full, gitCommitShort: full.slice(0, 12) };
}

function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

/**
 * @param {string} rootPath
 * @param {string} relativePath
 */
function readCertReport(rootPath, relativePath) {
  if (!relativePath) return null;
  return readJson(join(rootPath, relativePath));
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function resolveDockerImageRef(env = process.env) {
  return (
    String(env.DOCKER_IMAGE || "").trim() ||
    String(env.COOLIFY_IMAGE || "").trim() ||
    String(env.BAMSIGNAL_DOCKER_IMAGE || "").trim() ||
    null
  );
}

/**
 * Build manifest from RC report + subsystem snapshots.
 * @param {object} params
 * @param {string} params.rootPath
 * @param {object} params.rcReport
 * @param {NodeJS.ProcessEnv} [params.env]
 */
export function buildReleaseManifest({ rootPath, rcReport, env = process.env }) {
  const context = mergeExecutionContext(env);
  const build = readBuildMetadata(rootPath);
  const git = readGitCommit(rootPath);
  const stagingManifestPath = join(rootPath, MANIFEST_DEFAULT_DIR, "latest-staging.json");
  const stagingManifest = readJson(stagingManifestPath);
  const stagingReports = stagingManifest?.subsystems || {};

  const subsystems = RC_CERT_SUBSYSTEMS.filter((item) => item.certPath).map((meta) => {
    const report = readCertReport(rootPath, meta.certPath);
    const gate = evaluateSubsystemGate(meta.id, report, context.profile, { stagingReports });
    return {
      id: meta.id,
      label: meta.label,
      certify: meta.certify,
      outcome: gate.outcome,
      passed: gate.passed,
      required: gate.required,
      blocksRelease: gate.blocksRelease,
      skipped: gate.outcome === "skipped",
      skipReason: report?.skipReason || null,
      skipDetail: report?.skipDetail || null,
      score: meta.scoreKey ? report?.[meta.scoreKey] ?? null : report?.passed ? 100 : null,
      generatedAt: report?.generatedAt || report?.certificationTimestamp || null,
      delegatedFrom: gate.delegatedFrom || null,
      summary: gate.summary,
      failureReasons: report?.failures || report?.failures?.length ? report.failures : []
    };
  });

  const skippedTests = subsystems.filter((item) => item.skipped);
  const failedTests = subsystems.filter((item) => item.outcome === "failed" && item.blocksRelease);
  const passedTests = subsystems.filter((item) => item.outcome === "passed");

  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    manifestType: context.reportLabel,
    certificationProfile: context.profile,
    executionMode: context.executionMode,
    generatedAt: new Date().toISOString(),
    gitCommit: git.gitCommit,
    gitCommitShort: git.gitCommitShort,
    buildVersion: build.buildVersion,
    buildCode: build.buildCode,
    cacheVersion: build.cacheVersion,
    buildTime: build.buildTime,
    dockerImage: resolveDockerImageRef(env),
    environment: String(env.ENV_TARGET || env.DEPLOY_ENV || env.NODE_ENV || "unknown"),
    prerequisites: context.prerequisites,
    rcRunId: rcReport?.runId || null,
    rcNumber: rcReport?.rcNumber || null,
    releaseDecision: rcReport?.releaseDecision || null,
    releaseDecisionLabel: rcReport?.releaseDecisionLabel || null,
    overallScore: rcReport?.overallScore ?? null,
    passed: rcReport?.passed ?? false,
    advisoryOnly: context.profile === "local",
    requiredSubsystems: requiredSubsystemsForProfile(context.profile),
    delegatedStagingSubsystems: delegatedStagingSubsystems(context.profile),
    subsystems,
    summary: {
      passed: passedTests.length,
      failed: failedTests.length,
      skipped: skippedTests.length,
      total: subsystems.length
    },
    skippedTests: skippedTests.map((item) => ({
      id: item.id,
      reason: item.skipReason,
      detail: item.skipDetail
    })),
    failureReasons: failedTests.flatMap((item) =>
      (Array.isArray(item.failureReasons) ? item.failureReasons : []).map((reason) => ({
        subsystemId: item.id,
        reason
      }))
    ),
    blockers: rcReport?.blockers || []
  };
}

/**
 * @param {string} rootPath
 * @param {object} manifest
 */
export function writeReleaseManifest(rootPath, manifest) {
  const outputDir = join(rootPath, MANIFEST_DEFAULT_DIR);
  mkdirSync(outputDir, { recursive: true });

  const profile = manifest.certificationProfile || "local";
  const stamp = manifest.rcRunId || manifest.generatedAt.replace(/[:.]/g, "-");
  const paths = {
    latest: join(outputDir, "latest.json"),
    profileLatest: join(outputDir, `latest-${profile}.json`),
    stamped: join(outputDir, `release-manifest-${stamp}.json`)
  };

  const payload = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(paths.latest, payload, "utf8");
  writeFileSync(paths.profileLatest, payload, "utf8");
  writeFileSync(paths.stamped, payload, "utf8");

  return paths;
}
