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

const constantsSource = readFileSync(join(rootPath, "src/constants/aiAssistedConsultant.ts"), "utf8");
assert(constantsSource.includes("AI-Assisted Consultant Workspace™"), "workspace brand");
assert(constantsSource.includes("Application summary"), "application summary feature");
assert(constantsSource.includes("Consultation summary"), "consultation summary feature");
assert(constantsSource.includes("Introduction summary"), "introduction summary feature");
assert(constantsSource.includes("Relationship summary"), "relationship summary feature");
assert(constantsSource.includes("Journey summary"), "journey summary feature");
assert(constantsSource.includes("Suggested observations"), "observations output type");
assert(constantsSource.includes("Suggested follow-up topics"), "follow-up output type");
assert(constantsSource.includes("Suggested compatibility areas"), "compatibility output type");
assert(constantsSource.includes("AI never approves"), "never approves rule");
assert(constantsSource.includes("AI never rejects"), "never rejects rule");
assert(constantsSource.includes("AI never assigns"), "never assigns rule");
assert(constantsSource.includes("AI never introduces"), "never introduces rule");
assert(constantsSource.includes("AI never decides"), "never decides rule");
assert(constantsSource.includes("Consultants decide"), "consultants decide rule");
assert(constantsSource.includes("Senior Matchmakers"), "senior matchmaker visibility");
assert(constantsSource.includes("OpenAI integration"), "future openai documented");
assert(constantsSource.includes("Transcript analysis"), "future transcript documented");
assert(constantsSource.includes("Call summaries"), "future call summaries documented");

const logicSource = readFileSync(join(rootPath, "src/utils/aiAssistedConsultantLogic.ts"), "utf8");
assert(logicSource.includes("buildSummarySections"), "summary sections builder");
assert(logicSource.includes("buildObservations"), "observations builder");
assert(logicSource.includes("buildFollowUpTopics"), "follow-up topics builder");
assert(logicSource.includes("buildCompatibilityAreas"), "compatibility areas builder");
assert(logicSource.includes("assertAIAssistedWorkspaceRespectsRules"), "rules guard");

const engineSource = readFileSync(join(rootPath, "src/utils/aiAssistedConsultantEngine.ts"), "utf8");
assert(engineSource.includes("buildAIAssistedWorkspaceBundle"), "workspace engine");

const componentFiles = [
  "AISummaryCard.tsx",
  "AIObservationCard.tsx",
  "AIFollowUpCard.tsx",
  "AIQuestionCard.tsx",
  "AICompatibilityCard.tsx",
  "AIAssistedConsultantWorkspacePage.tsx"
];

for (const file of componentFiles) {
  assert(
    readFileSync(join(rootPath, "src/components/consultant", file), "utf8").length > 0,
    `${file} exists`
  );
}

const workspaceSource = readFileSync(
  join(rootPath, "src/components/consultant/AIAssistedConsultantWorkspacePage.tsx"),
  "utf8"
);
assert(workspaceSource.includes("buildAIAssistedWorkspaceBundle"), "workspace uses engine");
assert(workspaceSource.includes("AIObservationCard"), "workspace mounts observation card");

const consultantRoutesSource = readFileSync(join(rootPath, "src/constants/consultantRoutes.ts"), "utf8");
assert(consultantRoutesSource.includes("assist"), "consultant assist route");

const dashboardSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/ConsultantDashboardPage.tsx"),
  "utf8"
);
assert(dashboardSource.includes("AIAssistedConsultantWorkspacePage"), "admin assist integration");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:ai-workspace"), "package.json defines test:ai-workspace");

if (failed) process.exit(1);
console.log("ai workspace tests ok");
