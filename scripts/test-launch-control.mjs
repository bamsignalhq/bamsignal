#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LAUNCH_CONTROL_CENTER_DB_TABLES,
  buildLaunchControlSummary,
  canAccessLaunchControlCenter,
  formatLaunchSummaryLine,
  getLaunchControlCenterDatabaseTableManifest,
  listOpenCriticalBlockers,
  recordLaunchApproval,
  resolveLaunchBlocker
} from "../server/services/launchControlCenter.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/launchControlCenterAdmin.ts"), "utf8");
assert(adminSource.includes('LAUNCH_CONTROL_CENTER_ADMIN_PATH = "/hard/launch-control"'), "launch control route");
assert(
  adminSource.includes("Institutional Launch Control Center™"),
  "launch control brand"
);

const constantsSource = readFileSync(join(rootPath, "src/constants/launchControlCenter.ts"), "utf8");
assert(constantsSource.includes("readiness"), "readiness section");
assert(constantsSource.includes("critical-blockers"), "critical blockers section");
assert(constantsSource.includes("go-no-go"), "go no go section");
assert(constantsSource.includes("launch-timeline"), "launch timeline section");
assert(constantsSource.includes("infrastructure"), "infrastructure domain");
assert(constantsSource.includes("training"), "training domain");
assert(constantsSource.includes("needs-attention"), "needs attention status");
assert(constantsSource.includes("launch_readiness_items"), "launch_readiness_items table");
assert(constantsSource.includes("LAUNCH_CONTROL_AUDIT_ACTIONS"), "audit actions");
assert(constantsSource.includes("LAUNCH_CONTROL_FUTURE_ARCHITECTURE"), "future architecture");
assert(constantsSource.includes("Blue/Green Deployment"), "blue green future item");
assert(constantsSource.includes("Rollback Automation"), "rollback automation future item");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606253000_launch_control_center.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("launch_readiness_items"), "launch_readiness_items migration");
assert(migrationSource.includes("launch_checklist_entries"), "launch_checklist_entries migration");
assert(migrationSource.includes("launch_timeline_events"), "launch_timeline_events migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/launch-control"), "launch control permission");

const engineSource = readFileSync(join(rootPath, "src/utils/launchControlCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildLaunchControlCenterBundle"), "launch control engine");

const storeSource = readFileSync(join(rootPath, "src/utils/launchControlCenterStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "launch control audit logging");
assert(storeSource.includes("resolveLaunchControlBlocker"), "blocker resolution");
assert(storeSource.includes("approveLaunchControlSignoff"), "approval signoff");

const logicSource = readFileSync(join(rootPath, "src/utils/launchControlCenterLogic.ts"), "utf8");
assert(logicSource.includes("buildLaunchControlSummary"), "health summary builder");
assert(logicSource.includes("formatLaunchSummaryLine"), "summary line formatter");

const seedSource = readFileSync(join(rootPath, "src/data/launchControlCenterSeed.ts"), "utf8");
assert(seedSource.includes("LAUNCH_READINESS_SEED"), "readiness seed");
assert(seedSource.includes("LAUNCH_CHECKLIST_SEED"), "checklist seed");
assert(seedSource.includes("LAUNCH_BLOCKER_SEED"), "blocker seed");
assert(seedSource.includes("LAUNCH_TIMELINE_SEED"), "timeline seed");
assert(seedSource.includes("LAUNCH_APPROVAL_SEED"), "approval seed");

const adminComponents = [
  "LaunchHealthCard.tsx",
  "ReadinessCard.tsx",
  "CriticalBlockerCard.tsx",
  "DependencyCard.tsx",
  "RiskCard.tsx",
  "ApprovalCard.tsx",
  "TimelineCard.tsx",
  "LaunchControlCenterPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/launchControl", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("LaunchControlCenterPage"), "admin hub mounts launch control page");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"launchcontrol"'), "launch control nav tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:launch-control"), "package.json defines test:launch-control");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("launch-control-center.css"), "launch control styles imported");
assert(mainSource.includes("api-platform.css"), "api platform styles still imported");

const cssSource = readFileSync(join(rootPath, "src/styles/launch-control-center.css"), "utf8");
assert(cssSource.includes("launch-control-center-page"), "launch control styles");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("LAUNCH_CONTROL_CENTER_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("bamsignal.launchControlCenter.v1"), "localStorage manifest");

assert(LAUNCH_CONTROL_CENTER_DB_TABLES.length === 6, "six launch control tables");
assert(getLaunchControlCenterDatabaseTableManifest().length === 6, "database manifest");

assert(canAccessLaunchControlCenter(["ManageOperations"]), "operations role can access");
assert(canAccessLaunchControlCenter(["SystemAdministration"]), "system admin can access");
assert(canAccessLaunchControlCenter(["ViewExecutiveDashboard"]), "executive can access");
assert(!canAccessLaunchControlCenter(["ViewMembers"]), "members cannot access");

const readiness = [
  { id: "r1", score: 90 },
  { id: "r2", score: 80 }
];
const checklist = [
  { id: "c1", status: "ready" },
  { id: "c2", status: "needs-attention" },
  { id: "c3", status: "blocked" },
  { id: "c4", status: "not-started" }
];
const blockers = [
  { id: "b1", status: "open", severity: "critical" },
  { id: "b2", status: "resolved", severity: "high" }
];
const risks = [
  { id: "k1", status: "open", severity: "medium" },
  { id: "k2", status: "open", severity: "critical" }
];
const approvals = [
  { id: "a1", role: "executive", status: "pending" },
  { id: "a2", role: "founder", status: "pending" }
];

const summary = buildLaunchControlSummary(readiness, checklist, blockers, risks, approvals);
assert(summary.readyCount === 1, "ready checklist count");
assert(summary.criticalIssues === 2, "critical issues count");
assert(summary.overallReadinessPercent === 85, "overall readiness percent");
assert(formatLaunchSummaryLine(summary).includes("readiness"), "summary line");

const criticalBlockers = [
  { id: "b1", status: "open", severity: "critical" },
  { id: "b2", status: "open", severity: "low" },
  { id: "b3", status: "open", severity: "high" }
];
assert(listOpenCriticalBlockers(criticalBlockers).length === 2, "open critical blockers");

const blocker = {
  id: "blk_test",
  blockerRef: "BLK-TEST",
  title: "Test",
  severity: "high",
  domainId: "payments",
  status: "open",
  ownerEmail: "ops@bamsignal.com",
  openedAt: "2026-01-01T00:00:00.000Z"
};
const resolved = resolveLaunchBlocker(blocker, "ops@bamsignal.com");
assert(resolved.status === "resolved", "blocker resolved");

let threw = false;
try {
  resolveLaunchBlocker({ ...blocker, status: "resolved" }, "ops@bamsignal.com");
} catch {
  threw = true;
}
assert(threw, "cannot resolve twice");

const approval = {
  id: "ap_test",
  role: "executive",
  label: "Executive Sign-off",
  status: "pending"
};
const signed = recordLaunchApproval(approval, "founder@bamsignal.com");
assert(signed.status === "approved", "approval recorded");

if (failed) {
  console.error(`\n${failed} launch control test(s) failed.`);
  process.exit(1);
}

console.log("Institutional Launch Control Center checks passed.");
