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

const constantsSource = readFileSync(join(rootPath, "src/constants/launchReadiness.ts"), "utf8");
assert(constantsSource.includes("Launch Readiness Command Center™"), "launch readiness brand");
assert(constantsSource.includes('LAUNCH_READINESS_ADMIN_PATH = "/hard/launch"'), "launch readiness admin path");
assert(constantsSource.includes("journey-integrity"), "journey integrity area");
assert(constantsSource.includes("needs-review"), "needs review status");
assert(constantsSource.includes("executive"), "executive area");

const engineSource = readFileSync(join(rootPath, "src/utils/launchReadinessEngine.ts"), "utf8");
assert(engineSource.includes("buildLaunchReadinessReport"), "launch readiness report builder");
assert(engineSource.includes("buildRouteHealthReport"), "routes assessment");
assert(engineSource.includes("buildMigrationGapReport"), "database assessment");
assert(engineSource.includes("buildJourneyIntegrityReport"), "journey integrity assessment");
assert(engineSource.includes("buildOperationsCenterBundle"), "operations assessment");
assert(engineSource.includes("completion-percent"), "completion metric");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes('"launch"'), "launch tab in hard routes");
assert(hardRoutesSource.includes("LAUNCH_READINESS_ADMIN_PATH"), "launch path wired in hard routes");

const adminComponents = [
  "LaunchOverviewCard.tsx",
  "ReadinessCategoryCard.tsx",
  "CriticalIssueCard.tsx",
  "LaunchChecklistCard.tsx",
  "ReadinessTimelineCard.tsx",
  "LaunchReadinessCommandCenterPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/launchReadiness", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const pageSource = readFileSync(
  join(rootPath, "src/components/admin/launchReadiness/LaunchReadinessCommandCenterPage.tsx"),
  "utf8"
);
assert(pageSource.includes("Read-only"), "read-only audit copy");
assert(pageSource.includes("Refresh audit"), "refresh audit only");

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("LaunchReadinessCommandCenterPage"), "admin hub mounts launch readiness");
assert(adminHubSource.includes('tab === "launch"'), "launch tab wired");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"launch"'), "admin nav includes launch tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:launch-readiness"), "package.json defines test:launch-readiness");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("launch-readiness.css"), "launch readiness styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Launch Readiness Command Center checks passed.");
