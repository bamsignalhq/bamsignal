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

const constantsSource = readFileSync(join(rootPath, "src/constants/consultantAssignment.ts"), "utf8");
assert(constantsSource.includes("Consultant Assignment Engine™"), "assignment engine brand");
assert(constantsSource.includes("Highly Recommended"), "recommendation level labels");
assert(constantsSource.includes("matching-specialization"), "match factor labels");

const typesSource = readFileSync(join(rootPath, "src/types/consultantAssignment.ts"), "utf8");
assert(typesSource.includes("RecommendationLevel"), "recommendation level type");
assert(typesSource.includes("AssignmentDecision"), "assignment decision type");
assert(typesSource.includes("pendingConsultations"), "extended workload profile");

const workloadSource = readFileSync(join(rootPath, "src/utils/consultantWorkloadEngine.ts"), "utf8");
assert(workloadSource.includes("buildWorkloadProfile"), "workload engine exports profile builder");
assert(workloadSource.includes("pendingConsultations"), "tracks pending consultations");
assert(workloadSource.includes("introductionsInProgress"), "tracks introductions");
assert(workloadSource.includes("responseTimeHours"), "tracks response times");

const recommendationSource = readFileSync(
  join(rootPath, "src/utils/consultantRecommendationEngine.ts"),
  "utf8"
);
assert(recommendationSource.includes("rankConsultantRecommendations"), "recommendation ranking");
assert(recommendationSource.includes("matching-relationship-goals"), "relationship goal matching");
assert(recommendationSource.includes("deriveRecommendationLevel"), "recommendation levels");

const assignmentSource = readFileSync(join(rootPath, "src/utils/consultantAssignmentEngine.ts"), "utf8");
assert(assignmentSource.includes("prepareAssignmentDecision"), "admin-confirmed decision prep");
assert(assignmentSource.includes("confirmAssignmentDecision"), "admin-confirmed execution");
assert(assignmentSource.includes("requiresAdminConfirm"), "never automatic by default");
assert(assignmentSource.includes("consultantWorkloadEngine"), "delegates workload engine");
assert(assignmentSource.includes("consultantRecommendationEngine"), "delegates recommendation engine");

const componentFiles = [
  "ConsultantWorkloadCard.tsx",
  "AssignmentRecommendationCard.tsx",
  "ConsultantCapacityBadge.tsx",
  "AssignmentDecisionCard.tsx"
];

for (const file of componentFiles) {
  assert(
    readFileSync(join(rootPath, "src/components/admin/concierge", file), "utf8").length > 0,
    `${file} exists`
  );
}

const operationsSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/AssignmentQueueCard.tsx"),
  "utf8"
);
assert(operationsSource.includes("AssignmentDecisionCard"), "operations center uses decision card");
const decisionCardSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/AssignmentDecisionCard.tsx"),
  "utf8"
);
assert(decisionCardSource.includes("Confirm assignment"), "admin confirmation required");

const crmSource = readFileSync(join(rootPath, "src/components/consultant/ConsultantWorkspacePage.tsx"), "utf8");
assert(crmSource.includes("ConsultantWorkloadCard"), "consultant CRM shows workload card");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:assignment-engine"), "package.json defines test:assignment-engine");

if (failed) process.exit(1);
console.log("assignment engine tests ok");
