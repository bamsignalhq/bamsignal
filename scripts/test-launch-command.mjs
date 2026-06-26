#!/usr/bin/env node
/**
 * Launch Command Center™ — route, permission, and engine verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LAUNCH_COMMAND_CENTER_DB_TABLES,
  LAUNCH_COMMAND_SECTIONS,
  LAUNCH_GO_NO_GO_OPTIONS,
  LAUNCH_READINESS_SCORE_DOMAINS,
  canAccessLaunchCommandCenter,
  computeLaunchGoNoGo,
  countBlockersBySeverity,
  formatLaunchGoNoGoLine,
  getLaunchCommandCenterDatabaseTableManifest,
  launchCommandRouteRegistered,
  scoreToStatus
} from "../server/services/launchCommandCenter.js";

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

const adminSource = read("src/constants/launchCommandCenterAdmin.ts");
assert(adminSource.includes('LAUNCH_COMMAND_CENTER_ADMIN_PATH = "/hard/launch-command"'), "launch command route");
assert(adminSource.includes("Launch Command Center™"), "launch command brand");

const constantsSource = read("src/constants/launchCommandCenter.ts");
assert(constantsSource.includes("launch-readiness"), "launch readiness section");
assert(constantsSource.includes("otp-success-rate"), "otp success section");
assert(constantsSource.includes("consultant-availability"), "consultant availability section");
assert(constantsSource.includes("go-with-warnings"), "go with warnings option");
assert(constantsSource.includes("LAUNCH_COMMAND_REFRESH_INTERVAL_MS = 30_000"), "30s refresh");
assert(constantsSource.includes("launch_command_blockers"), "blockers table");

const typesSource = read("src/types/launchCommandCenter.ts");
assert(typesSource.includes("LaunchCommandCenterBundle"), "bundle type");
assert(typesSource.includes("LaunchCommandGoNoGo"), "go no go type");

const logicSource = read("src/utils/launchCommandCenterLogic.ts");
assert(logicSource.includes("computeLaunchGoNoGo"), "go no go computer");
assert(logicSource.includes("buildLaunchCommandCenterBundle"), "bundle builder");

const engineSource = read("src/utils/launchCommandCenterEngine.ts");
assert(engineSource.includes("buildLiveLaunchCommandCenterBundle"), "live bundle builder");

const storeSource = read("src/utils/launchCommandCenterStore.ts");
assert(storeSource.includes("bamsignal.launchCommandCenter.v1"), "localStorage key");

const seedSource = read("src/data/launchCommandCenterSeed.ts");
assert(seedSource.includes("LAUNCH_READINESS_SCORE_SEED"), "readiness score seed");
assert(seedSource.includes("LAUNCH_COMMAND_BLOCKER_SEED"), "blocker seed");
assert(seedSource.includes("LAUNCH_COMMAND_SECTION_SEED"), "section seed");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes("LAUNCH_COMMAND_CENTER_ADMIN_PATH"), "hard routes include launch command path");
assert(hardRoutesSource.includes('launchcommand: "launch-command"'), "launch command tab slug");

const permissionsSource = read("src/constants/permissions.ts");
assert(launchCommandRouteRegistered(permissionsSource), "launch command permissions wired");
assert(permissionsSource.includes("launchcommand"), "launchcommand tab permission");

const adminComponents = [
  "LaunchCommandCenterPage.tsx",
  "LaunchCommandGoNoGoCard.tsx",
  "LaunchCommandReadinessScoresCard.tsx",
  "LaunchCommandBlockersCard.tsx",
  "LaunchCommandSectionCard.tsx",
  "LaunchCommandOperationsCard.tsx"
];

for (const file of adminComponents) {
  try {
    read(`src/components/admin/launchCommand/${file}`);
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = read("src/pages/AdminHubPage.tsx");
assert(hubSource.includes("LaunchCommandCenterPage"), "admin hub mounts launch command page");

const navSource = read("src/components/admin/adminConsoleNav.ts");
assert(navSource.includes('"launchcommand"'), "launch command nav tab");

const packageSource = read("package.json");
assert(packageSource.includes("test:launch-command"), "package.json defines test:launch-command");

const mainSource = read("src/main.tsx");
const entryAdminSource = read("src/styles/entry-admin.css");
assert((entryAdminSource.includes("launch-command-center.css") || mainSource.includes("launch-command-center.css")), "launch command styles imported");

const cssSource = read("src/styles/launch-command-center.css");
assert(cssSource.includes("launch-command-gonogo-card"), "go no go styles");

const migrationSource = read("supabase/migrations/202606261500_launch_command_center.sql");
assert(migrationSource.includes("launch_command_readiness_scores"), "readiness scores migration");
assert(migrationSource.includes("launch_command_deployments"), "deployments migration");

assert(LAUNCH_COMMAND_CENTER_DB_TABLES.length === 5, "five launch command tables");
assert(getLaunchCommandCenterDatabaseTableManifest().length === 5, "database manifest");
assert(LAUNCH_COMMAND_SECTIONS.length === 17, "seventeen sections");
assert(LAUNCH_READINESS_SCORE_DOMAINS.length === 9, "nine readiness score domains");
assert(LAUNCH_GO_NO_GO_OPTIONS.length === 3, "three go no go options");

assert(canAccessLaunchCommandCenter(["ManageOperations"]), "operations can access");
assert(canAccessLaunchCommandCenter(["ViewExecutiveDashboard"]), "executive can access");
assert(!canAccessLaunchCommandCenter(["ViewMembers"]), "members cannot access");

assert(scoreToStatus(95) === "healthy", "healthy score status");
assert(scoreToStatus(85) === "warning", "warning score status");
assert(scoreToStatus(60) === "critical", "critical score status");

const scores = [
  { id: "overall", score: 91 },
  { id: "infrastructure", score: 94 },
  { id: "consultations", score: 87 }
];

const blockers = [
  { severity: "high", status: "open" },
  { severity: "medium", status: "open" },
  { severity: "low", status: "mitigated" }
];

const goNoGo = computeLaunchGoNoGo(scores, blockers);
assert(goNoGo.recommendation === "go-with-warnings", "high blocker yields go with warnings");
assert(goNoGo.reasoning.length > 0, "go no go has reasoning");

const clearGo = computeLaunchGoNoGo(
  [
    { id: "overall", score: 92 },
    { id: "infrastructure", score: 94 },
    { id: "payments", score: 96 }
  ],
  []
);
assert(clearGo.recommendation === "go", "clean platform yields go");

const noGo = computeLaunchGoNoGo(
  [{ id: "overall", score: 70 }],
  [{ severity: "critical", status: "open" }]
);
assert(noGo.recommendation === "no-go", "critical blocker yields no go");

assert(countBlockersBySeverity(blockers, "high") === 1, "blocker severity count");
assert(formatLaunchGoNoGoLine("go").includes("GO"), "format go line");

if (failed) {
  console.error(`\n${failed} launch command test(s) failed.`);
  process.exit(1);
}

console.log("Launch Command Center checks passed.");
