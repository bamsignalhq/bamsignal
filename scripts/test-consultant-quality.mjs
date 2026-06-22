#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  appendQualityReviewEntry,
  assertQualityReviewImmutable
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

const constantsSource = readFileSync(join(rootPath, "src/constants/consultantQuality.ts"), "utf8");
assert(constantsSource.includes("Consultant Quality Assurance™"), "quality brand");
assert(constantsSource.includes("consultation-quality"), "consultation quality area");
assert(constantsSource.includes("professional-conduct"), "professional conduct area");
assert(constantsSource.includes("needs-improvement"), "needs improvement rating");
assert(constantsSource.includes("QUALITY_APPEND_ONLY_RULES"), "append-only rules documented");
assert(constantsSource.includes("CONSULTANT_QUALITY_FUTURE_KINDS"), "future kinds documented");
assert(constantsSource.includes("Call recordings"), "call recordings future item");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("quality"), "hard routes include quality tab");

const engineSource = readFileSync(join(rootPath, "src/utils/consultantQualityEngine.ts"), "utf8");
assert(engineSource.includes("buildConsultantQualityBundle"), "quality engine exists");
assert(!engineSource.includes("deleteQuality"), "no delete API");

const logicSource = readFileSync(join(rootPath, "src/utils/consultantQualityLogic.ts"), "utf8");
assert(logicSource.includes("assertQualityReviewImmutable"), "immutable integrity check");
assert(logicSource.includes("reviews-completed"), "reviews completed metric");
assert(logicSource.includes("training-recommendations"), "training recommendations metric");

const seedSource = readFileSync(join(rootPath, "src/data/consultantQualitySeed.ts"), "utf8");
assert(seedSource.includes("areaRatings"), "seed includes area ratings");
assert(seedSource.includes("improvementPlan"), "seed includes improvement plan");
assert(seedSource.includes("appendLog"), "seed includes append log");

const adminComponents = [
  "QualityReviewCard.tsx",
  "ConsultationAuditCard.tsx",
  "IntroductionAuditCard.tsx",
  "DocumentationAuditCard.tsx",
  "QualityScoreCard.tsx",
  "ImprovementPlanCard.tsx",
  "ConsultantQualityPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/quality", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("ConsultantQualityPage"), "admin hub mounts quality assurance");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"quality"'), "admin nav includes quality tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:consultant-quality"), "package.json defines test:consultant-quality");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("consultant-quality.css"), "quality styles imported");

const review = {
  id: "quality_test_001",
  reviewRef: "QA-TEST-001",
  consultantRef: "consultant_test",
  consultantName: "Test Consultant",
  reviewer: "test@bamsignal.com",
  reviewedAt: "2026-06-22T00:00:00.000Z",
  journeyRef: "BS-JR-TEST",
  overallScore: 80,
  summary: "Test review",
  areaRatings: [
    { areaId: "consultation-quality", rating: "good", note: "Test note" }
  ],
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
};

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

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Consultant Quality Assurance checks passed.");
