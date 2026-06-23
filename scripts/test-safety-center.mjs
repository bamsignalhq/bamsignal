#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  appendSafetyTimelineEntry,
  assertSafetyIncidentImmutable,
  assertSafetyTimelineAppendOnly
} from "../server/services/safetyCenter.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/safetyCenterAdmin.ts"), "utf8");
assert(adminSource.includes('SAFETY_CENTER_ADMIN_PATH = "/hard/safety"'), "admin safety route");

const constantsSource = readFileSync(join(rootPath, "src/constants/safetyCenter.ts"), "utf8");
assert(constantsSource.includes("Crisis & Safety Center™"), "safety center brand");
assert(constantsSource.includes("emergency-escalation"), "emergency escalation case type");
assert(constantsSource.includes("blackmail"), "blackmail case type");
assert(constantsSource.includes("scam-reports"), "scam reports case type");
assert(constantsSource.includes("action-required"), "action required status");
assert(constantsSource.includes("law-enforcement-referral"), "law enforcement referral action");
assert(constantsSource.includes("SAFETY_IMMUTABLE_RULES"), "immutable rules documented");
assert(constantsSource.includes("No hard deletes"), "no hard deletes rule");
assert(constantsSource.includes("SAFETY_CENTER_FUTURE_KINDS"), "future kinds documented");
assert(constantsSource.includes("safety-specialists"), "safety specialists future item");
assert(constantsSource.includes("legal-escalation"), "legal escalation future item");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("safety"), "hard routes include safety tab");

const engineSource = readFileSync(join(rootPath, "src/utils/safetyCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildSafetyCenterBundle"), "safety center engine exists");
assert(!engineSource.includes("deleteSafety"), "no delete API");

const logicSource = readFileSync(join(rootPath, "src/utils/safetyCenterLogic.ts"), "utf8");
assert(logicSource.includes("assertSafetyIncidentImmutable"), "immutable integrity check");
assert(logicSource.includes("open-cases"), "open cases metric");
assert(logicSource.includes("high-risk-cases"), "high risk cases metric");
assert(logicSource.includes("repeat-offenders"), "repeat offenders metric");
assert(logicSource.includes("assessCaseRisk"), "risk assessment logic");

const seedSource = readFileSync(join(rootPath, "src/data/safetyCenterSeed.ts"), "utf8");
assert(seedSource.includes("timeline"), "seed includes timeline");
assert(seedSource.includes("harassment"), "seed includes harassment case");

const adminComponents = [
  "SafetyCaseCard.tsx",
  "IncidentTimeline.tsx",
  "RiskAssessmentCard.tsx",
  "SafetyActionCard.tsx",
  "EscalationQueue.tsx",
  "SafetySeverityBadge.tsx",
  "SafetyDashboardPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/safety", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("SafetyDashboardPage"), "admin hub mounts safety dashboard");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"safety"'), "admin nav includes safety tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:safety-center"), "package.json defines test:safety-center");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("safety-center.css"), "safety center styles imported");

const incident = {
  id: "safety_test_001",
  caseRef: "CASE-TEST-001",
  caseTypeId: "threats",
  severity: "critical",
  status: "reported",
  reportedAt: "2026-06-22T00:00:00.000Z",
  reportedBy: "test@bamsignal.com",
  subjectRef: "member_test",
  subjectLabel: "Test Member",
  investigator: null,
  summary: "Test case",
  actionsTaken: [],
  timeline: [
    {
      id: "safety_tl_0001",
      workflow: "report",
      actor: "test@bamsignal.com",
      timestamp: "2026-06-22T00:00:00.000Z",
      note: "Initial report",
      fromStatus: null,
      toStatus: "reported"
    }
  ]
};

const updated = appendSafetyTimelineEntry(incident, {
  workflow: "require-action",
  actor: "ops@bamsignal.com",
  note: "Escalated for review",
  fromStatus: "reported",
  toStatus: "action-required"
});
assert(updated.timeline.length === 2, "append adds timeline entry");
assert(updated.status === "action-required", "status updated via workflow");

let threw = false;
try {
  assertSafetyTimelineAppendOnly(updated.timeline, [updated.timeline[0]]);
} catch {
  threw = true;
}
assert(threw, "timeline delete rejected");

threw = false;
try {
  assertSafetyIncidentImmutable([incident], []);
} catch {
  threw = true;
}
assert(threw, "case delete rejected");

threw = false;
try {
  assertSafetyIncidentImmutable([incident], [{ ...incident, summary: "tampered" }]);
} catch {
  threw = true;
}
assert(threw, "immutable field modification rejected");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Safety Center checks passed.");
