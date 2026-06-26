#!/usr/bin/env node
/**
 * Operational Drift Certification™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessDriftCertification,
  driftCertificationCommandRegistered,
  driftCertificationModuleRegistered,
  driftCertificationRouteRegistered,
  formatDriftCertificationSummary
} from "../server/services/driftCertification.js";

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
  "certification/drift/run.mjs",
  "certification/drift/lib/envCompare.mjs",
  "certification/drift/lib/checks.mjs",
  "certification/drift/lib/score.mjs",
  "certification/drift/lib/report.mjs",
  "shared/operationalDriftCertificationDomains.mjs",
  "server/services/driftCertification.js",
  "src/constants/driftCertificationAdmin.ts",
  "src/constants/driftCertification.ts",
  "src/types/driftCertification.ts",
  "src/utils/driftCertificationEngine.ts",
  "src/utils/driftCertificationStore.ts",
  "src/components/admin/driftCertification/DriftCertificationDashboard.tsx"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const sharedSource = read("shared/operationalDriftCertificationDomains.mjs");
assert(sharedSource.includes("environment-variables"), "environment variables domain");
assert(sharedSource.includes("cron-schedules"), "cron schedules domain");
assert(sharedSource.includes("DRIFT_CERT_BLOCK_ON_CRITICAL"), "block rule");

const checksSource = read("certification/drift/lib/checks.mjs");
assert(checksSource.includes("runStaticDriftChecks"), "static drift checks");
assert(checksSource.includes("runDatabaseDriftChecks"), "database drift checks");
assert(checksSource.includes("compareProductionVsStaging"), "production vs staging compare");

const envSource = read("certification/drift/lib/envCompare.mjs");
assert(envSource.includes("compareExpectedVsCurrent"), "expected vs current compare");
assert(envSource.includes("registryForEnvironment"), "reuses environment registry");

const packageJson = JSON.parse(read("package.json"));
assert(driftCertificationCommandRegistered(JSON.stringify(packageJson.scripts)), "npm scripts wired");

const permissionsSource = read("src/constants/permissions.ts");
assert(driftCertificationRouteRegistered(permissionsSource), "permissions route registered");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('driftcertification: "drift-certification"'), "hard route slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyDriftCertificationDashboard"), "lazy dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "driftcertification"'), "AdminHub mounts dashboard");

const dashboardSource = read("src/components/admin/driftCertification/DriftCertificationDashboard.tsx");
assert(dashboardSource.includes("certify:drift"), "certify command in UI");

const sample = {
  driftScore: 91,
  counts: { critical: 0 },
  unexpectedDrift: 2,
  passed: true
};
assert(formatDriftCertificationSummary(sample).includes("91"), "summary formatted");
assert(driftCertificationModuleRegistered(read("package.json")), "module path registered");
assert(canAccessDriftCertification(["ManageOperations"]), "operations can access");
assert(!canAccessDriftCertification(["ViewFinance"]), "finance alone cannot access");

if (failed > 0) {
  console.error(`\n${failed} drift certification test(s) failed.`);
  process.exit(1);
}

console.log("All drift certification tests passed.");
