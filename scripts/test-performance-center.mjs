#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PERFORMANCE_CENTER_DB_TABLES,
  buildEngineeringSummary,
  buildPerformanceSummary,
  calculateRemainingHeadroom,
  canAccessPerformanceCenter,
  filterReportsByType,
  formatPerformanceSummaryLine,
  getPerformanceCenterDatabaseTableManifest,
  getTrackValueForWindow,
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
assert(adminSource.includes("Performance Engineering Center"), "performance brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/performanceCenter.ts"), "utf8");
assert(constantsSource.includes("PERFORMANCE_ENGINEERING_TRACKS"), "engineering tracks");
assert(constantsSource.includes("startup"), "startup track");
assert(constantsSource.includes("api-latency"), "api latency track");
assert(constantsSource.includes("bundle-size"), "bundle size track");
assert(constantsSource.includes("lcp"), "lcp track");
assert(constantsSource.includes("cls"), "cls track");
assert(constantsSource.includes("fid"), "fid track");
assert(constantsSource.includes("ttfb"), "ttfb track");
assert(constantsSource.includes("slow-queries"), "slow queries track");
assert(constantsSource.includes("slow-endpoints"), "slow endpoints track");
assert(constantsSource.includes("PERFORMANCE_COMPARE_WINDOWS"), "compare windows");
assert(constantsSource.includes("previous-release"), "previous release window");
assert(constantsSource.includes("30-days"), "30 days window");
assert(constantsSource.includes("90-days"), "90 days window");
assert(constantsSource.includes("largest-regressions"), "regressions report");
assert(constantsSource.includes("largest-improvements"), "improvements report");
assert(constantsSource.includes("recommendations"), "recommendations report");
assert(constantsSource.includes("bundle-analysis"), "bundle analysis tool");
assert(constantsSource.includes("image-audit"), "image audit tool");
assert(constantsSource.includes("unused-code"), "unused code tool");
assert(constantsSource.includes("code-splitting"), "code splitting tool");
assert(constantsSource.includes("caching"), "caching tool");
assert(constantsSource.includes("performance_track_snapshots"), "performance_track_snapshots table");
assert(constantsSource.includes("performance_engineering_reports"), "performance_engineering_reports table");
assert(constantsSource.includes("performance_tool_runs"), "performance_tool_runs table");
assert(constantsSource.includes("PERFORMANCE_CENTER_REFRESH_INTERVAL_MS"), "refresh interval");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606261800_performance_engineering_center.sql"),
  "utf8"
);
assert(migrationSource.includes("performance_track_snapshots"), "track snapshots migration");
assert(migrationSource.includes("performance_engineering_reports"), "engineering reports migration");
assert(migrationSource.includes("performance_tool_runs"), "tool runs migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/performance"), "performance permission");

const engineSource = readFileSync(join(rootPath, "src/utils/performanceCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildPerformanceCenterBundle"), "performance engine");
assert(engineSource.includes("buildLivePerformanceCenterBundle"), "live performance engine");

const storeSource = readFileSync(join(rootPath, "src/utils/performanceCenterStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "performance audit logging");
assert(storeSource.includes("resolvePerformanceOptimization"), "optimization resolution");
assert(storeSource.includes("applyPerformanceEngineeringTool"), "engineering tool runner");
assert(storeSource.includes("listPerformanceTracks"), "track listing");

const logicSource = readFileSync(join(rootPath, "src/utils/performanceCenterLogic.ts"), "utf8");
assert(logicSource.includes("buildPerformanceSummary"), "summary builder");
assert(logicSource.includes("buildEngineeringSummary"), "engineering summary builder");
assert(logicSource.includes("getTrackValueForWindow"), "track window resolver");
assert(logicSource.includes("filterReportsByType"), "report filter");

const seedSource = readFileSync(join(rootPath, "src/data/performanceCenterSeed.ts"), "utf8");
assert(seedSource.includes("PERFORMANCE_TRACK_SNAPSHOT_SEED"), "track seed");
assert(seedSource.includes("PERFORMANCE_ENGINEERING_REPORT_SEED"), "report seed");
assert(seedSource.includes("PERFORMANCE_TOOL_RUN_SEED"), "tool run seed");

const adminComponents = [
  "PerformanceEngineeringSummaryCard.tsx",
  "PerformanceCompareCard.tsx",
  "PerformanceTracksCard.tsx",
  "PerformanceReportsCard.tsx",
  "PerformanceEngineeringToolsCard.tsx",
  "ApiPerformanceCard.tsx",
  "DatabasePerformanceCard.tsx",
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
assert(packageSource.includes("certify:database"), "package.json defines certify:database");
assert(packageSource.includes("test:database-performance-certification"), "database cert structure test");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("performance-center.css"), "performance styles imported");

const cssSource = readFileSync(join(rootPath, "src/styles/performance-center.css"), "utf8");
assert(cssSource.includes("performance-tracks-card"), "performance track styles");
assert(cssSource.includes("database-perf-cert-card"), "database cert card styles");

const performancePageSource = readFileSync(
  join(rootPath, "src/components/admin/performance/PerformanceCenterPage.tsx"),
  "utf8"
);
assert(performancePageSource.includes("DatabasePerformanceCertificationCard"), "database cert card mounted");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("PERFORMANCE_CENTER_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("bamsignal.performanceCenter.v1"), "localStorage manifest");
assert(databaseAuditSource.includes("performance_track_snapshots"), "audit track table");

assert(PERFORMANCE_CENTER_DB_TABLES.length === 9, "nine performance tables");
assert(getPerformanceCenterDatabaseTableManifest().length === 9, "database manifest");

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

const tracks = [
  {
    trackId: "startup",
    current: 1800,
    previousRelease: 1900,
    days30: 2000,
    days90: 2200,
    status: "healthy"
  },
  {
    trackId: "lcp",
    current: 2.6,
    previousRelease: 2.4,
    days30: 2.8,
    days90: 3.0,
    status: "watch"
  }
];
const reports = [
  { reportType: "largest-regressions" },
  { reportType: "largest-regressions" },
  { reportType: "largest-improvements" },
  { reportType: "recommendations" }
];
const engineeringSummary = buildEngineeringSummary(tracks, reports, "current");
assert(engineeringSummary.trackCount === 2, "track count");
assert(engineeringSummary.regressionsCount === 2, "regressions count");
assert(engineeringSummary.improvementsCount === 1, "improvements count");
assert(engineeringSummary.recommendationsCount === 1, "recommendations count");

assert(getTrackValueForWindow(tracks[0], "30-days") === 2000, "30 day track value");
assert(filterReportsByType(reports, "largest-regressions").length === 2, "filter regressions");

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

console.log("Performance Engineering Center checks passed.");
