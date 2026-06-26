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

const adminSource = readFileSync(join(rootPath, "src/constants/dataIntegrityAdmin.ts"), "utf8");
assert(adminSource.includes('DATA_INTEGRITY_ADMIN_PATH = "/hard/data-integrity"'), "data integrity admin route");
assert(adminSource.includes("Data Integrity Center™"), "data integrity brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/dataIntegrity.ts"), "utf8");
assert(constantsSource.includes('"healthy"'), "healthy status");
assert(constantsSource.includes('"warning"'), "warning status");
assert(constantsSource.includes('"critical"'), "critical status");
assert(constantsSource.includes('"journey-ids"'), "journey ids check");
assert(constantsSource.includes('"consultant-assignments"'), "consultant assignments check");
assert(constantsSource.includes('"introductions"'), "introductions check");
assert(constantsSource.includes('"follow-ups"'), "follow-ups check");
assert(constantsSource.includes('"archives"'), "archives check");
assert(constantsSource.includes('"legacy-profiles"'), "legacy profiles check");
assert(constantsSource.includes('"payments"'), "payments check");
assert(constantsSource.includes('"meetings"'), "meetings check");
assert(constantsSource.includes('"notifications"'), "notifications check");

const typesSource = readFileSync(join(rootPath, "src/types/dataIntegrity.ts"), "utf8");
assert(typesSource.includes("IntegrityCheck"), "integrity check type");
assert(typesSource.includes("IntegrityIssue"), "integrity issue type");
assert(typesSource.includes("IntegritySummary"), "integrity summary type");

const logicSource = readFileSync(join(rootPath, "src/utils/dataIntegrityLogic.ts"), "utf8");
assert(logicSource.includes("buildIntegritySummary"), "summary builder");
assert(logicSource.includes("statusFromIssues"), "status resolver");

const engineSource = readFileSync(join(rootPath, "src/utils/dataIntegrityEngine.ts"), "utf8");
assert(engineSource.includes("buildDataIntegrityBundle"), "bundle builder");
assert(engineSource.includes("checkJourneyIds"), "journey id verification");
assert(engineSource.includes("checkConsultantAssignments"), "assignment verification");
assert(engineSource.includes("checkIntroductions"), "introduction verification");
assert(engineSource.includes("checkFollowUps"), "follow-up verification");
assert(engineSource.includes("checkArchives"), "archive verification");
assert(engineSource.includes("checkLegacyProfiles"), "legacy profile verification");
assert(engineSource.includes("checkPayments"), "payment verification");
assert(engineSource.includes("checkMeetings"), "meeting verification");
assert(engineSource.includes("checkNotifications"), "notification verification");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("DATA_INTEGRITY_ADMIN_PATH"), "hard routes include data integrity path");
assert(hardRoutesSource.includes('"data-integrity"'), "data integrity slug");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/data-integrity"), "data integrity route permission mapped");

const adminComponents = [
  "IntegrityDashboard.tsx",
  "IntegrityIssueCard.tsx",
  "IntegritySummaryCard.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/dataIntegrity", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("IntegrityDashboard"), "admin hub mounts data integrity dashboard");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:data-integrity"), "package.json defines test:data-integrity");
assert(packageSource.includes("certify:data-integrity"), "package.json defines certify:data-integrity");
assert(packageSource.includes("test:data-integrity-certification"), "certification structure test");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("data-integrity.css") || mainSource.includes("data-integrity.css")), "data integrity styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Data Integrity Center checks passed.");
