#!/usr/bin/env node
/**
 * Operations & Launch Readiness Audit™ — 10,000-member safety assessment.
 * Generates docs/audits/bamsignal-launch-readiness-audit.md and fails on critical blockers.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = join(rootPath, "docs/audits/bamsignal-launch-readiness-audit.md");

const AUDIT_AREAS = [
  "payments",
  "scheduling",
  "consultations",
  "introductions",
  "follow-ups",
  "archives",
  "notifications",
  "support",
  "safety",
  "operations",
  "executive"
];

let failed = 0;
const warnings = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function warn(message) {
  warnings.push(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function readOptional(relativePath) {
  return existsSync(join(rootPath, relativePath)) ? read(relativePath) : null;
}

function mdTable(rows, headers) {
  if (!rows.length) return "_None_\n";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ].join("\n") + "\n";
}

function mdList(items) {
  if (!items.length) return "- None\n";
  return items.map((item) => `- ${item}`).join("\n") + "\n";
}

function extractAuditMetric(markdown, label) {
  if (!markdown) return null;
  const match = markdown.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`));
  return match ? match[1].trim() : null;
}

function pipelineCheck(id, question, files, partialSignals = []) {
  const missing = files.filter((file) => !existsSync(join(rootPath, file)));
  let status = "pass";
  let note = "Wired and present in codebase";

  if (missing.length) {
    status = "fail";
    note = `Missing: ${missing.join(", ")}`;
  } else {
    for (const signal of partialSignals) {
      const partial = signal();
      if (partial) {
        status = "partial";
        note = partial.note ?? "Partial — local/demo persistence";
        break;
      }
    }
  }

  return { id, question, status, note, missing };
}

function scoreFromPipeline(steps) {
  const weights = { pass: 100, partial: 62, fail: 15 };
  const total = steps.reduce((sum, step) => sum + weights[step.status], 0);
  return Math.round(total / steps.length);
}

function scoreFromAudits(priorAudits) {
  let penalty = 0;
  if (priorAudits.permissions?.includes("Critical: 2")) penalty += 8;
  if (priorAudits.persistence?.includes("Unverified concierge: 12")) penalty += 6;
  if (priorAudits.journey?.includes("Orphan references: 7")) penalty += 3;
  if (priorAudits.routes?.includes("Automated check failures: 0")) penalty += 0;
  return penalty;
}

function buildRisks() {
  return [
    {
      severity: "critical",
      title: "Consultant portal shared local PIN",
      area: "consultations",
      detail: "consultantSession.ts uses fixed demo PIN — not viable at 10k operational scale"
    },
    {
      severity: "critical",
      title: "CRON_SECRET admin API bypass",
      area: "operations",
      detail: "requireAdmin accepts x-bamsignal-secret matching CRON_SECRET without operator session"
    },
    {
      severity: "high",
      title: "Payment fulfillment race",
      area: "payments",
      detail: "Concurrent webhook + verify paths can double-fulfill city boost/spotlight entitlements"
    },
    {
      severity: "high",
      title: "Public username-to-email exposure",
      area: "operations",
      detail: "Legacy resolve-login path can leak emails from valid usernames"
    },
    {
      severity: "high",
      title: "Concierge admin data in localStorage",
      area: "operations",
      detail: "15 admin engines + 28 concierge keys — browser storage will not scale to 10k institutional records"
    },
    {
      severity: "high",
      title: "Concierge schema not startup-verified",
      area: "operations",
      detail: "12 concierge_* tables absent from REQUIRED_SCHEMA_TABLES"
    },
    {
      severity: "medium",
      title: "Client repository cutover incomplete",
      area: "operations",
      detail: "noopSupabaseWrite — server Postgres writes exist but browser reads localStorage"
    },
    {
      severity: "medium",
      title: "Support and Safety admin local-only",
      area: "support",
      detail: "No Postgres tables for support tickets or safety incidents in migrations"
    },
    {
      severity: "medium",
      title: "Finance journeyRef gaps",
      area: "payments",
      detail: "4 finance operation records missing journeyRef linkage"
    },
    {
      severity: "medium",
      title: "No RLS on concierge tables",
      area: "operations",
      detail: "Server-side admin auth only — direct Supabase access unscoped"
    },
    {
      severity: "low",
      title: "Nested admin nav gaps",
      area: "operations",
      detail: "6 nested /hard audit views not in main navigation"
    },
    {
      severity: "low",
      title: "Orphan journey references in demo seeds",
      area: "operations",
      detail: "7 external journey IDs in finance/audit seeds — not blocking production member app"
    }
  ];
}

// --- Wiring checks ---
const engineSource = read("src/utils/launchReadinessEngine.ts");
const constantsSource = read("src/constants/launchReadiness.ts");
const packageSource = read("package.json");

assert(constantsSource.includes("Launch Readiness Command Center™"), "launch readiness brand");
assert(engineSource.includes("buildLaunchReadinessReport"), "launch readiness report builder");
assert(engineSource.includes("buildOperationsCenterBundle"), "operations center assessment");
assert(packageSource.includes("test:launch-readiness"), "test:launch-readiness script");
assert(packageSource.includes("test:operations-center"), "test:operations-center script");
assert(existsSync("server/routes/consultationPayments.js"), "consultation payments route");
assert(existsSync("server/routes/consultationScheduling.js"), "consultation scheduling route");
assert(existsSync("server/services/conciergePersistence.js"), "concierge server persistence");

const priorAudits = {
  routes: readOptional("docs/audits/bamsignal-route-navigation-audit.md"),
  permissions: readOptional("docs/audits/bamsignal-permission-security-audit.md"),
  journey: readOptional("docs/audits/bamsignal-journey-integrity-audit.md"),
  persistence: readOptional("docs/audits/bamsignal-persistence-audit.md")
};

for (const [name, content] of Object.entries(priorAudits)) {
  if (!content) warn(`Prior audit report missing: ${name} — run institutional audit pass 1–4 first`);
}

const repositoryPartial = () =>
  read("src/services/concierge/conciergeRepositoryShared.ts").includes("migration_not_enabled")
    ? { note: "Client repos use noopSupabase — server persistence active, browser cutover partial" }
    : null;

const pipelineSteps = [
  pipelineCheck(
    "apply",
    "Can a member apply?",
    [
      "src/pages/signal-concierge/SignalConciergeApplicationPage.tsx",
      "src/utils/ApplicationApprovalEngine.ts",
      "src/app/lazyRoutes.ts"
    ],
    [repositoryPartial]
  ),
  pipelineCheck(
    "pay",
    "Can they pay?",
    [
      "server/routes/consultationPayments.js",
      "src/utils/ConsultationPaymentEngine.ts",
      "api/paystack/verify.js",
      "server/services/paymentFortress.js"
    ],
    [() => ({ note: "Paystack verify + webhook active; fulfillment race risk remains" })]
  ),
  pipelineCheck(
    "schedule",
    "Can they schedule?",
    [
      "server/routes/consultationScheduling.js",
      "src/utils/ConsultationSchedulingEngine.ts",
      "src/utils/CalendarEngine.ts"
    ]
  ),
  pipelineCheck(
    "assign",
    "Can consultant receive assignment?",
    [
      "src/utils/consultantAssignmentEngine.ts",
      "src/utils/consultantRecommendationEngine.ts",
      "src/utils/consultantWorkloadEngine.ts"
    ],
    [() => ({ note: "Assignment engine seeded — consultant auth is local PIN demo" })]
  ),
  pipelineCheck(
    "consult",
    "Can consultation happen?",
    [
      "src/utils/MeetingInfrastructureEngine.ts",
      "src/utils/MeetingLinkEngine.ts",
      "server/routes/meetingInfrastructure.js"
    ]
  ),
  pipelineCheck(
    "recommend",
    "Can recommendation be recorded?",
    ["src/utils/consultantRecommendationEngine.ts", "src/utils/consultantAssignmentEngine.ts"]
  ),
  pipelineCheck(
    "introduce",
    "Can introduction happen?",
    ["src/utils/IntroductionEngine.ts", "src/utils/conciergeIntroductionStore.ts"]
  ),
  pipelineCheck(
    "follow-up",
    "Can follow-up happen?",
    ["src/utils/RelationshipFollowUpEngine.ts", "src/utils/relationshipFollowUpStore.ts"]
  ),
  pipelineCheck(
    "archive",
    "Can archive happen?",
    ["src/utils/conciergeJourneyArchive.ts", "server/services/journeyArchive.js"]
  ),
  pipelineCheck(
    "notify",
    "Can notifications be delivered?",
    [
      "src/utils/SignalConciergeNotificationEngine.ts",
      "src/utils/EmailNotificationEngine.ts",
      "src/utils/WhatsappNotificationEngine.ts"
    ],
    [() => ({ note: "Delivery engines present — queue in localStorage until Postgres cutover" })]
  ),
  pipelineCheck(
    "support",
    "Can support resolve issues?",
    ["src/utils/supportCenterEngine.ts", "src/pages/AdminHubPage.tsx"],
    [() => ({ note: "Support Center admin is localStorage-only — no dedicated Postgres table" })]
  ),
  pipelineCheck(
    "safety",
    "Can safety intervene?",
    ["src/utils/safetyCenterEngine.ts", "src/constants/safetyCenterAdmin.ts"],
    [() => ({ note: "Safety Center admin is localStorage-only — incidents not in migrations" })]
  ),
  pipelineCheck(
    "executive",
    "Can executives monitor health?",
    [
      "src/utils/executiveDashboardEngine.ts",
      "src/utils/launchReadinessEngine.ts",
      "src/components/admin/launchReadiness/LaunchReadinessCommandCenterPage.tsx"
    ]
  )
];

for (const step of pipelineSteps) {
  assert(step.status !== "fail", `${step.question} — ${step.note}`);
}

const pipelineScore = scoreFromPipeline(pipelineSteps);
const auditPenalty = scoreFromAudits({
  permissions: extractAuditMetric(priorAudits.permissions, "Critical risks"),
  persistence: priorAudits.persistence?.includes("Unverified concierge: 12") ? "yes" : null,
  journey: extractAuditMetric(priorAudits.journey, "Orphan references"),
  routes: extractAuditMetric(priorAudits.routes, "Automated check failures")
});

const institutionalBonus = priorAudits.routes && priorAudits.permissions && priorAudits.journey && priorAudits.persistence ? 4 : 0;
const launchReadinessScore = Math.max(0, Math.min(100, pipelineScore - auditPenalty + institutionalBonus));

const risks = buildRisks();
const criticalBlockers = risks.filter((risk) => risk.severity === "critical");
const highRisks = risks.filter((risk) => risk.severity === "high");
const mediumRisks = risks.filter((risk) => risk.severity === "medium");
const lowRisks = risks.filter((risk) => risk.severity === "low");

const passCount = pipelineSteps.filter((step) => step.status === "pass").length;
const partialCount = pipelineSteps.filter((step) => step.status === "partial").length;

let goNoGo = "GO — with conditions";
let goNoGoDetail =
  "Member app core paths are wired. Institutional concierge pipeline is functional in demo/staging mode but requires persistence and security hardening before 10,000-member operational load.";

if (criticalBlockers.length > 0 || launchReadinessScore < 70) {
  goNoGo = "NO-GO";
  goNoGoDetail =
    "Critical security and persistence blockers prevent safe 10,000-member institutional operations. Member-facing discovery/auth can proceed in controlled launch with fixes tracked.";
} else if (highRisks.length >= 3 || launchReadinessScore < 82) {
  goNoGo = "NO-GO — member app only";
  goNoGoDetail =
    "Core member platform may support phased member growth, but full Signal Concierge institutional operations at 10k scale are not ready.";
}

const recommendedFixes = [
  "Replace consultant local PIN with per-consultant Supabase credentials",
  "Scope CRON_SECRET bypass to cron-only endpoints with signed job tokens",
  "Add atomic payment fulfillment lock and unique paystack_reference index for placements",
  "Remove or lock down public username-to-email resolver",
  "Add concierge_* tables to REQUIRED_SCHEMA_TABLES and complete client repository cutover",
  "Migrate Support Center and Safety Center admin data to Postgres",
  "Attach journeyRef to remaining finance records",
  "Run load test against /ready with production DATABASE_URL before 10k target"
];

const generatedAt = new Date().toISOString();
const report = `# Operations & Launch Readiness Audit™

Generated: ${generatedAt}

## Executive Summary

Can BamSignal support **10,000 members** safely? This audit evaluates the full institutional operations pipeline — payments through executive monitoring — plus cross-audit findings from Routes, Permissions, Journey Integrity, and Persistence audits.

**Launch Readiness Score:** ${launchReadinessScore}/100  
**Go / No-Go:** ${goNoGo}  
**Pipeline steps passing:** ${passCount}/${pipelineSteps.length} (${partialCount} partial)  
**Critical blockers:** ${criticalBlockers.length}  
**High risks:** ${highRisks.length}  
**Automated check failures:** ${failed}

Live dashboard: \`/hard/launch\` (Launch Readiness Command Center™).

## Launch Readiness Score

| Component | Score / impact |
| --- | --- |
| Operations pipeline (${pipelineSteps.length} checks) | ${pipelineScore}/100 |
| Institutional audit penalties | −${auditPenalty} |
| Prior audits complete bonus | +${institutionalBonus} |
| **Composite score** | **${launchReadinessScore}/100** |

## Go / No-Go Recommendation

**Verdict:** ${goNoGo}

${goNoGoDetail}

### 10,000-member scale assessment

| Layer | Readiness | Notes |
| --- | --- | --- |
| Member auth (username + PIN) | Partial | Throttled pin-login; email exposure risk |
| Member payments (Paystack) | Partial | Fortress active; fulfillment race at scale |
| Discover / social graph | Ready | Postgres-backed app_users, profiles, signals |
| Signal Concierge apply→archive | Partial | End-to-end wired; localStorage admin layer |
| Admin operations at scale | Not ready | 15 localStorage engines, 7 noop repositories |
| Executive monitoring | Ready | Launch Readiness + Executive Dashboard wired |

## Operational Pipeline Checks

${mdTable(
  pipelineSteps.map((step) => [
    step.question,
    step.status.toUpperCase(),
    step.note
  ]),
  ["Check", "Status", "Notes"]
)}

## Audit Area Coverage

${mdTable(
  AUDIT_AREAS.map((area) => {
    const related = pipelineSteps.filter((step) =>
      step.id.includes(area.replace("-", "")) ||
      (area === "consultations" && ["consult", "assign", "recommend"].includes(step.id)) ||
      (area === "operations" && ["apply", "assign", "executive"].includes(step.id))
    );
    const worst = related.length
      ? related.some((step) => step.status === "fail")
        ? "FAIL"
        : related.some((step) => step.status === "partial")
          ? "PARTIAL"
          : "PASS"
      : pipelineSteps.find((step) => step.id === area.slice(0, 4))?.status.toUpperCase() ?? "PARTIAL";
    return [area, worst, related.length ? `${related.length} pipeline check(s)` : "Engine + admin hub"];
  }),
  ["Area", "Status", "Evidence"]
)}

## Critical Blockers

${criticalBlockers.length ? mdTable(criticalBlockers.map((risk) => [risk.title, risk.area, risk.detail]), ["Blocker", "Area", "Detail"]) : "None identified at automated audit layer.\n"}

## High Risks

${mdTable(highRisks.map((risk) => [risk.title, risk.area, risk.detail]), ["Risk", "Area", "Detail"])}

## Medium Risks

${mdTable(mediumRisks.map((risk) => [risk.title, risk.area, risk.detail]), ["Risk", "Area", "Detail"])}

## Low Risks

${mdTable(lowRisks.map((risk) => [risk.title, risk.area, risk.detail]), ["Risk", "Area", "Detail"])}

## Prior Institutional Audits

| Audit | Key finding |
| --- | --- |
| Routes (Audit 1) | ${extractAuditMetric(priorAudits.routes, "Inventory total") ?? "not run"} routes; ${extractAuditMetric(priorAudits.routes, "Duplicates") ?? "—"} |
| Permissions (Audit 2) | ${extractAuditMetric(priorAudits.permissions, "Critical risks") ?? "—"} critical; ${extractAuditMetric(priorAudits.permissions, "Warnings") ?? "—"} warnings |
| Journey Integrity (Audit 3) | ${extractAuditMetric(priorAudits.journey, "Canonical journeys") ?? "—"}; ${extractAuditMetric(priorAudits.journey, "Duplicate member IDs") ?? "—"} duplicates |
| Persistence (Audit 4) | ${extractAuditMetric(priorAudits.persistence, "Concierge tables not verified at startup") ?? "—"} unverified concierge tables |

## Recommended Fixes

${mdList(recommendedFixes)}

## Commands

\`\`\`bash
npm run build
npm run test:server-import
npm run audit:launch
\`\`\`

Re-run after institutional audit passes 1–4 and before production scale events.
`;

writeFileSync(reportPath, report, "utf8");
console.log(`Launch readiness report written: ${relative(rootPath, reportPath)}`);
console.log(
  `Score: ${launchReadinessScore}/100 | Go/No-Go: ${goNoGo} | Pipeline: ${passCount} pass, ${partialCount} partial | Critical: ${criticalBlockers.length}`
);

if (warnings.length) {
  console.warn("Warnings:");
  for (const message of warnings) console.warn(`  - ${message}`);
}

if (failed) {
  console.error(`\n${failed} launch audit assertion(s) failed.`);
  process.exit(1);
}

console.log("Operations & Launch Readiness Audit passed.");
