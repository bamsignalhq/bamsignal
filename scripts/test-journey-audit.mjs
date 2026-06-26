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

const constantsSource = readFileSync(join(rootPath, "src/constants/journeyIntegrityAudit.ts"), "utf8");
assert(constantsSource.includes("Journey Integrity Audit™"), "journey audit brand");
assert(constantsSource.includes('JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH = "/hard/audit/journeys"'), "journey audit admin path");
assert(constantsSource.includes("success-story"), "success story stage");
assert(constantsSource.includes("critical"), "critical status");

const auditSource = readFileSync(join(rootPath, "src/utils/journeyIntegrityAudit.ts"), "utf8");
assert(auditSource.includes("buildCanonicalJourneyRecords"), "canonical journey records");
assert(auditSource.includes("buildJourneyDependencies"), "journey dependencies");
assert(auditSource.includes("findDuplicateJourneyIds"), "duplicate detection");
assert(auditSource.includes("collectReferencedJourneyIds"), "referenced journey inventory");

const reportSource = readFileSync(join(rootPath, "src/utils/journeyIntegrityReport.ts"), "utf8");
assert(reportSource.includes("buildJourneyIntegrityReport"), "journey integrity report builder");
assert(reportSource.includes("orphan-record"), "orphan detection");
assert(reportSource.includes("timeline-inconsistency"), "timeline inconsistency detection");
assert(reportSource.includes("archive-inconsistency"), "archive inconsistency detection");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes('"journeys"'), "journeys audit sub-view");
assert(hardRoutesSource.includes("JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH"), "journey audit path wired in hard routes");

const adminComponents = [
  "JourneyIntegrityCard.tsx",
  "JourneyHealthCard.tsx",
  "JourneyDependencyCard.tsx",
  "TimelineIntegrityCard.tsx",
  "JourneyRepairRecommendationCard.tsx",
  "JourneyIntegrityAuditPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/journeyAudit", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("JourneyIntegrityAuditPage"), "admin hub mounts journey audit");
assert(adminHubSource.includes('auditView === "journeys"'), "audit journeys view wired");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:journey-audit"), "package.json defines test:journey-audit");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("journey-integrity-audit.css") || mainSource.includes("journey-integrity-audit.css")), "journey audit styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Journey Integrity Audit checks passed.");
