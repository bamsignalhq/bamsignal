#!/usr/bin/env node
/**
 * Production performance optimization — bundle guards + optimization audit verification.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  adminHubUsesLazyTabs,
  buildPerformanceScore,
  canAccessProductionPerformance,
  formatPerformanceSummaryLine,
  scoreToPerformanceStatus
} from "../server/services/productionPerformance.js";

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

// --- Bundle performance (from test-bundle-performance.mjs) ---
const appSource = read("src/App.tsx");
const lazyRoutesSource = read("src/app/lazyRoutes.ts");
const photoUploadSource = read("src/utils/photoUpload.ts");
const adminHubSource = read("src/pages/AdminHubPage.tsx");
const swSource = existsSync(join(rootPath, "public/sw.js")) ? read("public/sw.js") : "";

assert(lazyRoutesSource.includes("LazyAdminConsoleRoot"), "lazyRoutes exports LazyAdminConsoleRoot");
assert(lazyRoutesSource.includes("LazyPublicMarketingRoutes"), "lazyRoutes exports LazyPublicMarketingRoutes");
assert(!appSource.includes('from "./pages/AdminHubPage"'), "App.tsx must not eagerly import AdminHubPage");
assert(appSource.includes("LazyAdminConsoleRoot"), "App.tsx lazy-loads admin console");
assert(photoUploadSource.includes('await import("heic2any")'), "heic2any dynamically imported");
assert(!photoUploadSource.includes('from "heic2any"'), "heic2any not statically imported");

assert(adminHubUsesLazyTabs(adminHubSource), "AdminHub uses lazyAdminHubTabs");
assert(adminHubSource.includes("AdminLazyTab"), "AdminHub wraps tabs in AdminLazyTab");
assert(adminHubSource.includes("lazyAdminHubTabs"), "AdminHub imports lazy tab modules");

const discoverSource = read("src/services/discoverProfiles.ts");
const premiumSource = read("src/services/premiumStatus.ts");
const inflightSource = read("src/utils/inflightPromise.ts");
assert(inflightSource.includes("dedupeInflight"), "inflight dedupe helper exists");
assert(discoverSource.includes("dedupeInflight"), "discover profiles deduped");
assert(premiumSource.includes("dedupeInflight"), "premium status deduped");

if (swSource) {
  assert(swSource.includes("caches.delete"), "service worker deletes stale caches");
  assert(!swSource.includes("location.reload()"), "service worker avoids reload loops");
}

const viteSource = read("vite.config.ts");
assert(viteSource.includes("manualChunks"), "vite manual chunks configured");
assert(viteSource.includes("heic2any"), "heic2any manual chunk");

// --- Production performance audit ---
const adminConstants = read("src/constants/productionPerformanceAdmin.ts");
assert(adminConstants.includes("/hard/performance-optimization"), "performance optimization route");
assert(adminConstants.includes("Production Performance Optimization"), "performance optimization brand");

const constantsSource = read("src/constants/productionPerformance.ts");
assert(constantsSource.includes("PERFORMANCE_AUDIT_DOMAINS"), "audit domains defined");
assert(constantsSource.includes("bundle-size"), "bundle size domain");
assert(constantsSource.includes("duplicate-requests"), "duplicate requests domain");
assert(constantsSource.includes("PERFORMANCE_OPTIMIZATION_FIXES"), "optimization fixes list");

const logicSource = read("src/utils/productionPerformanceLogic.ts");
assert(logicSource.includes("buildPerformanceHealthReport"), "health report builder");
assert(logicSource.includes("buildPerformanceChecklist"), "checklist builder");
assert(logicSource.includes("buildOptimizationTargets"), "optimization targets");

const engineSource = read("src/utils/productionPerformanceEngine.ts");
assert(engineSource.includes("buildProductionPerformanceReport"), "production performance engine");

const permissionsSource = read("src/constants/permissions.ts");
assert(permissionsSource.includes("performanceoptimization"), "performanceoptimization permission");
assert(permissionsSource.includes("/hard/performance-optimization"), "performance route enforced");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('performanceoptimization: "performance-optimization"'), "performance slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyProductionPerformanceDashboard"), "lazy production performance dashboard");
assert(lazyTabsSource.includes("lazy(()"), "lazy tab modules use React.lazy");

const dashboardSource = read("src/components/admin/performanceOptimization/ProductionPerformanceDashboard.tsx");
assert(dashboardSource.includes("PerformanceHealthReportCard"), "dashboard mounts health report");
assert(dashboardSource.includes("PerformanceOptimizationChecklist"), "dashboard mounts checklist");

assert(canAccessProductionPerformance(["ManageOperations"]), "operations can access performance optimization");
assert(!canAccessProductionPerformance(["ViewFinance"]), "finance alone cannot access");

const sampleDomains = [
  { status: "optimized", score: 90 },
  { status: "review", score: 72 },
  { status: "slow", score: 40 }
];
assert(buildPerformanceScore(sampleDomains) > 0, "performance score computed");
assert(scoreToPerformanceStatus(90, false) === "optimized", "high score maps to optimized");
assert(scoreToPerformanceStatus(60, false) === "review", "mid score maps to review");

const sampleReport = {
  passedCheckCount: 8,
  reviewIssueCount: 3,
  slowIssueCount: 1,
  overallScore: 80
};
assert(formatPerformanceSummaryLine(sampleReport).includes("8 passed"), "summary line formatted");

const migrationSource = read("migrations/0002_baseline_bamsignal_schema.sql");
assert(migrationSource.includes("app_member_profiles_city_idx"), "discover city index in schema");

if (failed > 0) {
  console.error(`\n${failed} performance test(s) failed.`);
  process.exit(1);
}

console.log("All production performance tests passed.");
