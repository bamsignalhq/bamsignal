#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PERFORMANCE_CENTER_DB_TABLES,
  buildPerformanceSummary,
  calculateRemainingHeadroom,
  canAccessPerformanceCenter,
  formatPerformanceSummaryLine,
  getPerformanceCenterDatabaseTableManifest,
  listHeavyApiEndpoints,
  resolveOptimizationItem
} from "../server/services/performanceCenter.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/performanceCenterAdmin.ts"), "utf8");
assert(adminSource.includes('PERFORMANCE_CENTER_ADMIN_PATH = "/hard/performance"'), "performance route");
assert(
  adminSource.includes("Performance, Capacity & Scalability Center™"),
  "performance brand"
);

const constantsSource = readFileSync(join(rootPath, "src/constants/performanceCenter.ts"), "utf8");
assert(constantsSource.includes("system-performance"), "system performance section");
assert(constantsSource.includes("api-performance"), "api performance section");
assert(constantsSource.includes("capacity-planning"), "capacity planning section");
assert(constantsSource.includes("growth-forecast"), "growth forecast section");
assert(constantsSource.includes("avg-response-time"), "avg response time metric");
assert(constantsSource.includes("cache-hit-rate"), "cache hit rate metric");
assert(constantsSource.includes("largest-queries"), "largest queries category");
assert(constantsSource.includes("background-jobs"), "background jobs category");
assert(constantsSource.includes("performance_metric_snapshots"), "performance_metric_snapshots table");
assert(constantsSource.includes("PERFORMANCE_AUDIT_ACTIONS"), "audit actions");
assert(constantsSource.includes("PERFORMANCE_FUTURE_ARCHITECTURE"), "future architecture");
assert(constantsSource.includes("Auto Scaling"), "auto scaling future item");
assert(constantsSource.includes("CDN Optimization"), "cdn optimization future item");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606254000_performance_center.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("performance_metric_snapshots"), "performance_metric_snapshots migration");
assert(migrationSource.includes("performance_api_profiles"), "performance_api_profiles migration");
assert(migrationSource.includes("performance_growth_forecasts"), "performance_growth_forecasts migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/performance"), "performance permission");

const engineSource = readFileSync(join(rootPath, "src/utils/performanceCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildPerformanceCenterBundle"), "performance engine");

const storeSource = readFileSync(join(rootPath, "src/utils/performanceCenterStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "performance audit logging");
assert(storeSource.includes("resolvePerformanceOptimization"), "optimization resolution");

const logicSource = readFileSync(join(rootPath, "src/utils/performanceCenterLogic.ts"), "utf8");
assert(logicSource.includes("buildPerformanceSummary"), "summary builder");
assert(logicSource.includes("formatPerformanceSummaryLine"), "summary line formatter");

const seedSource = readFileSync(join(rootPath, "src/data/performanceCenterSeed.ts"), "utf8");
assert(seedSource.includes("PERFORMANCE_METRIC_SEED"), "metric seed");
assert(seedSource.includes("PERFORMANCE_API_PROFILE_SEED"), "api profile seed");
assert(seedSource.includes("PERFORMANCE_CAPACITY_PLAN_SEED"), "capacity plan seed");
assert(seedSource.includes("PERFORMANCE_GROWTH_FORECAST_SEED"), "growth forecast seed");

const adminComponents = [
  "PerformanceOverviewCard.tsx",
  "ApiPerformanceCard.tsx",
  "DatabasePerformanceCard.tsx",
  "CapacityPlanningCard.tsx",
  "OptimizationCard.tsx",
  "GrowthForecastCard.tsx",
  "PerformanceCenterPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/performance", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("PerformanceCenterPage"), "admin hub mounts performance page");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"performance"'), "performance nav tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:performance-center"), "package.json defines test:performance-center");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("performance-center.css"), "performance styles imported");

const cssSource = readFileSync(join(rootPath, "src/styles/performance-center.css"), "utf8");
assert(cssSource.includes("performance-center-page"), "performance styles");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("PERFORMANCE_CENTER_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("bamsignal.performanceCenter.v1"), "localStorage manifest");

assert(PERFORMANCE_CENTER_DB_TABLES.length === 6, "six performance tables");
assert(getPerformanceCenterDatabaseTableManifest().length === 6, "database manifest");

assert(canAccessPerformanceCenter(["ManageOperations"]), "operations role can access");
assert(canAccessPerformanceCenter(["SystemAdministration"]), "system admin can access");
assert(canAccessPerformanceCenter(["ViewExecutiveDashboard"]), "executive can access");
assert(!canAccessPerformanceCenter(["ViewMembers"]), "members cannot access");

const metrics = [
  { metricId: "avg-response-time", value: 142, status: "healthy" },
  { metricId: "p95", value: 380, status: "healthy" },
  { metricId: "p99", value: 720, status: "watch" },
  { metricId: "cache-hit-rate", value: 87, status: "watch" },
  { metricId: "worker-utilization", value: 68, status: "watch" }
];
const capacityPlans = [
  { remainingHeadroomPercent: 52, status: "watch" },
  { remainingHeadroomPercent: 38, status: "strained" }
];
const optimizationItems = [
  { status: "open", impact: "high" },
  { status: "open", impact: "medium" },
  { status: "resolved", impact: "high" }
];
const growthForecasts = [{ headroomPercent: 42, status: "watch" }];

const summary = buildPerformanceSummary(
  metrics,
  capacityPlans,
  optimizationItems,
  growthForecasts
);
assert(summary.avgResponseMs === 142, "avg response ms");
assert(summary.openOptimizations === 2, "open optimizations");
assert(summary.highImpactOptimizations === 1, "high impact optimizations");
assert(formatPerformanceSummaryLine(summary).includes("health"), "summary line");

const apiProfiles = [
  { id: "a1", p95Ms: 420 },
  { id: "a2", p95Ms: 180 },
  { id: "a3", p95Ms: 890 }
];
assert(listHeavyApiEndpoints(apiProfiles, 300).length === 2, "heavy api endpoints");

assert(calculateRemainingHeadroom(2500, 5000) === 50, "headroom calculation");

const optimization = {
  id: "opt_test",
  itemRef: "OPT-TEST",
  categoryId: "heavy-apis",
  sectionId: "api-performance",
  title: "Test",
  detail: "Test detail",
  impact: "medium",
  status: "open",
  ownerEmail: "ops@bamsignal.com",
  openedAt: "2026-01-01T00:00:00.000Z"
};
const resolved = resolveOptimizationItem(optimization);
assert(resolved.status === "resolved", "optimization resolved");

let threw = false;
try {
  resolveOptimizationItem({ ...optimization, status: "resolved" });
} catch {
  threw = true;
}
assert(threw, "cannot resolve twice");

if (failed) {
  console.error(`\n${failed} performance center test(s) failed.`);
  process.exit(1);
}

console.log("Performance, Capacity & Scalability Center checks passed.");
