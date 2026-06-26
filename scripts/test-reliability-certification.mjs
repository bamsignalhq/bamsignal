#!/usr/bin/env node
/**
 * Reliability Certification™ — verification tests.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessReliabilityCertification,
  formatReliabilityCertificationSummary,
  reliabilityCertificationRouteRegistered
} from "../server/services/reliabilityCertification.js";

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
  "src/constants/reliabilityCertificationAdmin.ts",
  "src/constants/reliabilityCertification.ts",
  "src/types/reliabilityCertification.ts",
  "src/utils/reliabilityCertificationLogic.ts",
  "src/utils/reliabilityCertificationEngine.ts",
  "src/utils/reliabilityCertificationStore.ts",
  "server/services/reliabilityCertification.js",
  "shared/reliabilityCertificationChecks.mjs",
  "certification/reliability/run.mjs",
  "certification/reliability/lib/simulations.mjs",
  "src/components/admin/reliabilityCertification/ReliabilityCertificationDashboard.tsx"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const adminSource = read("src/constants/reliabilityCertificationAdmin.ts");
assert(adminSource.includes("/hard/reliability-certification"), "reliability certification route");
assert(adminSource.includes("Reliability Certification"), "reliability certification brand");

const constantsSource = read("src/constants/reliabilityCertification.ts");
assert(constantsSource.includes("RELIABILITY_CERTIFICATION_SCENARIOS"), "certification scenarios");
assert(constantsSource.includes("supabase-unavailable"), "supabase scenario");
assert(constantsSource.includes("RELIABILITY_CERTIFICATION_RELEASE_BLOCKERS"), "release blockers");

const logicSource = read("src/utils/reliabilityCertificationLogic.ts");
assert(logicSource.includes("buildReliabilityCertificationReport"), "report builder");

const sharedSource = read("shared/reliabilityCertificationChecks.mjs");
assert(sharedSource.includes("RELIABILITY_CERT_SCENARIOS"), "scenario registry");
assert(sharedSource.includes("invalid-refresh-token"), "refresh token scenario");

const simulationsSource = read("certification/reliability/lib/simulations.mjs");
assert(simulationsSource.includes("runAllReliabilitySimulations"), "simulation runner");
assert(simulationsSource.includes("withBoundedRetry"), "retry simulation");

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts["certify:reliability"], "certify:reliability script");
assert(packageJson.scripts["test:reliability-certification"], "test:reliability-certification script");

const permissionsSource = read("src/constants/permissions.ts");
assert(reliabilityCertificationRouteRegistered(permissionsSource), "permissions route registered");
assert(permissionsSource.includes("reliabilitycertification"), "reliabilitycertification tab");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('reliabilitycertification: "reliability-certification"'), "hard route slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyReliabilityCertificationDashboard"), "lazy dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "reliabilitycertification"'), "AdminHub mounts dashboard");

assert(canAccessReliabilityCertification(["ManageOperations"]), "operations can access");
assert(!canAccessReliabilityCertification(["ViewFinance"]), "finance alone cannot access");

const sampleReport = {
  reliabilityScore: 100,
  passed: true,
  recoverySuccess: 10,
  scenarios: Array(10).fill({}),
  recoveryTimeMs: { average: 12, max: 40 }
};
assert(formatReliabilityCertificationSummary(sampleReport).includes("100"), "summary formatted");

if (failed > 0) {
  console.error(`\n${failed} reliability certification test(s) failed.`);
  process.exit(1);
}

console.log("All reliability certification tests passed.");
