#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/recoveryCenterAdmin.ts"), "utf8");
assert(adminSource.includes('RECOVERY_CENTER_ADMIN_PATH = "/hard/recovery"'), "admin recovery route");
assert(adminSource.includes("Institutional Backup & Recovery Center™"), "recovery center brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/recoveryCenter.ts"), "utf8");
assert(constantsSource.includes("Institutional Backup & Recovery Center™"), "recovery brand");
assert(constantsSource.includes("database-backups"), "database backups area");
assert(constantsSource.includes("configuration-backups"), "configuration backups area");
assert(constantsSource.includes("disaster-recovery"), "disaster recovery level");
assert(constantsSource.includes("RECOVERY_CENTER_POLICIES"), "recovery policies documented");
assert(constantsSource.includes("backup-verification"), "backup verification policy");
assert(constantsSource.includes("disaster-procedures"), "disaster procedures policy");
assert(constantsSource.includes("RECOVERY_CENTER_FUTURE_KINDS"), "future kinds documented");
assert(constantsSource.includes("cross-region-recovery"), "cross region recovery future item");
assert(constantsSource.includes("automated-failover"), "automated failover future item");
assert(constantsSource.includes("cold-storage-archives"), "cold storage archives future item");
assert(constantsSource.includes("RECOVERY_CENTER_METRICS"), "recovery metrics");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("recovery"), "hard routes include recovery tab");

const engineSource = readFileSync(join(rootPath, "src/utils/recoveryCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildRecoveryCenterBundle"), "recovery engine exists");
assert(engineSource.includes("buildRecoveryMetrics"), "recovery metrics in bundle");

const logicSource = readFileSync(join(rootPath, "src/utils/recoveryCenterLogic.ts"), "utf8");
assert(logicSource.includes("buildRecoveryReadiness"), "recovery readiness logic");
assert(logicSource.includes("countHealthyBackups"), "healthy backup counts");
assert(logicSource.includes("summarizeRetention"), "retention status metric");

const seedSource = readFileSync(join(rootPath, "src/data/recoveryCenterSeed.ts"), "utf8");
assert(seedSource.includes("verifiedAt"), "seed includes backup verification");
assert(seedSource.includes("retentionDays"), "seed includes retention");
assert(seedSource.includes("timeline"), "seed includes incident timeline");

const adminComponents = [
  "RecoveryDashboardPage.tsx",
  "BackupStatusCard.tsx",
  "RecoveryPlanCard.tsx",
  "IncidentRecoveryTimeline.tsx",
  "RecoveryReadinessCard.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/recovery", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("RecoveryDashboardPage"), "admin hub mounts recovery dashboard");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"recovery"'), "admin nav includes recovery tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:recovery-center"), "package.json defines test:recovery-center");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("recovery-center.css"), "recovery styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Recovery Center checks passed.");
