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

const constantsSource = readFileSync(join(rootPath, "src/constants/operationsCenter.ts"), "utf8");
assert(constantsSource.includes('OPERATIONS_CENTER_PATH = "/hard/concierge/operations"'), "canonical operations center route");
assert(constantsSource.includes('OPERATIONS_CENTER_NAV_LABEL = "Operations Center™"'), "navigation label");
assert(constantsSource.includes("Signal Concierge Operations Center™"), "brand label");
assert(constantsSource.includes('"consultations"'), "consultations section");
assert(constantsSource.includes('"assignment-queue"'), "assignment queue section");
assert(constantsSource.includes('"legacy-families"'), "legacy families metric");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(
  hardRoutesSource.includes("parseConciergeAdminViewFromPath") &&
    hardRoutesSource.includes("operations-center"),
  "hard routes parse concierge operations view"
);

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(
  adminHubSource.includes("OperationsCenterPage") && adminHubSource.includes("conciergeView"),
  "admin hub mounts operations center by concierge view"
);

const engineSource = readFileSync(join(rootPath, "src/utils/OperationsCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildOperationsCenterBundle"), "operations center aggregation engine exists");
assert(engineSource.includes("listSchedulingEvents"), "aggregates scheduling engine");
assert(engineSource.includes("listConsultationPayments"), "aggregates payment engine");
assert(engineSource.includes("listConciergeEmailRecords"), "aggregates email engine");
assert(engineSource.includes("listIntroductionRecords"), "aggregates introduction engine");
assert(engineSource.includes("listRelationshipFollowUpRecords"), "aggregates follow-up engine");
assert(!engineSource.includes("writeJson"), "operations layer does not persist duplicate state");

const componentFiles = [
  "OperationsOverviewCard.tsx",
  "OperationsMetricCard.tsx",
  "AssignmentQueueCard.tsx",
  "OperationsNotificationCard.tsx",
  "OperationsCalendarCard.tsx",
  "OperationsPaymentCard.tsx",
  "OperationsIntroductionCard.tsx",
  "OperationsFollowUpCard.tsx",
  "OperationsCenterPage.tsx"
];

for (const file of componentFiles) {
  const source = readFileSync(join(rootPath, "src/components/admin/concierge", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:operations-center"), "package.json defines test:operations-center");

if (failed) process.exit(1);
console.log("operations center tests ok");
