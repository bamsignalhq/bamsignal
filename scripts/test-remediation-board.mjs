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

const adminSource = readFileSync(join(rootPath, "src/constants/remediationBoardAdmin.ts"), "utf8");
assert(adminSource.includes('REMEDIATION_BOARD_ADMIN_PATH = "/hard/remediation"'), "remediation board admin route");
assert(adminSource.includes("Institutional Remediation Board™"), "remediation board brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/remediationBoard.ts"), "utf8");
assert(constantsSource.includes('"P0"'), "P0 severity");
assert(constantsSource.includes('"P1"'), "P1 severity");
assert(constantsSource.includes('"P2"'), "P2 severity");
assert(constantsSource.includes('"open"'), "open status");
assert(constantsSource.includes('"in-progress"'), "in progress status");
assert(constantsSource.includes('"blocked"'), "blocked status");
assert(constantsSource.includes('"resolved"'), "resolved status");
assert(constantsSource.includes('"deferred"'), "deferred status");
assert(constantsSource.includes('"routes"'), "routes category");
assert(constantsSource.includes('"permissions"'), "permissions category");
assert(constantsSource.includes('"journey-integrity"'), "journey integrity category");
assert(constantsSource.includes('"persistence"'), "persistence category");
assert(constantsSource.includes('"operations"'), "operations category");
assert(constantsSource.includes('"crm"'), "crm category");
assert(constantsSource.includes('"notifications"'), "notifications category");
assert(constantsSource.includes('"safety"'), "safety category");
assert(constantsSource.includes('"executive"'), "executive category");
assert(constantsSource.includes('"launch"'), "launch category");

const typesSource = readFileSync(join(rootPath, "src/types/remediationBoard.ts"), "utf8");
assert(typesSource.includes("RemediationBoardMetrics"), "metrics type");
assert(typesSource.includes("openFindings"), "open findings metric");
assert(typesSource.includes("criticalFindings"), "critical findings metric");
assert(typesSource.includes("resolvedFindings"), "resolved findings metric");
assert(typesSource.includes("launchBlockers"), "launch blockers metric");

const seedSource = readFileSync(join(rootPath, "src/data/remediationFindingsSeed.ts"), "utf8");
assert(seedSource.includes("REMEDIATION_FINDINGS_SEED"), "findings seed");
assert(seedSource.includes("launchBlocker: true"), "launch blockers seeded");

const logicSource = readFileSync(join(rootPath, "src/utils/remediationBoardLogic.ts"), "utf8");
assert(logicSource.includes("buildRemediationMetrics"), "metrics builder");
assert(logicSource.includes("buildCategorySummaries"), "category summaries");
assert(logicSource.includes("isLaunchBlocker"), "launch blocker logic");

const engineSource = readFileSync(join(rootPath, "src/utils/remediationBoardEngine.ts"), "utf8");
assert(engineSource.includes("buildRemediationBoardBundle"), "bundle builder");
assert(engineSource.includes("updateRemediationFindingStatus"), "status updates");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("REMEDIATION_BOARD_ADMIN_PATH"), "hard routes include remediation path");
assert(hardRoutesSource.includes('"remediation"'), "remediation slug");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/remediation"), "remediation route permission mapped");

const adminComponents = [
  "RemediationBoardPage.tsx",
  "RemediationCard.tsx",
  "SeverityBadge.tsx",
  "RemediationSummaryCard.tsx",
  "RiskOverviewCard.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/remediationBoard", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("RemediationBoardPage"), "admin hub mounts remediation board");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:remediation-board"), "package.json defines test:remediation-board");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("remediation-board.css"), "remediation board styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Institutional remediation board checks passed.");
