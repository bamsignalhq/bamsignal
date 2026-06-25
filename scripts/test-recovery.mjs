#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  RECOVERY_CENTER_DB_TABLES,
  activatePlaybook,
  buildRecoveryHealthSummary,
  canAccessRecoveryCenter,
  formatRecoverySummaryLine,
  getRecoveryCenterDatabaseTableManifest,
  listCriticalDependencies,
  listTierOneSystems,
  verifyRestoreComplete
} from "../server/services/recoveryCenter.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/recoveryCenterAdmin.ts"), "utf8");
assert(adminSource.includes('RECOVERY_CENTER_ADMIN_PATH = "/hard/recovery"'), "recovery route");
assert(
  adminSource.includes("Business Continuity & Disaster Recovery Center™"),
  "recovery brand"
);

const constantsSource = readFileSync(join(rootPath, "src/constants/recoveryCenter.ts"), "utf8");
assert(constantsSource.includes("backups"), "backups area");
assert(constantsSource.includes("secrets-inventory"), "secrets inventory backup");
assert(constantsSource.includes("point-in-time-restore"), "point in time restore");
assert(constantsSource.includes("database-failure"), "database failure playbook");
assert(constantsSource.includes("security-incident"), "security incident playbook");
assert(constantsSource.includes("recovery_backup_records"), "recovery_backup_records table");
assert(constantsSource.includes("RECOVERY_CENTER_AUDIT_ACTIONS"), "audit actions");
assert(constantsSource.includes("RECOVERY_CENTER_FUTURE_ARCHITECTURE"), "future architecture");
assert(constantsSource.includes("Chaos Testing"), "chaos testing future item");
assert(constantsSource.includes("Hot Standby"), "hot standby future item");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606252900_disaster_recovery_center.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("recovery_backup_records"), "recovery_backup_records migration");
assert(migrationSource.includes("recovery_playbook_records"), "recovery_playbook_records migration");
assert(migrationSource.includes("recovery_dependency_links"), "recovery_dependency_links migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/recovery"), "recovery permission");

const engineSource = readFileSync(join(rootPath, "src/utils/recoveryCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildRecoveryCenterBundle"), "recovery engine");

const storeSource = readFileSync(join(rootPath, "src/utils/recoveryCenterStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "recovery audit logging");
assert(storeSource.includes("verifyRecoveryRestore"), "restore verification");
assert(storeSource.includes("activateRecoveryPlaybook"), "playbook activation");

const logicSource = readFileSync(join(rootPath, "src/utils/recoveryCenterLogic.ts"), "utf8");
assert(logicSource.includes("buildRecoveryHealthSummary"), "health summary builder");
assert(logicSource.includes("formatRecoverySummaryLine"), "summary line formatter");

const seedSource = readFileSync(join(rootPath, "src/data/recoveryCenterSeed.ts"), "utf8");
assert(seedSource.includes("BACKUP_RECORD_SEED"), "backup seed");
assert(seedSource.includes("PLAYBOOK_RECORD_SEED"), "playbook seed");
assert(seedSource.includes("RESTORE_HISTORY_SEED"), "restore history seed");
assert(seedSource.includes("CRITICAL_SYSTEM_SEED"), "critical system seed");

const adminComponents = [
  "BackupCard.tsx",
  "RecoveryCard.tsx",
  "PlaybookCard.tsx",
  "RestoreHistoryCard.tsx",
  "RecoveryHealthCard.tsx",
  "RecoveryDashboardPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/recovery", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("RecoveryDashboardPage"), "admin hub mounts recovery page");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"recovery"'), "recovery nav tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:recovery"), "package.json defines test:recovery");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("recovery-center.css"), "recovery styles imported");

const cssSource = readFileSync(join(rootPath, "src/styles/recovery-center.css"), "utf8");
assert(cssSource.includes("recovery-center-page"), "recovery styles");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("RECOVERY_CENTER_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("bamsignal.recoveryCenter.v2"), "localStorage manifest");

assert(RECOVERY_CENTER_DB_TABLES.length === 6, "six recovery tables");
assert(getRecoveryCenterDatabaseTableManifest().length === 6, "database manifest");

assert(canAccessRecoveryCenter(["ManageRecovery"]), "recovery role can access");
assert(canAccessRecoveryCenter(["SystemAdministration"]), "system admin can access");
assert(!canAccessRecoveryCenter(["ViewMembers"]), "members cannot access");

const backups = [
  { id: "b1", status: "healthy" },
  { id: "b2", status: "warning" }
];
const playbooks = [
  { id: "p1", status: "tested" },
  { id: "p2", status: "draft" }
];
const history = [
  { id: "h1", status: "verified" },
  { id: "h2", status: "in-progress" }
];
const operations = [{ id: "o1", status: "in-progress" }];

const summary = buildRecoveryHealthSummary(backups, playbooks, history, operations);
assert(summary.healthyBackups === 1, "healthy backup count");
assert(summary.activeRestores === 2, "active restore count");
assert(formatRecoverySummaryLine(summary).includes("playbooks ready"), "summary line");

const dependencies = [
  { id: "d1", critical: true },
  { id: "d2", critical: false }
];
assert(listCriticalDependencies(dependencies).length === 1, "critical dependencies");

const systems = [
  { id: "s1", tier: "tier-1" },
  { id: "s2", tier: "tier-2" }
];
assert(listTierOneSystems(systems).length === 1, "tier one systems");

const restore = {
  id: "rst_test",
  restoreRef: "RST-TEST",
  modeId: "full-restore",
  categoryId: "database",
  status: "completed",
  startedAt: "2026-01-01T00:00:00.000Z",
  initiatedBy: "ops@bamsignal.com"
};
const verified = verifyRestoreComplete(restore);
assert(verified.status === "verified", "restore verified");

let threw = false;
try {
  verifyRestoreComplete({ ...restore, status: "verified" });
} catch {
  threw = true;
}
assert(threw, "cannot verify twice");

const playbook = {
  id: "pb_test",
  playbookRef: "PB-TEST",
  playbookId: "database-failure",
  title: "Test",
  owner: "ops@bamsignal.com",
  status: "draft",
  rtoMinutes: 30,
  rpoMinutes: 15,
  lastTestedAt: null,
  steps: []
};
const activated = activatePlaybook(playbook, "ops@bamsignal.com");
assert(activated.status === "ready", "playbook activated");

if (failed) {
  console.error(`\n${failed} recovery test(s) failed.`);
  process.exit(1);
}

console.log("Business Continuity & Disaster Recovery Center checks passed.");
