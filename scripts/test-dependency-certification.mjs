#!/usr/bin/env node
/**
 * Dependency & Supply Chain Certification™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessDependencyCertification,
  dependencyCertificationCommandRegistered,
  dependencyCertificationModuleRegistered,
  dependencyCertificationRouteRegistered,
  formatDependencyCertificationSummary
} from "../server/services/dependencyCertification.js";

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
  "certification/dependencies/run.mjs",
  "certification/dependencies/lib/checks.mjs",
  "certification/dependencies/lib/score.mjs",
  "certification/dependencies/lib/report.mjs",
  "shared/dependencyCertificationDomains.mjs",
  "server/services/dependencyCertification.js",
  "src/constants/dependencyCertificationAdmin.ts",
  "src/constants/dependencyCertification.ts",
  "src/types/dependencyCertification.ts",
  "src/utils/dependencyCertificationEngine.ts",
  "src/utils/dependencyCertificationStore.ts",
  "src/components/admin/dependencyCertification/DependencyCertificationDashboard.tsx"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const sharedSource = read("shared/dependencyCertificationDomains.mjs");
assert(sharedSource.includes("npm-packages"), "npm packages category");
assert(sharedSource.includes("notification-sdks"), "notification sdk category");
assert(sharedSource.includes("DEPENDENCY_CERT_BLOCK_ON_CRITICAL"), "block rule");

const checksSource = read("certification/dependencies/lib/checks.mjs");
assert(checksSource.includes("runAllDependencyChecks"), "dependency checks");
assert(checksSource.includes("npm audit"), "cve audit");
assert(checksSource.includes("duplicatePackages"), "duplicate package check");
assert(checksSource.includes("unusedDependencies"), "unused package scan");

const packageJson = JSON.parse(read("package.json"));
assert(dependencyCertificationCommandRegistered(JSON.stringify(packageJson.scripts)), "npm scripts wired");

const permissionsSource = read("src/constants/permissions.ts");
assert(dependencyCertificationRouteRegistered(permissionsSource), "permissions route registered");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('dependencycertification: "dependency-certification"'), "hard route slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyDependencyCertificationDashboard"), "lazy dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "dependencycertification"'), "AdminHub mounts dashboard");

const dashboardSource = read("src/components/admin/dependencyCertification/DependencyCertificationDashboard.tsx");
assert(dashboardSource.includes("certify:dependencies"), "certify command in UI");

const sample = {
  dependencyScore: 88,
  criticalVulnerabilities: [],
  upgradeCandidates: [{ name: "vite" }],
  passed: true
};
assert(formatDependencyCertificationSummary(sample).includes("88"), "summary formatted");
assert(dependencyCertificationModuleRegistered(read("package.json")), "module path registered");
assert(canAccessDependencyCertification(["ManageOperations"]), "operations can access");
assert(!canAccessDependencyCertification(["ViewFinance"]), "finance alone cannot access");

if (failed > 0) {
  console.error(`\n${failed} dependency certification test(s) failed.`);
  process.exit(1);
}

console.log("All dependency certification tests passed.");
