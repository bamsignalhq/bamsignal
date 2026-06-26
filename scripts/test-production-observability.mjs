#!/usr/bin/env node
/**
 * Production Observability Center™ — route, permission, and engine verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRODUCTION_OBSERVABILITY_DB_TABLES,
  buildObservabilitySummaryLine,
  canAccessProductionObservability,
  countObservabilityQueuesByStatus,
  getProductionObservabilityDatabaseTableManifest,
  listSlowObservabilityEndpoints,
  productionObservabilityRouteRegistered,
  resolveWorstObservabilityStatus,
  triageObservabilityErrorRecord
} from "../server/services/productionObservability.js";

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

const adminSource = read("src/constants/productionObservabilityAdmin.ts");
assert(adminSource.includes('PRODUCTION_OBSERVABILITY_ADMIN_PATH = "/hard/observability"'), "observability route");
assert(adminSource.includes("Production Observability Center™"), "observability brand");

const constantsSource = read("src/constants/productionObservability.ts");
assert(constantsSource.includes("supabase"), "supabase service");
assert(constantsSource.includes("postgres"), "postgres service");
assert(constantsSource.includes("redis"), "redis future service");
assert(constantsSource.includes("openai"), "openai service");
assert(constantsSource.includes("OBSERVABILITY_REFRESH_INTERVAL_MS = 30_000"), "30s refresh");
assert(constantsSource.includes("email"), "email queue");
assert(constantsSource.includes("failed"), "failed queue");
assert(constantsSource.includes("observability_error_events"), "error events table");

const typesSource = read("src/types/productionObservability.ts");
assert(typesSource.includes("ProductionObservabilityBundle"), "bundle type");
assert(typesSource.includes("ObservabilityErrorRecord"), "error record type");

const logicSource = read("src/utils/productionObservabilityLogic.ts");
assert(logicSource.includes("buildProductionObservabilityBundle"), "bundle builder");
assert(logicSource.includes("buildObservabilitySummaryCards"), "summary cards builder");
assert(logicSource.includes("listSlowEndpoints"), "slow endpoints helper");

const engineSource = read("src/utils/productionObservabilityEngine.ts");
assert(engineSource.includes("buildLiveProductionObservabilityBundle"), "live bundle builder");

const storeSource = read("src/utils/productionObservabilityStore.ts");
assert(storeSource.includes("bamsignal.productionObservability.v1"), "localStorage key");
assert(storeSource.includes("applyObservabilityErrorTriage"), "error triage store");

const seedSource = read("src/data/productionObservabilitySeed.ts");
assert(seedSource.includes("OBSERVABILITY_SERVICE_SEED"), "service seed");
assert(seedSource.includes("OBSERVABILITY_ERROR_SEED"), "error seed");
assert(seedSource.includes("OBSERVABILITY_DEPLOYMENT_SEED"), "deployment seed");

const permissionsSource = read("src/constants/permissions.ts");
assert(productionObservabilityRouteRegistered(permissionsSource), "observability permissions wired");
assert(permissionsSource.includes("observability"), "observability tab permission");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('observability: "observability"'), "observability slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyProductionObservabilityPage"), "lazy observability page");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "observability"'), "AdminHub mounts observability page");

const pageSource = read("src/components/admin/observability/ProductionObservabilityPage.tsx");
assert(pageSource.includes("ObservabilitySummaryCards"), "summary cards mounted");
assert(pageSource.includes("RecentErrorsCard"), "error center mounted");
assert(pageSource.includes("Refresh now"), "manual refresh");

const navSource = read("src/components/admin/adminConsoleNav.ts");
assert(navSource.includes('"observability"'), "observability nav tab");

const packageSource = read("package.json");
assert(packageSource.includes("test:production-observability"), "package.json defines test script");

const mainSource = read("src/main.tsx");
const entryAdminSource = read("src/styles/entry-admin.css");
assert((entryAdminSource.includes("production-observability.css") || mainSource.includes("production-observability.css")), "observability styles imported");

const cssSource = read("src/styles/production-observability.css");
assert(cssSource.includes("observability-page"), "observability styles");

const databaseAuditSource = read("src/utils/databaseAudit.ts");
assert(databaseAuditSource.includes("bamsignal.productionObservability.v1"), "database audit manifest");

assert(PRODUCTION_OBSERVABILITY_DB_TABLES.length === 5, "five observability tables");
assert(getProductionObservabilityDatabaseTableManifest().length === 5, "database manifest");

assert(canAccessProductionObservability(["ManageOperations"]), "DevOps/operations can access");
assert(canAccessProductionObservability(["SystemAdministration"]), "super admin can access");
assert(canAccessProductionObservability(["ViewExecutiveDashboard"]), "founder/executive can access");
assert(!canAccessProductionObservability(["ViewFinance"]), "finance alone cannot access");

assert(resolveWorstObservabilityStatus(["healthy", "warning"]) === "warning", "worst status resolution");
assert(resolveWorstObservabilityStatus(["healthy", "offline"]) === "offline", "offline wins");

const sampleBundle = {
  errors: [{ triageStatus: "open" }, { triageStatus: "assigned" }],
  services: [{ status: "healthy" }, { status: "warning" }],
  summaryCards: [{ id: "active-members", value: "2,847" }]
};
assert(buildObservabilitySummaryLine(sampleBundle).includes("2,847"), "summary formatter");

const endpoints = [
  { p95ResponseMs: 100 },
  { p95ResponseMs: 500 },
  { p95ResponseMs: 250 }
];
const slow = listSlowObservabilityEndpoints(endpoints, 2);
assert(slow.length === 2 && slow[0].p95ResponseMs === 500, "slow endpoint sort");

const queueCounts = countObservabilityQueuesByStatus([
  { status: "healthy" },
  { status: "warning" },
  { status: "warning" }
]);
assert(queueCounts.warning === 2, "queue status counts");

const error = {
  id: "err_test",
  triageStatus: "open"
};
const resolved = triageObservabilityErrorRecord(error, "resolve", "ops@bamsignal.com");
assert(resolved.triageStatus === "resolved", "error resolved");

const assigned = triageObservabilityErrorRecord(error, "assign", "ops@bamsignal.com", "devops@bamsignal.com");
assert(assigned.triageStatus === "assigned" && assigned.assignedTo === "devops@bamsignal.com", "error assigned");

if (failed > 0) {
  console.error(`\n${failed} production observability test(s) failed.`);
  process.exit(1);
}

console.log("Production Observability Center checks passed.");
