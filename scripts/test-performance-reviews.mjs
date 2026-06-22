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

const constantsSource = readFileSync(join(rootPath, "src/constants/consultantPerformanceReviews.ts"), "utf8");
assert(constantsSource.includes("Consultant Performance Reviews™"), "reviews brand");
assert(constantsSource.includes('"monthly"'), "monthly period");
assert(constantsSource.includes('"quarterly"'), "quarterly period");
assert(constantsSource.includes('"annual"'), "annual period");
assert(constantsSource.includes("Consultation quality"), "consultation quality category");
assert(constantsSource.includes("Team contribution"), "team contribution category");
assert(constantsSource.includes("Exceptional"), "exceptional rating");
assert(constantsSource.includes("Needs Support"), "needs support rating");
assert(constantsSource.includes("1000 Consultations"), "1000 consultations achievement");
assert(constantsSource.includes("Institution Builder"), "institution builder achievement");
assert(constantsSource.includes("Mentorship"), "future mentorship documented");
assert(constantsSource.includes("Promotion pathways"), "future promotion documented");
assert(constantsSource.includes("Leadership tracks"), "future leadership documented");

const logicSource = readFileSync(join(rootPath, "src/utils/consultantPerformanceReviewLogic.ts"), "utf8");
assert(logicSource.includes("buildConsultantPerformanceReviewBundle"), "review bundle builder");
assert(logicSource.includes("buildGrowthPlan"), "growth plan builder");
assert(logicSource.includes("assertPerformanceReviewExcludesSales"), "sales exclusion guard");

const engineSource = readFileSync(join(rootPath, "src/utils/consultantPerformanceReviewEngine.ts"), "utf8");
assert(engineSource.includes("buildConsultantPerformanceReviewBundle"), "review engine");

const componentFiles = [
  "PerformanceReviewCard.tsx",
  "ReviewCategoryCard.tsx",
  "ReviewSummaryCard.tsx",
  "GrowthPlanCard.tsx",
  "AchievementTimelineCard.tsx"
];

for (const file of componentFiles) {
  assert(
    readFileSync(join(rootPath, "src/components/admin/concierge", file), "utf8").length > 0,
    `${file} exists`
  );
}

const performancePageSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/ConsultantPerformancePage.tsx"),
  "utf8"
);
assert(performancePageSource.includes("CONSULTANT_PERFORMANCE_REVIEWS_BRAND"), "performance page shows reviews");
assert(performancePageSource.includes("PerformanceReviewCard"), "performance page mounts review card");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:performance-reviews"), "package.json defines test:performance-reviews");

if (failed) process.exit(1);
console.log("performance reviews tests ok");
