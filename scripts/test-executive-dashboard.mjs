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

const adminSource = readFileSync(join(rootPath, "src/constants/executiveDashboardAdmin.ts"), "utf8");
assert(adminSource.includes('EXECUTIVE_DASHBOARD_ADMIN_PATH = "/hard/executive"'), "admin executive route");

const constantsSource = readFileSync(join(rootPath, "src/constants/executiveDashboard.ts"), "utf8");
assert(constantsSource.includes("Executive Dashboard™"), "executive brand");
assert(constantsSource.includes("institution-health"), "institution health area");
assert(constantsSource.includes("legacy-families"), "legacy families metric");
assert(constantsSource.includes("EXECUTIVE_DASHBOARD_FUTURE_KINDS"), "future kinds documented");
assert(constantsSource.includes("predictive-forecasting"), "predictive forecasting future item");
assert(constantsSource.includes("board-reporting"), "board reporting future item");
assert(constantsSource.includes('"lifetime"'), "lifetime view");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("executive"), "hard routes include executive tab");

const engineSource = readFileSync(join(rootPath, "src/utils/executiveDashboardEngine.ts"), "utf8");
assert(engineSource.includes("buildExecutiveDashboard"), "executive engine exists");

const logicSource = readFileSync(join(rootPath, "src/utils/executiveDashboardLogic.ts"), "utf8");
assert(logicSource.includes("buildExecutiveDashboardBundle"), "executive bundle logic");

const seedSource = readFileSync(join(rootPath, "src/data/executiveDashboardSeed.ts"), "utf8");
assert(seedSource.includes("EXECUTIVE_STRATEGIC_FOCUS"), "strategic focus seed");
assert(seedSource.includes("getViewMetrics"), "view metrics seed");

const adminComponents = [
  "ExecutiveMetricCard.tsx",
  "InstitutionHealthCard.tsx",
  "GrowthTrendCard.tsx",
  "LegacyGrowthCard.tsx",
  "ResearchInsightCard.tsx",
  "CommunityOverviewCard.tsx",
  "StrategicFocusCard.tsx",
  "ExecutiveDashboardPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/executive", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("ExecutiveDashboardPage"), "admin hub mounts executive dashboard");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"executive"'), "admin nav includes executive tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:executive-dashboard"), "package.json defines test:executive-dashboard");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("executive-dashboard.css") || mainSource.includes("executive-dashboard.css")), "executive styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Executive Dashboard checks passed.");
