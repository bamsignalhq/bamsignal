#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  READINESS_AUDIT_DOMAINS,
  READINESS_EXPORT_TYPES,
  READINESS_VERIFICATION_DB_TABLES,
  buildBlockerCounts,
  buildGoNoGoRecommendation,
  buildInstitutionReadinessScore,
  buildReadinessTrend,
  canAccessReadinessVerification,
  filterBlockersBySeverity,
  formatReadinessSummaryLine,
  getReadinessVerificationDatabaseTableManifest,
  propagateDependencyFailures,
  scoreToReadinessResult
} from "../server/services/institutionalReadinessVerification.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const adminSource = read("src/constants/institutionalReadinessAdmin.ts");
assert(adminSource.includes('INSTITUTIONAL_READINESS_ADMIN_PATH = "/hard/readiness"'), "readiness route");
assert(adminSource.includes("Institutional Readiness Audit"), "readiness brand");

const constantsSource = read("src/constants/institutionalReadiness.ts");
assert(constantsSource.includes("READINESS_AUDIT_DOMAINS"), "audit domains");
assert(constantsSource.includes("Infrastructure"), "infrastructure audit");
assert(constantsSource.includes("Security"), "security audit");
assert(constantsSource.includes("Payments"), "payments audit");
assert(constantsSource.includes("Messaging"), "messaging audit");
assert(constantsSource.includes("Matching"), "matching audit");
assert(constantsSource.includes("Concierge"), "concierge audit");
assert(constantsSource.includes("Support"), "support audit");
assert(constantsSource.includes("Research"), "research audit");
assert(constantsSource.includes("Communities"), "communities audit");
assert(constantsSource.includes("Events"), "events audit");
assert(constantsSource.includes("Documentation"), "documentation audit");
assert(constantsSource.includes("Release"), "release audit");
assert(constantsSource.includes("Abuse"), "abuse audit");
assert(constantsSource.includes("Performance"), "performance audit");
assert(constantsSource.includes("founder-report"), "founder report export");
assert(constantsSource.includes("board-report"), "board report export");
assert(constantsSource.includes("launch-report"), "launch report export");
assert(constantsSource.includes("READINESS_BLOCKER_SEVERITIES"), "blocker severities");
assert(constantsSource.includes("GO WITH CONDITIONS"), "go with conditions label");
assert(constantsSource.includes("INSTITUTIONAL_READINESS_REFRESH_INTERVAL_MS"), "refresh interval");
assert(constantsSource.includes("readiness_audit_domains"), "audit domains table");

const migrationSource = read("supabase/migrations/202606262000_institutional_readiness_audit.sql");
assert(migrationSource.includes("readiness_audit_domains"), "audit domains migration");
assert(migrationSource.includes("readiness_trend_snapshots"), "trend snapshots migration");
assert(migrationSource.includes("readiness_audit_exports"), "audit exports migration");

const typesSource = read("src/types/institutionalReadiness.ts");
assert(typesSource.includes("ReadinessAuditDomainScore"), "audit domain score type");
assert(typesSource.includes("ReadinessTrendSnapshot"), "trend snapshot type");
assert(typesSource.includes("ReadinessBlocker"), "blocker type");
assert(typesSource.includes("ReadinessExportRecord"), "export record type");
assert(!typesSource.includes("no-go-member-only"), "removed member-only verdict");

const logicSource = read("src/utils/institutionalReadinessLogic.ts");
assert(logicSource.includes("buildAuditDomainScores"), "audit domain scores");
assert(logicSource.includes("buildReadinessBlockers"), "readiness blockers");
assert(logicSource.includes("buildReadinessTrend"), "readiness trend");
assert(logicSource.includes("buildReadinessExportSummary"), "export summary");

const engineSource = read("src/utils/institutionalReadinessEngine.ts");
assert(engineSource.includes("buildInstitutionalReadinessVerificationBundle"), "verification bundle builder");
assert(engineSource.includes("buildLiveInstitutionalReadinessBundle"), "live bundle builder");

const storeSource = read("src/utils/institutionalReadinessStore.ts");
assert(storeSource.includes("bamsignal.institutionalReadiness.v1"), "localStorage key");
assert(storeSource.includes("exportReadinessReport"), "export readiness report");

const seedSource = read("src/data/institutionalReadinessSeed.ts");
assert(seedSource.includes("READINESS_AUDIT_DOMAIN_SUBSYSTEM_MAP"), "audit domain map");

const adminComponents = [
  "ReadinessOverviewCard.tsx",
  "ReadinessAuditDomainsCard.tsx",
  "ReadinessBlockersCard.tsx",
  "ReadinessExportCard.tsx",
  "LaunchRecommendationCard.tsx",
  "CriticalIssueCard.tsx",
  "ReadinessPage.tsx"
];

for (const file of adminComponents) {
  try {
    read(`src/components/admin/institutionalReadiness/${file}`);
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = read("src/pages/AdminHubPage.tsx");
assert(hubSource.includes("ReadinessPage"), "admin hub mounts readiness page");

const permissionsSource = read("src/constants/permissions.ts");
assert(permissionsSource.includes("/hard/readiness"), "readiness permission");

const packageSource = read("package.json");
assert(packageSource.includes("test:institutional-readiness"), "package.json defines test:institutional-readiness");
assert(packageSource.includes("readiness:report"), "package.json defines readiness:report");

const mainSource = read("src/main.tsx");
const entryAdminSource = read("src/styles/entry-admin.css");
assert((entryAdminSource.includes("institutional-readiness.css") || mainSource.includes("institutional-readiness.css")), "readiness styles imported");

const databaseAuditSource = read("src/utils/databaseAudit.ts");
assert(databaseAuditSource.includes("READINESS_VERIFICATION_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("readiness_audit_domains"), "audit domains in schema");

assert(READINESS_AUDIT_DOMAINS.length === 17, "seventeen audit domains");
assert(READINESS_EXPORT_TYPES.length === 3, "three export types");
assert(READINESS_VERIFICATION_DB_TABLES.length === 9, "nine readiness tables");
assert(getReadinessVerificationDatabaseTableManifest().length === 9, "database manifest");

assert(canAccessReadinessVerification(["ManageOperations"]), "operations role can access");
assert(canAccessReadinessVerification(["ViewExecutiveDashboard"]), "executive role can access");
assert(canAccessReadinessVerification(["SystemAdministration"]), "system admin can access");
assert(!canAccessReadinessVerification(["ViewMembers"]), "members cannot access");

assert(scoreToReadinessResult(90, false) === "healthy", "healthy score");
assert(scoreToReadinessResult(60, false) === "warning", "warning score");
assert(scoreToReadinessResult(80, true) === "critical", "critical override");

const subsystems = [
  { id: "supabase", status: "critical", score: 25, failedDependencies: [] },
  { id: "payments", status: "healthy", score: 90, failedDependencies: [] }
];
const dependencies = [
  {
    id: "dep_test",
    dependencyRef: "DEP-TEST",
    upstreamId: "supabase",
    downstreamId: "payments",
    critical: true,
    upstreamStatus: "critical",
    downstreamStatus: "healthy",
    surfaced: false
  }
];

const propagated = propagateDependencyFailures(subsystems, dependencies);
assert(propagated.subsystems[1].status === "critical", "critical dependency propagates");

const score = buildInstitutionReadinessScore([
  { score: 90, status: "healthy" },
  { score: 80, status: "healthy" },
  { score: 40, status: "critical" }
]);
assert(score < 85, "critical subsystems reduce score");

const trend = buildReadinessTrend(88, 84);
assert(trend.direction === "up", "trend up when score improves");

const blockers = [
  { severity: "critical" },
  { severity: "high" },
  { severity: "medium" },
  { severity: "low" }
];
const counts = buildBlockerCounts(blockers);
assert(counts.critical === 1 && counts.high === 1, "blocker counts");

const recommendation = buildGoNoGoRecommendation(65, [{ id: "c1" }], [], blockers);
assert(recommendation.verdict === "no-go", "no-go with critical issues");
assert(recommendation.label === "NO GO", "no go label");

const goRecommendation = buildGoNoGoRecommendation(92, [], [], []);
assert(goRecommendation.verdict === "go", "go verdict at high score");

assert(
  formatReadinessSummaryLine({
    institutionReadinessScore: 85,
    trend: { direction: "up" },
    subsystems: [{ status: "healthy" }, { status: "warning" }, { status: "critical" }]
  }).includes("trend"),
  "summary line includes trend"
);

assert(filterBlockersBySeverity(blockers, "high").length === 1, "filter high blockers");

if (failed) {
  console.error(`\n${failed} institutional readiness test(s) failed.`);
  process.exit(1);
}

console.log("Institutional Readiness Audit checks passed.");
