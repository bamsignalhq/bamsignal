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

const constantsSource = readFileSync(join(rootPath, "src/constants/regionalConsultantTeams.ts"), "utf8");
assert(constantsSource.includes("Regional Consultant Teams™"), "regional teams brand");
assert(constantsSource.includes('"lagos"'), "lagos region");
assert(constantsSource.includes('"abuja"'), "abuja region");
assert(constantsSource.includes('"port-harcourt"'), "port harcourt region");
assert(constantsSource.includes('"south-east"'), "south east region");
assert(constantsSource.includes('"northern-nigeria"'), "northern nigeria region");
assert(constantsSource.includes('"uae"'), "uae region");
assert(constantsSource.includes('"global"'), "global region");
assert(constantsSource.includes("regional-director"), "regional director role");
assert(constantsSource.includes("Senior Matchmaker"), "senior matchmaker role");
assert(constantsSource.includes("Legacy Families"), "legacy families metric");

const logicSource = readFileSync(join(rootPath, "src/utils/regionalConsultantLogic.ts"), "utf8");
assert(logicSource.includes("buildRegionalConsultantTeamsBundle"), "regional logic bundle");
assert(logicSource.includes("buildWorkload"), "workload builder");
assert(logicSource.includes("buildCoverage"), "coverage builder");
assert(logicSource.includes("buildAssignments"), "assignments builder");
assert(logicSource.includes("resolveMemberRegion"), "member region resolver");

const engineSource = readFileSync(join(rootPath, "src/utils/regionalConsultantEngine.ts"), "utf8");
assert(engineSource.includes("buildRegionalConsultantTeamsBundle"), "regional engine");

const componentFiles = [
  "RegionalTeamCard.tsx",
  "RegionalDirectorCard.tsx",
  "RegionalWorkloadCard.tsx",
  "RegionalCoverageCard.tsx",
  "RegionalAssignmentCard.tsx"
];

for (const file of componentFiles) {
  assert(
    readFileSync(join(rootPath, "src/components/consultant", file), "utf8").length > 0,
    `${file} exists`
  );
}

const operationsSource = readFileSync(join(rootPath, "src/utils/OperationsCenterEngine.ts"), "utf8");
assert(operationsSource.includes("buildRegionalConsultantTeamsBundle"), "operations center integration");

const operationsPageSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/OperationsCenterPage.tsx"),
  "utf8"
);
assert(operationsPageSource.includes("OperationsRegionalTeamsCard"), "operations regional teams card");

const crmLogicSource = readFileSync(join(rootPath, "src/utils/consultantCrmLogic.ts"), "utf8");
assert(crmLogicSource.includes("buildRegionalTeamContext"), "consultant crm regional context");

const intelligenceEngineSource = readFileSync(join(rootPath, "src/utils/journeyIntelligenceEngine.ts"), "utf8");
assert(intelligenceEngineSource.includes("regionalTeams"), "journey intelligence regional teams");

const intelligencePageSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/JourneyIntelligencePage.tsx"),
  "utf8"
);
assert(intelligencePageSource.includes("RegionalTeamsOverviewCard"), "journey intelligence regional card");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:regional-teams"), "package.json defines test:regional-teams");

if (failed) process.exit(1);
console.log("regional teams tests ok");
