#!/usr/bin/env node
/**
 * Certification profile, manifest, and release gate regression tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CERT_PROFILES,
  CERT_RESULT_STATUS,
  detectPlaywrightBrowsers,
  resolveCertificationProfile
} from "../shared/certificationProfile.mjs";
import {
  buildReleaseManifest,
  MANIFEST_SCHEMA_VERSION
} from "../shared/certificationManifest.mjs";
import {
  evaluateSubsystemGate,
  RC_PRODUCTION_REQUIRED,
  RC_STAGING_INTEGRATION_REQUIRED,
  reportOutcome
} from "../shared/releaseCandidateGate.mjs";
import { certificationExitCode } from "../shared/certificationRunner.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(rel) {
  return readFileSync(join(rootPath, rel), "utf8");
}

assert(CERT_PROFILES.length === 3, "three certification profiles");
assert(resolveCertificationProfile({ CERTIFICATION_PROFILE: "local" }) === "local", "local profile");
assert(resolveCertificationProfile({ CERTIFICATION_PROFILE: "staging" }) === "staging", "staging profile");
assert(resolveCertificationProfile({ CERTIFICATION_PROFILE: "production" }) === "production", "production profile");

const playwright = detectPlaywrightBrowsers();
assert(typeof playwright.ready === "boolean", "playwright detection returns boolean");

assert(
  reportOutcome({ skipped: true }) === CERT_RESULT_STATUS.SKIPPED,
  "skipped report outcome"
);
assert(reportOutcome({ passed: true }) === CERT_RESULT_STATUS.PASSED, "passed report outcome");
assert(
  reportOutcome({ outcome: "passed", passed: true }) === CERT_RESULT_STATUS.PASSED,
  "manifest outcome passed"
);

const localGate = evaluateSubsystemGate("platform-load", { skipped: true, skipReason: "playwright" }, "local");
assert(localGate.passed === true, "local profile skips do not block");
assert(localGate.blocksRelease === false, "local profile no blockers");

const stagingGate = evaluateSubsystemGate(
  "platform-load",
  { skipped: true, skipReason: "playwright" },
  "staging"
);
assert(stagingGate.passed === false, "staging profile requires integration tests");
assert(stagingGate.blocksRelease === true, "staging skipped integration blocks release");

const prodDelegated = evaluateSubsystemGate(
  "reliability",
  { passed: false },
  "production",
  {
    stagingReports: {
      reliability: {
        passed: true,
        outcome: "passed",
        generatedAt: new Date().toISOString()
      }
    }
  }
);
assert(prodDelegated.passed === true, "production RC accepts fresh staging reliability report");
assert(prodDelegated.delegatedFrom === "staging", "production delegation source");

assert(certificationExitCode({ skipped: true }, "local") === 0, "local skip exit 0");
assert(certificationExitCode({ skipped: true }, "staging") === 1, "staging skip exit 1");
assert(certificationExitCode({ passed: false }, "local") === 0, "local failure advisory exit 0");
assert(certificationExitCode({ passed: false }, "staging") === 1, "staging failure exit 1");

const manifest = buildReleaseManifest({
  rootPath,
  rcReport: {
    runId: "rc-test",
    rcNumber: "RC1-test",
    releaseDecision: "go",
    releaseDecisionLabel: "GO",
    overallScore: 95,
    passed: true,
    blockers: []
  },
  env: { CERTIFICATION_PROFILE: "local" }
});
assert(manifest.schemaVersion === MANIFEST_SCHEMA_VERSION, "manifest schema version");
assert(manifest.certificationProfile === "local", "manifest profile");
assert(Array.isArray(manifest.subsystems), "manifest subsystems");
assert(manifest.summary.total > 0, "manifest summary");

const requiredFiles = [
  "shared/certificationProfile.mjs",
  "shared/certificationManifest.mjs",
  "shared/releaseCandidateGate.mjs",
  "shared/certificationRunner.mjs",
  "scripts/run-staging-release-pipeline.mjs",
  ".github/workflows/release-candidate.yml",
  "docs/operations/certification/profiles.md",
  "docs/operations/certification/manifest-spec.md",
  "docs/operations/certification/release-pipeline.md"
];
for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const rcCollect = read("certification/release-candidate/lib/collect.mjs");
assert(rcCollect.includes("evaluateSubsystemGate"), "RC collect uses gate evaluator");
assert(rcCollect.includes("resolveCertificationProfile"), "RC collect uses profile");

const rcRun = read("certification/release-candidate/run.mjs");
assert(rcRun.includes("buildReleaseManifest"), "RC run writes manifest");
assert(rcRun.includes("writeReleaseManifest"), "RC run persists manifest");

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts["certify:rc:local"], "certify:rc:local script");
assert(packageJson.scripts["certify:rc:staging"], "certify:rc:staging script");
assert(packageJson.scripts["certify:rc:production"], "certify:rc:production script");
assert(packageJson.scripts["certify:pipeline:staging"], "staging pipeline script");
assert(packageJson.scripts["test:certification-profile"], "certification profile test");

assert(RC_PRODUCTION_REQUIRED.includes("production-smoke"), "production smoke required");
assert(RC_STAGING_INTEGRATION_REQUIRED.includes("reliability"), "staging reliability required");

if (failed > 0) {
  console.error(`\n${failed} certification profile test(s) failed.\n`);
  process.exit(1);
}

console.log("certification profile tests ok");
