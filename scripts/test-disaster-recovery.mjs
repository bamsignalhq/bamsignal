#!/usr/bin/env node
/**
 * Backup & Disaster Recovery Center™ — route, permission, and engine verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DISASTER_RECOVERY_DB_TABLES,
  buildDisasterRecoverySummaryLine,
  countMonitorsByStatus,
  disasterRecoveryRouteRegistered,
  getDisasterRecoveryDatabaseTableManifest,
  integrityRateFromMonitors
} from "../server/services/disasterRecovery.js";

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

const adminSource = read("src/constants/disasterRecoveryAdmin.ts");
assert(adminSource.includes('DISASTER_RECOVERY_ADMIN_PATH = "/hard/disaster-recovery"'), "disaster recovery route");
assert(adminSource.includes("Backup & Disaster Recovery Center™"), "disaster recovery brand");

const constantsSource = read("src/constants/disasterRecovery.ts");
assert(constantsSource.includes("database-backups"), "database backups monitor");
assert(constantsSource.includes("release-snapshots"), "release snapshots monitor");
assert(constantsSource.includes("run-backup"), "run backup operation");
assert(constantsSource.includes("recovery-simulation"), "recovery simulation");
assert(constantsSource.includes("complete-platform-outage"), "complete platform outage plan");
assert(constantsSource.includes("last-backup"), "last backup report");
assert(constantsSource.includes("DISASTER_RECOVERY_REFRESH_INTERVAL_MS = 30_000"), "30s refresh");
assert(constantsSource.includes("disaster_backup_monitors"), "monitors table");

const typesSource = read("src/types/disasterRecovery.ts");
assert(typesSource.includes("BackupDisasterRecoveryCenterBundle"), "bundle type");
assert(typesSource.includes("DisasterBackupMonitorRecord"), "monitor record type");
assert(typesSource.includes("DisasterPlanRecord"), "plan record type");

const logicSource = read("src/utils/disasterRecoveryLogic.ts");
assert(logicSource.includes("buildBackupDisasterRecoveryCenterBundle"), "bundle builder");
assert(logicSource.includes("buildDisasterReportMetrics"), "report metrics");
assert(logicSource.includes("buildDisasterRecoverySummary"), "summary builder");

const engineSource = read("src/utils/disasterRecoveryEngine.ts");
assert(engineSource.includes("buildLiveDisasterRecoveryBundle"), "live bundle builder");
assert(engineSource.includes("runDisasterRecoveryOperation"), "run operation");

const storeSource = read("src/utils/disasterRecoveryStore.ts");
assert(storeSource.includes("bamsignal.disasterRecoveryCenter.v1"), "localStorage key");
assert(storeSource.includes("applyDisasterRecoveryOperation"), "operation store");

const seedSource = read("src/data/disasterRecoverySeed.ts");
assert(seedSource.includes("DISASTER_BACKUP_MONITOR_SEED"), "monitor seed");
assert(seedSource.includes("DISASTER_PLAN_SEED"), "plan seed");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes("DISASTER_RECOVERY_ADMIN_PATH"), "hard routes include disaster recovery path");
assert(hardRoutesSource.includes('disasterrecovery: "disaster-recovery"'), "disaster recovery tab slug");

const permissionsSource = read("src/constants/permissions.ts");
assert(disasterRecoveryRouteRegistered(permissionsSource), "disaster recovery permissions wired");
assert(permissionsSource.includes("disasterrecovery"), "disasterrecovery tab permission");

const adminComponents = [
  "DisasterRecoveryCenterPage.tsx",
  "DisasterRecoverySummaryCard.tsx",
  "DisasterBackupMonitorsCard.tsx",
  "DisasterOperationsCard.tsx",
  "DisasterPlansCard.tsx",
  "DisasterReportsCard.tsx",
  "DisasterHistoryCard.tsx"
];

for (const file of adminComponents) {
  const source = read(`src/components/admin/disasterRecovery/${file}`);
  assert(source.length > 0, `${file} exists`);
}

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyDisasterRecoveryCenterPage"), "lazy disaster recovery page");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "disasterrecovery"'), "admin hub tab wired");

const mainSource = read("src/main.tsx");
const entryAdminSource = read("src/styles/entry-admin.css");
assert((entryAdminSource.includes("disaster-recovery-center.css") || mainSource.includes("disaster-recovery-center.css")), "styles imported");

const migrationSource = read("supabase/migrations/202606261300_disaster_recovery_center.sql");
assert(migrationSource.includes("disaster_recovery_plans"), "plans migration");

const packageSource = read("package.json");
assert(packageSource.includes("test:disaster-recovery"), "package.json defines test:disaster-recovery");

const counts = countMonitorsByStatus([
  { status: "healthy" },
  { status: "healthy" },
  { status: "failed" }
]);
assert(counts.healthy === 2 && counts.failed === 1, "monitor status counts");

const integrity = integrityRateFromMonitors([
  { lastVerifiedAt: "2026-06-26T00:00:00.000Z" },
  { lastVerifiedAt: null }
]);
assert(integrity === 50, "integrity rate");

assert(DISASTER_RECOVERY_DB_TABLES.length === 4, "four disaster recovery tables");
assert(getDisasterRecoveryDatabaseTableManifest().length === 4, "table manifest");

const summaryLine = buildDisasterRecoverySummaryLine({ healthyMonitors: 5, failedMonitors: 1 });
assert(summaryLine.includes("healthy=5"), "summary line format");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Backup & Disaster Recovery Center checks passed.");
