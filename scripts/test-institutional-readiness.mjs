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

const adminSource = readFileSync(join(rootPath, "src/constants/institutionalReadinessAdmin.ts"), "utf8");
assert(adminSource.includes('INSTITUTIONAL_READINESS_ADMIN_PATH = "/hard/readiness"'), "readiness admin route");
assert(adminSource.includes("Institutional Readiness Report™"), "readiness brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/institutionalReadiness.ts"), "utf8");
assert(constantsSource.includes("Route Health"), "route health section");
assert(constantsSource.includes("Permission Health"), "permission health section");
assert(constantsSource.includes("Journey Health"), "journey health section");
assert(constantsSource.includes("Persistence Health"), "persistence health section");
assert(constantsSource.includes("Operations Health"), "operations health section");
assert(constantsSource.includes("Safety Health"), "safety health section");
assert(constantsSource.includes("Executive Health"), "executive health section");
assert(constantsSource.includes("Launch Readiness"), "launch readiness section");

const typesSource = readFileSync(join(rootPath, "src/types/institutionalReadiness.ts"), "utf8");
assert(typesSource.includes("overallScore"), "overall score output");
assert(typesSource.includes("criticalBlockers"), "critical blockers output");
assert(typesSource.includes("highRisks"), "high risks output");
assert(typesSource.includes("mediumRisks"), "medium risks output");
assert(typesSource.includes("resolvedRisks"), "resolved risks output");
assert(typesSource.includes("LaunchDecision"), "go/no-go decision");

const logicSource = readFileSync(join(rootPath, "src/utils/institutionalReadinessLogic.ts"), "utf8");
assert(logicSource.includes("buildLaunchDecision"), "launch decision builder");
assert(logicSource.includes("buildRiskRegistry"), "risk registry builder");
assert(logicSource.includes("buildOverallScore"), "overall score builder");

const engineSource = readFileSync(join(rootPath, "src/utils/institutionalReadinessEngine.ts"), "utf8");
assert(engineSource.includes("buildInstitutionalReadinessReport"), "report builder");
assert(engineSource.includes("buildRouteHealthReport"), "route health aggregation");
assert(engineSource.includes("buildPermissionsAuditReport"), "permission health aggregation");
assert(engineSource.includes("buildJourneyIntegrityReport"), "journey health aggregation");
assert(engineSource.includes("buildMigrationGapReport"), "persistence health aggregation");
assert(engineSource.includes("buildLaunchReadinessReport"), "launch readiness aggregation");
assert(engineSource.includes("buildRemediationBoardBundle"), "remediation risk registry");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("INSTITUTIONAL_READINESS_ADMIN_PATH"), "hard routes include readiness path");
assert(hardRoutesSource.includes('"readiness"'), "readiness slug");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/readiness"), "readiness route permission mapped");

const adminComponents = [
  "ReadinessPage.tsx",
  "ReadinessScoreCard.tsx",
  "HealthCategoryCard.tsx",
  "LaunchDecisionCard.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/institutionalReadiness", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("ReadinessPage"), "admin hub mounts readiness page");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:institutional-readiness"), "package.json defines test:institutional-readiness");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("institutional-readiness.css"), "readiness styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Institutional readiness report checks passed.");
