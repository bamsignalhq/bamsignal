#!/usr/bin/env node
/**
 * Performance Certification™ — verification tests.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessPerformanceCertification,
  formatPerformanceCertificationSummary,
  performanceCertificationRouteRegistered
} from "../server/services/performanceCertification.js";

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
  "src/constants/performanceCertificationAdmin.ts",
  "src/constants/performanceCertification.ts",
  "src/types/performanceCertification.ts",
  "src/utils/performanceCertificationLogic.ts",
  "src/utils/performanceCertificationEngine.ts",
  "src/utils/performanceCertificationStore.ts",
  "server/services/performanceCertification.js",
  "shared/performanceCertificationThresholds.mjs",
  "certification/performance/run.mjs",
  "certification/performance/lib/score.mjs",
  "src/components/admin/performanceCertification/PerformanceCertificationDashboard.tsx"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const adminSource = read("src/constants/performanceCertificationAdmin.ts");
assert(adminSource.includes("/hard/performance-certification"), "performance certification route");
assert(adminSource.includes("Performance Certification"), "performance certification brand");

const constantsSource = read("src/constants/performanceCertification.ts");
assert(constantsSource.includes("PERFORMANCE_CERTIFICATION_METRICS"), "certification metrics");
assert(constantsSource.includes("warm-startup"), "warm startup metric");
assert(constantsSource.includes("PERFORMANCE_CERTIFICATION_FAIL_RULES"), "fail rules");

const logicSource = read("src/utils/performanceCertificationLogic.ts");
assert(logicSource.includes("buildPerformanceCertificationReport"), "report builder");
assert(logicSource.includes("buildPerformanceRegressions"), "regression builder");

const thresholdsSource = read("shared/performanceCertificationThresholds.mjs");
assert(thresholdsSource.includes("warmStartupMs: 2000"), "startup threshold");
assert(thresholdsSource.includes("lcpMs: 2500"), "lcp threshold");
assert(thresholdsSource.includes("apiP95Ms: 500"), "api p95 threshold");

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts["certify:performance"], "certify:performance script");
assert(packageJson.scripts["test:performance-certification"], "test:performance-certification script");

const permissionsSource = read("src/constants/permissions.ts");
assert(performanceCertificationRouteRegistered(permissionsSource), "permissions route registered");
assert(permissionsSource.includes("performancecertification"), "performancecertification tab");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('performancecertification: "performance-certification"'), "hard route slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyPerformanceCertificationDashboard"), "lazy dashboard");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "performancecertification"'), "AdminHub mounts dashboard");

assert(canAccessPerformanceCertification(["ManageOperations"]), "operations can access");
assert(!canAccessPerformanceCertification(["ViewFinance"]), "finance alone cannot access");

const sampleReport = { performanceScore: 92, trend: "stable", regressions: [] };
assert(formatPerformanceCertificationSummary(sampleReport).includes("92"), "summary formatted");

if (failed > 0) {
  console.error(`\n${failed} performance certification test(s) failed.`);
  process.exit(1);
}

console.log("All performance certification tests passed.");
