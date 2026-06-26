#!/usr/bin/env node
/**
 * Release Candidate Certification™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessRcCertification,
  formatRcCertificationSummary,
  rcCertificationCommandRegistered,
  rcCertificationModuleRegistered,
  rcCertificationRouteRegistered
} from "../server/services/rcCertification.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const requiredFiles = [
  "certification/release-candidate/run.mjs",
  "certification/release-candidate/lib/collect.mjs",
  "certification/release-candidate/lib/score.mjs",
  "certification/release-candidate/lib/report.mjs",
  "shared/releaseCandidateCertificationSubsystems.mjs",
  "server/services/rcCertification.js",
  "src/constants/rcCertificationAdmin.ts",
  "src/constants/rcCertification.ts",
  "src/types/rcCertification.ts",
  "src/utils/rcCertificationEngine.ts",
  "src/utils/rcCertificationStore.ts",
  "src/components/admin/rcCertification/RcCertificationDashboard.tsx"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const sharedSource = read("shared/releaseCandidateCertificationSubsystems.mjs");
assert(sharedSource.includes("data-integrity"), "data integrity subsystem");
assert(sharedSource.includes("founder-certification"), "founder subsystem");
assert(sharedSource.includes("RC_CERT_BLOCK_ON_NO_GO"), "block rule");

const reportSource = read("certification/release-candidate/lib/report.mjs");
assert(reportSource.includes("release-candidate-report.json"), "json export");
assert(reportSource.includes("release-candidate-report.md"), "markdown export");
assert(reportSource.includes("release-candidate-report.pdf"), "pdf export");

const collectSource = read("certification/release-candidate/lib/collect.mjs");
assert(collectSource.includes("collectRcSubsystemScores"), "subsystem collector");
assert(collectSource.includes("buildRcNumber"), "rc number builder");
assert(collectSource.includes("readGitCommit"), "git commit reader");

const packageJson = JSON.parse(read("package.json"));
assert(rcCertificationCommandRegistered(JSON.stringify(packageJson.scripts)), "npm scripts wired");

const permissionsSource = read("src/constants/permissions.ts");
assert(rcCertificationRouteRegistered(permissionsSource), "permissions route registered");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('rccertification: "rc-certification"'), "hard route slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyRcCertificationDashboard"), "lazy dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "rccertification"'), "AdminHub mounts dashboard");

const dashboardSource = read("src/components/admin/rcCertification/RcCertificationDashboard.tsx");
assert(dashboardSource.includes("certify:rc"), "certify command in UI");

const sample = {
  releaseDecisionLabel: "GO",
  overallScore: 92,
  passedChecks: 18,
  blockers: []
};
assert(formatRcCertificationSummary(sample).includes("GO"), "summary formatted");
assert(rcCertificationModuleRegistered(read("package.json")), "module path registered");
assert(canAccessRcCertification(["ManageOperations"]), "operations can access");
assert(!canAccessRcCertification(["ViewFinance"]), "finance alone cannot access");

if (failed > 0) {
  console.error(`\n${failed} RC certification test(s) failed.`);
  process.exit(1);
}

console.log("All RC certification tests passed.");
