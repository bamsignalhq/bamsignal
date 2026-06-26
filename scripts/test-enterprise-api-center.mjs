#!/usr/bin/env node
/**
 * Enterprise API Center — route, permission, and engine verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ENTERPRISE_API_CENTER_DB_TABLES,
  ENTERPRISE_API_TOOLS,
  buildEnterpriseApiCenterSummary,
  canAccessEnterpriseApiCenter,
  enterpriseApiRouteRegistered,
  filterEndpointsByStatus,
  formatEnterpriseApiSummaryLine,
  getEnterpriseApiCenterDatabaseTableManifest,
  sortEndpointsByLatency
} from "../server/services/enterpriseApiCenter.js";

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

const adminSource = read("src/constants/enterpriseApiCenterAdmin.ts");
assert(adminSource.includes('ENTERPRISE_API_CENTER_ADMIN_PATH = "/hard/api"'), "enterprise api route");
assert(adminSource.includes("Enterprise API Center"), "enterprise api brand");

const constantsSource = read("src/constants/enterpriseApiCenter.ts");
assert(constantsSource.includes("disable-endpoint"), "disable endpoint tool");
assert(constantsSource.includes("maintenance-mode"), "maintenance mode tool");
assert(constantsSource.includes("retry-failed-jobs"), "retry failed jobs tool");
assert(constantsSource.includes("replay-requests"), "replay requests tool");
assert(constantsSource.includes("api-documentation"), "api documentation tool");
assert(constantsSource.includes("openapi-export"), "openapi export tool");
assert(constantsSource.includes("ENTERPRISE_API_REFRESH_INTERVAL_MS = 30_000"), "30s refresh");
assert(constantsSource.includes("enterprise_api_endpoints"), "endpoints table");

const typesSource = read("src/types/enterpriseApiCenter.ts");
assert(typesSource.includes("EnterpriseApiCenterBundle"), "bundle type");
assert(typesSource.includes("EnterpriseApiEndpoint"), "endpoint type");

const logicSource = read("src/utils/enterpriseApiCenterLogic.ts");
assert(logicSource.includes("buildEnterpriseApiCenterBundle"), "bundle builder");
assert(logicSource.includes("filterEndpointsByStatus"), "status filter");

const engineSource = read("src/utils/enterpriseApiCenterEngine.ts");
assert(engineSource.includes("buildLiveEnterpriseApiCenterBundle"), "live bundle builder");

const storeSource = read("src/utils/enterpriseApiCenterStore.ts");
assert(storeSource.includes("bamsignal.enterpriseApiCenter.v1"), "localStorage key");
assert(storeSource.includes("applyEnterpriseApiTool"), "apply api tool");

const seedSource = read("src/data/enterpriseApiCenterSeed.ts");
assert(seedSource.includes("ENTERPRISE_API_ENDPOINT_SEED"), "endpoint seed");
assert(seedSource.includes("/api/auth/pin-login"), "pin login endpoint seed");
assert(seedSource.includes("ENTERPRISE_API_FAILED_JOB_SEED"), "failed job seed");

const migrationSource = read("supabase/migrations/202606261900_enterprise_api_center.sql");
assert(migrationSource.includes("enterprise_api_endpoints"), "endpoints migration");
assert(migrationSource.includes("enterprise_api_failed_jobs"), "failed jobs migration");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes("ENTERPRISE_API_CENTER_ADMIN_PATH"), "hard routes include api path");
assert(hardRoutesSource.includes('enterpriseapi: "api"'), "enterprise api tab slug");

const permissionsSource = read("src/constants/permissions.ts");
assert(enterpriseApiRouteRegistered(permissionsSource), "enterprise api permissions wired");
assert(permissionsSource.includes("enterpriseapi"), "enterpriseapi tab permission");

const adminComponents = [
  "EnterpriseApiCenterPage.tsx",
  "EnterpriseApiSummaryCard.tsx",
  "EnterpriseApiEndpointsCard.tsx",
  "EnterpriseApiToolsCard.tsx",
  "EnterpriseApiFailedJobsCard.tsx"
];

for (const file of adminComponents) {
  try {
    read(`src/components/admin/enterpriseApi/${file}`);
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = read("src/pages/AdminHubPage.tsx");
assert(hubSource.includes("EnterpriseApiCenterPage"), "admin hub mounts enterprise api page");

const navSource = read("src/components/admin/adminConsoleNav.ts");
assert(navSource.includes('"enterpriseapi"'), "enterprise api nav tab");

const packageSource = read("package.json");
assert(packageSource.includes("test:enterprise-api-center"), "package.json defines test:enterprise-api-center");

const mainSource = read("src/main.tsx");
const entryAdminSource = read("src/styles/entry-admin.css");
assert((entryAdminSource.includes("enterprise-api-center.css") || mainSource.includes("enterprise-api-center.css")), "enterprise api styles imported");

const cssSource = read("src/styles/enterprise-api-center.css");
assert(cssSource.includes("enterprise-api-endpoints-card"), "endpoint table styles");

const databaseAuditSource = read("src/utils/databaseAudit.ts");
assert(databaseAuditSource.includes("bamsignal.enterpriseApiCenter.v1"), "localStorage manifest");

assert(ENTERPRISE_API_CENTER_DB_TABLES.length === 4, "four enterprise api tables");
assert(getEnterpriseApiCenterDatabaseTableManifest().length === 4, "database manifest");
assert(ENTERPRISE_API_TOOLS.length === 6, "six api tools");

assert(canAccessEnterpriseApiCenter(["ManageOperations"]), "operations role can access");
assert(canAccessEnterpriseApiCenter(["SystemAdministration"]), "system admin can access");
assert(canAccessEnterpriseApiCenter(["ViewExecutiveDashboard"]), "executive can access");
assert(!canAccessEnterpriseApiCenter(["ViewMembers"]), "members cannot access");

const endpoints = [
  {
    status: "healthy",
    latencyMs: 100,
    requestsPerMin: 100,
    errorCount: 1,
    errorRate: 1
  },
  {
    status: "degraded",
    latencyMs: 500,
    requestsPerMin: 50,
    errorCount: 5,
    errorRate: 10
  },
  {
    status: "maintenance",
    latencyMs: 0,
    requestsPerMin: 0,
    errorCount: 0,
    errorRate: 0
  }
];
const failedJobs = [{ status: "pending" }, { status: "retried" }];
const summary = buildEnterpriseApiCenterSummary(endpoints, failedJobs);
assert(summary.endpointCount === 3, "endpoint count");
assert(summary.degradedCount === 1, "degraded count");
assert(summary.failedJobsCount === 1, "failed jobs count");
assert(formatEnterpriseApiSummaryLine(summary).includes("ops"), "summary line");

assert(filterEndpointsByStatus(endpoints, "healthy").length === 1, "filter healthy");
assert(sortEndpointsByLatency(endpoints)[0].latencyMs === 500, "sort by latency");

if (failed) {
  console.error(`\n${failed} enterprise api center test(s) failed.`);
  process.exit(1);
}

console.log("Enterprise API Center checks passed.");
