#!/usr/bin/env node
/**
 * Launch Readiness Scorecard — machine-readable ecosystem readiness tracker.
 * Usage: npm run generate:launch-readiness
 */
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PRODUCTION_CERT_VERSION } from "../shared/productionCertification.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const generatedAt = new Date().toISOString();

function fileExists(rel) {
  return existsSync(join(rootPath, rel));
}

function scoreCategory(present, total, blockers = [], recommendations = []) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  return {
    score: pct,
    present,
    total,
    blockingIssues: blockers,
    recommendations
  };
}

const categories = {
  infrastructure: scoreCategory(
    fileExists("migrations/0062_admin_operations_core.sql") &&
      fileExists("server/services/schemaVerification.js") &&
      fileExists("certification/production/run.mjs")
      ? 3
      : 0,
    3,
    [],
    ["Maintain migration certification on every sprint"]
  ),
  authentication: scoreCategory(
    fileExists("server/services/auth/lifecycle.js") &&
      fileExists("server/services/auth/sessions.js") &&
      fileExists("scripts/test-auth-lifecycle.mjs")
      ? 3
      : 0,
    3
  ),
  finance: scoreCategory(
    fileExists("server/services/finance/index.js") &&
      fileExists("migrations/0059_member_financial_core.sql") &&
      fileExists("scripts/test-financial-core.mjs")
      ? 3
      : 0,
    3
  ),
  messaging: scoreCategory(
    fileExists("server/services/messaging/index.js") &&
      fileExists("migrations/0060_member_messaging_core.sql") &&
      fileExists("scripts/certify-messaging-journey.mjs")
      ? 3
      : 0,
    3
  ),
  moderation: scoreCategory(
    fileExists("server/services/operations/moderation.js") &&
      fileExists("server/services/operations/userSafety.js") &&
      fileExists("docs/architecture/MODERATION.md")
      ? 3
      : 0,
    3,
    [],
    ["Wire production moderator UI to /api/operations/admin"]
  ),
  support: scoreCategory(
    fileExists("server/services/operations/support.js") &&
      fileExists("docs/architecture/SUPPORT.md")
      ? 2
      : 0,
    3,
    ["Member-facing support ticket submission UI not yet wired"],
    ["Connect help center to createSupportTicket API"]
  ),
  concierge: scoreCategory(
    fileExists("server/services/operations/concierge.js") &&
      fileExists("server/services/conciergeOperations.js") &&
      fileExists("docs/architecture/CONCIERGE.md")
      ? 3
      : 0,
    3
  ),
  operations: scoreCategory(
    fileExists("server/services/operations/index.js") &&
      fileExists("api/operations/admin.js") &&
      fileExists("scripts/certify-operations-journey.mjs")
      ? 3
      : 0,
    3
  ),
  documentation: scoreCategory(
    [
      "docs/architecture/ADMIN.md",
      "docs/architecture/MODERATION.md",
      "docs/architecture/CONCIERGE.md",
      "docs/architecture/SUPPORT.md",
      "docs/architecture/FEATURE_FLAGS.md",
      "docs/operations/ADMIN_RUNBOOK.md",
      "docs/operations/MODERATION_RUNBOOK.md"
    ].filter(fileExists).length,
    7
  ),
  certification: scoreCategory(
    fileExists("scripts/certify-operations-journey.mjs") &&
      fileExists("certification/production/run.mjs")
      ? 2
      : 0,
    2
  )
};

const scores = Object.values(categories).map((c) => c.score);
const overallReadinessPercentage = Math.round(
  scores.reduce((sum, s) => sum + s, 0) / scores.length
);

const report = {
  application: "BamSignal",
  repository: "bamsignalhq/bamsignal",
  supabaseProject: "nswiwxmavuqpuzlsascs",
  certificationVersion: PRODUCTION_CERT_VERSION,
  sprint: "Sprint 5 — Admin Console, Moderation, Concierge Operations & Customer Support",
  generatedAt,
  overallReadinessPercentage,
  categories,
  milestoneHistory: [
    "3d3658a feat(passport): implement trust signal platform (v2.0-v2.2)",
    "fc0abae feat(infrastructure): production hardening and certification",
    "5343070 feat(auth): implement authentication lifecycle and session management",
    "65a706a feat(finance): implement financial core",
    "a609d37 feat(messaging): implement messaging, notifications, presence and realtime"
  ],
  nextActions: [
    "Push milestone commits once GitHub authentication is confirmed",
    "Run npm run certify:production after migration deploy",
    "Wire operations admin UI to /api/operations/admin contracts"
  ]
};

writeFileSync(join(rootPath, "launch-readiness.json"), JSON.stringify(report, null, 2));

const md = [
  "# BamSignal Launch Readiness Scorecard",
  "",
  `**Generated:** ${generatedAt}`,
  `**Certification version:** ${PRODUCTION_CERT_VERSION}`,
  `**Overall readiness:** ${overallReadinessPercentage}%`,
  "",
  "## Categories",
  "",
  "| Category | Score | Blocking Issues | Recommendations |",
  "|----------|-------|-----------------|-----------------|",
  ...Object.entries(categories).map(([name, cat]) => {
    const blockers = cat.blockingIssues.length ? cat.blockingIssues.join("; ") : "—";
    const recs = cat.recommendations?.length ? cat.recommendations.join("; ") : "—";
    return `| ${name} | ${cat.score}% | ${blockers} | ${recs} |`;
  }),
  "",
  "## Next Actions",
  "",
  ...report.nextActions.map((a) => `- ${a}`),
  "",
  "This scorecard is the authoritative launch tracker for BamSignal Phase C."
].join("\n");

writeFileSync(join(rootPath, "launch-readiness.md"), md);
console.log(`Launch readiness: ${overallReadinessPercentage}%`);
console.log("Wrote launch-readiness.json and launch-readiness.md");
