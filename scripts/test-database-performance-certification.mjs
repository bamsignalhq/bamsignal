#!/usr/bin/env node
/**
 * Database Performance Certification™ — verification tests.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  databasePerformanceCertificationCommandRegistered,
  databasePerformanceCertificationModuleRegistered,
  formatDatabasePerformanceCertificationSummary
} from "../server/services/databasePerformanceCertification.js";

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
  "certification/database/run.mjs",
  "certification/database/lib/measure.mjs",
  "certification/database/lib/checks.mjs",
  "certification/database/lib/score.mjs",
  "certification/database/lib/report.mjs",
  "certification/database/lib/recommendations.mjs",
  "shared/databasePerformanceCertificationDomains.mjs",
  "server/services/databasePerformanceCertification.js",
  "src/types/databasePerformanceCertification.ts",
  "src/utils/databasePerformanceCertificationEngine.ts",
  "src/utils/databasePerformanceCertificationStore.ts",
  "src/components/admin/performance/DatabasePerformanceCertificationCard.tsx"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const sharedSource = read("shared/databasePerformanceCertificationDomains.mjs");
assert(sharedSource.includes("slow-queries"), "slow queries area");
assert(sharedSource.includes("storage-growth"), "storage growth area");
assert(sharedSource.includes("DATABASE_PERF_BLOCK_ON_CRITICAL_REGRESSIONS"), "block rule");

const checksSource = read("certification/database/lib/checks.mjs");
assert(checksSource.includes("runDatabasePerformanceChecks"), "database checks");
assert(checksSource.includes("detectQueryRegressions"), "regression detection");
assert(checksSource.includes("sequential-scans"), "sequential scan check");

const measureSource = read("certification/database/lib/measure.mjs");
assert(measureSource.includes("measureDatabasePerformance"), "database measurement");
assert(measureSource.includes("pg_stat_statements"), "slow query telemetry");
assert(measureSource.includes("expensiveEndpoints"), "expensive endpoints");

const recommendationsSource = read("certification/database/lib/recommendations.mjs");
assert(recommendationsSource.includes("buildOptimizationOpportunities"), "optimization opportunities");
assert(recommendationsSource.includes("buildRecommendations"), "recommendations");

const packageJson = JSON.parse(read("package.json"));
assert(
  databasePerformanceCertificationCommandRegistered(JSON.stringify(packageJson.scripts)),
  "npm scripts wired"
);

const pageSource = read("src/components/admin/performance/PerformanceCenterPage.tsx");
const certCardSource = read("src/components/admin/performance/DatabasePerformanceCertificationCard.tsx");
assert(pageSource.includes("DatabasePerformanceCertificationCard"), "performance center cert card");
assert(certCardSource.includes("certify:database"), "certify command in UI");

const sample = {
  riskScore: 92,
  metrics: { p95Ms: 180 },
  criticalIssues: [],
  criticalRegressions: []
};
assert(formatDatabasePerformanceCertificationSummary(sample).includes("92"), "summary formatted");
assert(databasePerformanceCertificationModuleRegistered(read("package.json")), "module path registered");

if (failed > 0) {
  console.error(`\n${failed} database performance certification test(s) failed.`);
  process.exit(1);
}

console.log("All database performance certification tests passed.");
