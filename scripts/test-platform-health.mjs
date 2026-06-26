#!/usr/bin/env node
/**
 * Platform Health Center™ — route, permission, and engine verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PLATFORM_HEALTH_DB_TABLES,
  buildPlatformHealthSummaryLine,
  canAccessPlatformHealthCenter,
  countPlatformHealthServicesByStatus,
  getPlatformHealthDatabaseTableManifest,
  listActivePlatformHealthIncidents,
  platformHealthRouteRegistered,
  resolveWorstPlatformHealthStatus
} from "../server/services/platformHealth.js";

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

const adminSource = read("src/constants/platformHealthAdmin.ts");
assert(adminSource.includes('PLATFORM_HEALTH_ADMIN_PATH = "/hard/platform-health"'), "platform health route");
assert(adminSource.includes("Platform Health Center™"), "platform health brand");

const constantsSource = read("src/constants/platformHealth.ts");
assert(constantsSource.includes("supabase"), "supabase service");
assert(constantsSource.includes("authentication"), "authentication service");
assert(constantsSource.includes("background-workers"), "background workers service");
assert(constantsSource.includes("webhooks"), "webhooks service");
assert(constantsSource.includes("cron"), "cron service");
assert(constantsSource.includes("PLATFORM_HEALTH_REFRESH_INTERVAL_MS = 30_000"), "30s refresh");
assert(constantsSource.includes("platform_health_incidents"), "incidents table");

const typesSource = read("src/types/platformHealth.ts");
assert(typesSource.includes("PlatformHealthCenterBundle"), "bundle type");
assert(typesSource.includes("PlatformHealthIncidentRecord"), "incident type");
assert(typesSource.includes("recoveryAttempts"), "recovery attempts field");

const logicSource = read("src/utils/platformHealthLogic.ts");
assert(logicSource.includes("buildPlatformHealthCenterBundle"), "bundle builder");
assert(logicSource.includes("acknowledgePlatformHealthIncident"), "acknowledge helper");
assert(logicSource.includes("buildPlatformHealthSummaryLine"), "summary line helper");

const engineSource = read("src/utils/platformHealthEngine.ts");
assert(engineSource.includes("buildLivePlatformHealthCenterBundle"), "live bundle builder");

const storeSource = read("src/utils/platformHealthStore.ts");
assert(storeSource.includes("bamsignal.platformHealthCenter.v1"), "localStorage key");
assert(storeSource.includes("applyPlatformHealthAcknowledgement"), "acknowledgement store");

const seedSource = read("src/data/platformHealthSeed.ts");
assert(seedSource.includes("PLATFORM_HEALTH_SERVICE_SEED"), "service seed");
assert(seedSource.includes("PLATFORM_HEALTH_INCIDENT_SEED"), "incident seed");
assert(seedSource.includes("PLATFORM_HEALTH_ALERT_SEED"), "alert seed");

const permissionsSource = read("src/constants/permissions.ts");
assert(platformHealthRouteRegistered(permissionsSource), "platform health permissions wired");
assert(permissionsSource.includes("platformhealth"), "platformhealth tab permission");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('platformhealth: "platform-health"'), "platform health slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyPlatformHealthCenterPage"), "lazy platform health page");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "platformhealth"'), "admin hub tab wired");

const navSource = read("src/components/admin/adminConsoleNav.ts");
assert(navSource.includes('"platformhealth"'), "nav tab id");

const cssSource = read("src/styles/platform-health-center.css");
assert(cssSource.includes("platform-health-traffic-light"), "traffic light styles");

const mainSource = read("src/main.tsx");
const entryAdminSource = read("src/styles/entry-admin.css");
assert((entryAdminSource.includes("platform-health-center.css") || mainSource.includes("platform-health-center.css")), "styles imported");

const packageSource = read("package.json");
assert(packageSource.includes("test:platform-health"), "package.json defines test:platform-health");

const sampleBundle = {
  summary: { healthyCount: 10, warningCount: 3, criticalCount: 1 },
  services: [
    { status: "healthy" },
    { status: "warning" },
    { status: "critical" }
  ],
  activeIncidents: [{ status: "active" }, { status: "acknowledged" }],
  resolvedIncidents: [{ status: "resolved" }]
};

assert(canAccessPlatformHealthCenter(["ManageOperations"]), "ops can access");
assert(!canAccessPlatformHealthCenter(["ViewArchives"]), "archives cannot access");
assert(resolveWorstPlatformHealthStatus(["healthy", "warning", "critical"]) === "critical", "worst status");
assert(buildPlatformHealthSummaryLine(sampleBundle).includes("10 healthy"), "summary line");
assert(countPlatformHealthServicesByStatus(sampleBundle.services).critical === 1, "count by status");
assert(listActivePlatformHealthIncidents(sampleBundle.activeIncidents).length === 2, "active incidents");
assert(getPlatformHealthDatabaseTableManifest().length === PLATFORM_HEALTH_DB_TABLES.length, "db manifest");
assert(PLATFORM_HEALTH_DB_TABLES.includes("platform_health_alerts"), "alerts table listed");

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: Platform Health Center™ verification complete.");
