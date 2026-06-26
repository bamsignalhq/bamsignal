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
assert(
  adminSource.includes("Business Continuity & Disaster Recovery Center™"),
  "recovery center brand"
);

const constantsSource = readFileSync(join(rootPath, "src/constants/recoveryCenter.ts"), "utf8");
assert(constantsSource.includes("Business Continuity & Disaster Recovery Center™"), "recovery brand");
assert(constantsSource.includes("secrets-inventory"), "secrets inventory backup");
assert(constantsSource.includes("database-failure"), "database failure playbook");
assert(constantsSource.includes("RECOVERY_CENTER_AUDIT_ACTIONS"), "audit actions documented");
assert(constantsSource.includes("RECOVERY_CENTER_FUTURE_ARCHITECTURE"), "future architecture documented");
assert(constantsSource.includes("Multi-region"), "multi-region future item");
assert(constantsSource.includes("Chaos Testing"), "chaos testing future item");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("recovery"), "hard routes include recovery tab");

const engineSource = readFileSync(join(rootPath, "src/utils/recoveryCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildRecoveryCenterBundle"), "recovery engine exists");
assert(engineSource.includes("buildRecoveryHealthSummary"), "health summary in bundle");

const logicSource = readFileSync(join(rootPath, "src/utils/recoveryCenterLogic.ts"), "utf8");
assert(logicSource.includes("buildRecoveryHealthSummary"), "recovery health logic");
assert(logicSource.includes("formatRecoverySummaryLine"), "summary line formatter");

const seedSource = readFileSync(join(rootPath, "src/data/recoveryCenterSeed.ts"), "utf8");
assert(seedSource.includes("verifiedAt"), "seed includes backup verification");
assert(seedSource.includes("retentionDays"), "seed includes retention");
assert(seedSource.includes("timeline"), "seed includes incident timeline");

const adminComponents = [
  "RecoveryDashboardPage.tsx",
  "BackupCard.tsx",
  "RecoveryCard.tsx",
  "PlaybookCard.tsx",
  "RestoreHistoryCard.tsx",
  "RecoveryHealthCard.tsx"
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
assert(packageSource.includes("test:recovery"), "package.json defines test:recovery");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("recovery-center.css") || mainSource.includes("recovery-center.css")), "recovery styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Recovery Center checks passed.");
