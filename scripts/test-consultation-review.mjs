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

const constantsSource = readFileSync(join(rootPath, "src/constants/consultationReview.ts"), "utf8");
assert(constantsSource.includes("Consultation Review Engine™"), "review engine brand");
assert(constantsSource.includes("Approved"), "outcome labels");
assert(constantsSource.includes("Requires Review"), "requires review outcome");
assert(constantsSource.includes("Proceed to introductions"), "recommendation labels");
assert(constantsSource.includes("Relationship goals"), "notes section labels");
assert(constantsSource.includes("BS-CR"), "review id prefix");

const typesSource = readFileSync(join(rootPath, "src/types/consultationReview.ts"), "utf8");
assert(typesSource.includes("ConsultationOutcome"), "outcome type");
assert(typesSource.includes("consultation-completed"), "timeline kinds");
assert(typesSource.includes("follow-up-required"), "follow-up timeline kind");
assert(typesSource.includes("ConsultationNotesSections"), "structured notes sections");

const logicSource = readFileSync(join(rootPath, "src/utils/consultationRecommendationLogic.ts"), "utf8");
assert(logicSource.includes("deriveConsultationOutcome"), "derives outcomes");
assert(logicSource.includes("buildConsultationRecommendation"), "builds recommendations");
assert(logicSource.includes("bootstrapReviewTimeline"), "bootstraps timeline");
assert(logicSource.includes("assertConsultationReviewTimelineIntegrity"), "append-only timeline guard");

const storeSource = readFileSync(join(rootPath, "src/utils/consultationNotesStore.ts"), "utf8");
assert(storeSource.includes("saveConsultationReview"), "persists reviews");
assert(storeSource.includes("listConsultationReviewsForMember"), "member-scoped listing");
assert(storeSource.includes("conciergeConsultationReviewStore"), "dedicated review store key");

const engineSource = readFileSync(join(rootPath, "src/utils/consultationReviewEngine.ts"), "utf8");
assert(engineSource.includes("syncConsultationReviewsFromMembers"), "syncs from member signals");
assert(engineSource.includes("ensureMemberConsultationReviewBundle"), "member journey bundle");
assert(engineSource.includes("listConsultationReviewSummaries"), "operations summaries");

const componentFiles = [
  "ConsultationNotesCard.tsx",
  "ConsultationOutcomeCard.tsx",
  "ConsultationRecommendationCard.tsx",
  "ConsultationSummaryCard.tsx",
  "ConsultationHistoryCard.tsx",
  "MemberConsultationReviewSection.tsx"
];

for (const file of componentFiles) {
  assert(
    readFileSync(join(rootPath, "src/components/admin/concierge", file), "utf8").length > 0,
    `${file} exists`
  );
}

const memberJourneySource = readFileSync(
  join(rootPath, "src/components/admin/concierge/ConciergeMemberProfilePage.tsx"),
  "utf8"
);
assert(memberJourneySource.includes("MemberConsultationReviewSection"), "member journey shows review section");

const operationsSource = readFileSync(join(rootPath, "src/utils/OperationsCenterEngine.ts"), "utf8");
assert(operationsSource.includes("listConsultationReviewSummaries"), "operations center aggregates reviews");

const operationsCardSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/OperationsCalendarCard.tsx"),
  "utf8"
);
assert(operationsCardSource.includes("outcomeLabel"), "operations consultations show review outcome");

const crmSource = readFileSync(join(rootPath, "src/utils/consultantCrmLogic.ts"), "utf8");
assert(crmSource.includes("syncConsultationReviewsFromMembers"), "consultant CRM syncs reviews");
assert(crmSource.includes("CONSULTATION_OUTCOME_LABELS"), "consultant CRM shows outcomes");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:consultation-review"), "package.json defines test:consultation-review");

if (failed) process.exit(1);
console.log("consultation review tests ok");
