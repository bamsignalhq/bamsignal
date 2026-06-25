#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONSULTANT_QUALITY_DB_TABLES,
  appendQualityReviewEntry,
  assertQualityReviewImmutable,
  assignImprovementPlan,
  buildQualityTrendFromReviews,
  canAccessConsultantQuality,
  completeImprovementAction,
  getConsultantQualityDatabaseTableManifest,
  issueCertification,
  normalizeQualityReview,
  suspendCertification
} from "../server/services/consultantQuality.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/consultantQualityAdmin.ts"), "utf8");
assert(adminSource.includes('CONSULTANT_QUALITY_ADMIN_PATH = "/hard/quality"'), "admin quality route");
assert(
  adminSource.includes("Consultant Quality, Standards & Certification™"),
  "institutional brand"
);

const constantsSource = readFileSync(join(rootPath, "src/constants/consultantQuality.ts"), "utf8");
assert(constantsSource.includes("communication"), "communication standard");
assert(constantsSource.includes("journey-stewardship"), "journey stewardship standard");
assert(constantsSource.includes("self-review"), "self review type");
assert(constantsSource.includes("executive-review"), "executive review type");
assert(constantsSource.includes("master-consultant"), "master consultant level");
assert(constantsSource.includes("CONSULTANT_QUALITY_DB_TABLES"), "db tables constant");
assert(constantsSource.includes("improvement_plans"), "improvement_plans table");
assert(constantsSource.includes("QUALITY_AUDIT_ACTIONS"), "audit actions");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606252200_consultant_quality.sql"),
  "utf8"
);
assert(migrationSource.includes("consultant_reviews"), "consultant_reviews migration");
assert(migrationSource.includes("consultant_certifications"), "consultant_certifications migration");
assert(migrationSource.includes("coaching_sessions"), "coaching_sessions migration");
assert(migrationSource.includes("improvement_plans"), "improvement_plans migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/quality"), "quality permission");

const engineSource = readFileSync(join(rootPath, "src/utils/consultantQualityEngine.ts"), "utf8");
assert(engineSource.includes("buildConsultantQualityBundle"), "quality engine exists");
assert(engineSource.includes("consultantQualityStore"), "store integration");
assert(!engineSource.includes("deleteQuality"), "no delete API");

const storeSource = readFileSync(join(rootPath, "src/utils/consultantQualityStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "quality audit logging");
assert(storeSource.includes("assignConsultantImprovementPlan"), "improvement plan workflow");
assert(storeSource.includes("issueConsultantCertification"), "certification workflow");
assert(storeSource.includes("bamsignal.consultantQuality.v3"), "v3 storage key");

const logicSource = readFileSync(join(rootPath, "src/utils/consultantQualityLogic.ts"), "utf8");
assert(logicSource.includes("assertQualityReviewImmutable"), "immutable integrity check");
assert(logicSource.includes("active-certifications"), "active certifications metric");
assert(logicSource.includes("open-improvement-plans"), "open improvement plans metric");
assert(logicSource.includes("reviewType"), "review type filter");

const seedSource = readFileSync(join(rootPath, "src/data/consultantQualitySeed.ts"), "utf8");
assert(seedSource.includes("CONSULTANT_CERTIFICATION_SEED"), "certification seed");
assert(seedSource.includes("IMPROVEMENT_PLAN_SEED"), "improvement plan seed");
assert(seedSource.includes("COACHING_SESSION_SEED"), "coaching seed");
assert(seedSource.includes("reviewType"), "review type on seed reviews");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("CONSULTANT_QUALITY_SCHEMA_TABLES"), "schema tables in audit");
assert(databaseAuditSource.includes("bamsignal.consultantQuality.v3"), "audit storage key v3");

const adminComponents = [
  "ConsultantQualityCard.tsx",
  "CertificationCard.tsx",
  "ReviewHistoryCard.tsx",
  "ImprovementPlanCard.tsx",
  "QualityTrendCard.tsx",
  "CoachingCard.tsx",
  "ConsultantQualityPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/quality", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("ConsultantQualityPage"), "admin hub mounts quality center");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"quality"'), "admin nav includes quality tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:consultant-quality"), "package.json defines test:consultant-quality");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("consultant-quality.css"), "quality styles imported");

assert(CONSULTANT_QUALITY_DB_TABLES.length === 6, "six db tables");
assert(getConsultantQualityDatabaseTableManifest().length === 6, "table manifest");
assert(canAccessConsultantQuality(["ManageConsultants"]), "manage consultants access");
assert(!canAccessConsultantQuality([]), "no permission denied");

const review = normalizeQualityReview({
  id: "quality_test_001",
  reviewRef: "QA-TEST-001",
  consultantRef: "consultant_test",
  consultantName: "Test Consultant",
  reviewer: "test@bamsignal.com",
  reviewedAt: "2026-06-22T00:00:00.000Z",
  journeyRef: "BS-JR-TEST",
  overallScore: 80,
  summary: "Test review",
  areaRatings: [{ areaId: "communication", rating: "good", note: "Test note" }],
  improvementPlan: [],
  appendLog: [
    {
      id: "quality_append_0001",
      actor: "test@bamsignal.com",
      timestamp: "2026-06-22T00:00:00.000Z",
      action: "review-completed",
      note: "Initial review"
    }
  ]
});
assert(review.reviewType === "manager-review", "default review type");

const updated = appendQualityReviewEntry(review, {
  actor: "ops@bamsignal.com",
  action: "follow-up",
  note: "Follow-up note appended"
});
assert(updated.appendLog.length === 2, "append adds log entry");

let threw = false;
try {
  assertQualityReviewImmutable(review, { ...review, summary: "tampered" });
} catch {
  threw = true;
}
assert(threw, "immutable field modification rejected");

threw = false;
try {
  assertQualityReviewImmutable(updated, { ...updated, appendLog: [updated.appendLog[0]] });
} catch {
  threw = true;
}
assert(threw, "append log delete rejected");

const certifications = issueCertification([], {
  consultantRef: "consultant_test",
  consultantName: "Test Consultant",
  certificationLevel: "certified",
  issuedBy: "ops@bamsignal.com"
});
assert(certifications.length === 1, "certification issued");

const suspended = suspendCertification(certifications, certifications[0].id, "ops@bamsignal.com", "test");
assert(suspended[0].status === "suspended", "certification suspended");

const plans = assignImprovementPlan([], {
  consultantRef: "consultant_test",
  consultantName: "Test Consultant",
  actions: [
    {
      standardId: "communication",
      action: "Complete training",
      deadline: "2026-07-01T00:00:00.000Z"
    }
  ]
});
assert(plans.length === 1, "improvement plan assigned");

const completedPlan = completeImprovementAction(plans, plans[0].id, plans[0].actions[0].id);
assert(completedPlan[0].status === "completed", "improvement plan completed");

const trend = buildQualityTrendFromReviews([
  { reviewedAt: "2026-06-01T00:00:00.000Z", overallScore: 80 },
  { reviewedAt: "2026-06-15T00:00:00.000Z", overallScore: 90 }
]);
assert(trend.length === 1 && trend[0].averageScore === 85, "quality trend built");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Consultant Quality, Standards & Certification checks passed.");
