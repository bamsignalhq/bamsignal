#!/usr/bin/env node
/**
 * Security Operations Center — route, permission, and engine verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SECURITY_INCIDENT_STATUSES,
  SECURITY_OPERATIONS_CENTER_DB_TABLES,
  SECURITY_OPS_MODULES,
  SECURITY_OPS_SCORE_DOMAINS,
  SECURITY_OPS_TOOLS,
  buildSecurityOpsSummary,
  canAccessSecurityOperationsCenter,
  computeOverallSecurityScore,
  filterEventsByModule,
  formatSecurityOpsSummaryLine,
  getSecurityOperationsCenterDatabaseTableManifest,
  securityOperationsRouteRegistered
} from "../server/services/securityOperationsCenter.js";

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

const adminSource = read("src/constants/securityOperationsCenterAdmin.ts");
assert(adminSource.includes('SECURITY_OPERATIONS_CENTER_ADMIN_PATH = "/hard/security"'), "security ops route");
assert(adminSource.includes("Security Operations Center"), "security ops brand");

const constantsSource = read("src/constants/securityOperationsCenter.ts");
assert(constantsSource.includes("suspicious-logins"), "suspicious logins module");
assert(constantsSource.includes("brute-force-attempts"), "brute force module");
assert(constantsSource.includes("invalidate-sessions"), "invalidate sessions tool");
assert(constantsSource.includes("permanent-block"), "permanent block tool");
assert(constantsSource.includes("SECURITY_OPS_REFRESH_INTERVAL_MS = 30_000"), "30s refresh");
assert(constantsSource.includes("security_ops_incidents"), "incidents table");

const typesSource = read("src/types/securityOperationsCenter.ts");
assert(typesSource.includes("SecurityOperationsCenterBundle"), "bundle type");
assert(typesSource.includes("SecurityOpsIncident"), "incident type");

const logicSource = read("src/utils/securityOperationsCenterLogic.ts");
assert(logicSource.includes("buildSecurityOperationsCenterBundle"), "bundle builder");
assert(logicSource.includes("filterEventsByModule"), "module filter");

const engineSource = read("src/utils/securityOperationsCenterEngine.ts");
assert(engineSource.includes("buildLiveSecurityOperationsCenterBundle"), "live bundle builder");

const storeSource = read("src/utils/securityOperationsCenterStore.ts");
assert(storeSource.includes("bamsignal.securityOperationsCenter.v1"), "localStorage key");
assert(storeSource.includes("applySecurityOpsTool"), "apply security tool");

const seedSource = read("src/data/securityOperationsCenterSeed.ts");
assert(seedSource.includes("SECURITY_OPS_EVENT_SEED"), "event seed");
assert(seedSource.includes("SECURITY_OPS_INCIDENT_SEED"), "incident seed");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes("SECURITY_OPERATIONS_CENTER_ADMIN_PATH"), "hard routes include security ops path");
assert(hardRoutesSource.includes('securityops: "security"'), "security ops tab slug");

const permissionsSource = read("src/constants/permissions.ts");
assert(securityOperationsRouteRegistered(permissionsSource), "security ops permissions wired");
assert(permissionsSource.includes("securityops"), "securityops tab permission");

const adminComponents = [
  "SecurityOperationsCenterPage.tsx",
  "SecurityOpsSummaryCard.tsx",
  "SecurityOpsScoresCard.tsx",
  "SecurityOpsEventsCard.tsx",
  "SecurityOpsToolsCard.tsx",
  "SecurityOpsIncidentsCard.tsx"
];

for (const file of adminComponents) {
  try {
    read(`src/components/admin/securityOps/${file}`);
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = read("src/pages/AdminHubPage.tsx");
assert(hubSource.includes("SecurityOperationsCenterPage"), "admin hub mounts security ops page");

const navSource = read("src/components/admin/adminConsoleNav.ts");
assert(navSource.includes('"securityops"'), "security ops nav tab");

const packageSource = read("package.json");
assert(packageSource.includes("test:security-operations"), "package.json defines test:security-operations");

const mainSource = read("src/main.tsx");
const entryAdminSource = read("src/styles/entry-admin.css");
assert((entryAdminSource.includes("security-operations-center.css") || mainSource.includes("security-operations-center.css")), "security ops styles imported");

const migrationSource = read("supabase/migrations/202606261700_security_operations_center.sql");
assert(migrationSource.includes("security_ops_events"), "events migration");

assert(SECURITY_OPERATIONS_CENTER_DB_TABLES.length === 5, "five security ops tables");
assert(getSecurityOperationsCenterDatabaseTableManifest().length === 5, "database manifest");
assert(SECURITY_OPS_MODULES.length === 10, "ten security modules");
assert(SECURITY_OPS_SCORE_DOMAINS.length === 7, "seven score domains");
assert(SECURITY_OPS_TOOLS.length === 6, "six security tools");
assert(SECURITY_INCIDENT_STATUSES.length === 4, "four incident statuses");

assert(canAccessSecurityOperationsCenter(["ManageSafety"]), "safety can access");
assert(canAccessSecurityOperationsCenter(["SystemAdministration"]), "system admin can access");
assert(!canAccessSecurityOperationsCenter(["ViewMembers"]), "members cannot access");

const scores = [{ score: 90 }, { score: 80 }, { score: 100 }];
assert(computeOverallSecurityScore(scores) === 90, "overall score average");

const events = [
  { moduleId: "brute-force-attempts", severity: "critical" },
  { moduleId: "authentication", severity: "warning" }
];
const incidents = [{ status: "open" }, { status: "resolved" }];
const summary = buildSecurityOpsSummary(scores, events, incidents);
assert(summary.openIncidents === 1, "open incidents count");
assert(summary.criticalEvents === 1, "critical events count");
assert(formatSecurityOpsSummaryLine(summary).includes("security score"), "summary line");

const filtered = filterEventsByModule(events, "authentication");
assert(filtered.length === 1, "module event filter");

if (failed) {
  console.error(`\n${failed} security operations test(s) failed.`);
  process.exit(1);
}

console.log("Security Operations Center checks passed.");
