#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  READINESS_VERIFICATION_DB_TABLES,
  buildGoNoGoRecommendation,
  buildInstitutionReadinessScore,
  canAccessReadinessVerification,
  canSubsystemReportReady,
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

const adminSource = readFileSync(join(rootPath, "src/constants/institutionalReadinessAdmin.ts"), "utf8");
assert(adminSource.includes('INSTITUTIONAL_READINESS_ADMIN_PATH = "/hard/readiness"'), "readiness route");
assert(adminSource.includes("Institutional Readiness Verification Engine™"), "readiness brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/institutionalReadiness.ts"), "utf8");
assert(constantsSource.includes("Routing"), "routing subsystem");
assert(constantsSource.includes("Authentication"), "authentication subsystem");
assert(constantsSource.includes("Permissions"), "permissions subsystem");
assert(constantsSource.includes("Supabase"), "supabase subsystem");
assert(constantsSource.includes("Payments"), "payments subsystem");
assert(constantsSource.includes("Scheduling"), "scheduling subsystem");
assert(constantsSource.includes("Notifications"), "notifications subsystem");
assert(constantsSource.includes("CRM"), "crm subsystem");
assert(constantsSource.includes("Journey Engine"), "journey engine subsystem");
assert(constantsSource.includes("Introductions"), "introductions subsystem");
assert(constantsSource.includes("Follow-ups"), "follow-ups subsystem");
assert(constantsSource.includes("Archive"), "archive subsystem");
assert(constantsSource.includes("Legacy"), "legacy subsystem");
assert(constantsSource.includes("Monitoring"), "monitoring subsystem");
assert(constantsSource.includes("Security"), "security subsystem");
assert(constantsSource.includes("Compliance"), "compliance subsystem");
assert(constantsSource.includes("Backups"), "backups subsystem");
assert(constantsSource.includes("Executive Dashboard"), "executive dashboard subsystem");
assert(constantsSource.includes('"healthy"'), "healthy result");
assert(constantsSource.includes('"warning"'), "warning result");
assert(constantsSource.includes('"critical"'), "critical result");
assert(constantsSource.includes('"unknown"'), "unknown result");
assert(constantsSource.includes("Configuration"), "configuration check");
assert(constantsSource.includes("Connectivity"), "connectivity check");
assert(constantsSource.includes("Data Integrity"), "data integrity check");
assert(constantsSource.includes("Performance"), "performance check");
assert(constantsSource.includes("Dependencies"), "dependencies check");
assert(constantsSource.includes("Audit Coverage"), "audit coverage check");
assert(constantsSource.includes("Operational Status"), "operational status check");
assert(constantsSource.includes("READINESS_VERIFICATION_RULES"), "verification rules");
assert(constantsSource.includes("READINESS_FUTURE_ARCHITECTURE"), "future architecture");
assert(constantsSource.includes("Continuous Verification"), "continuous verification future");
assert(constantsSource.includes("readiness_subsystem_contracts"), "subsystem contracts table");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606257000_institutional_readiness_verification.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("readiness_verification_checks"), "verification checks migration");
assert(migrationSource.includes("readiness_dependency_links"), "dependency links migration");
assert(migrationSource.includes("readiness_verification_runs"), "verification runs migration");

const typesSource = readFileSync(join(rootPath, "src/types/institutionalReadiness.ts"), "utf8");
assert(typesSource.includes("institutionReadinessScore"), "institution readiness score");
assert(typesSource.includes("criticalIssues"), "critical issues output");
assert(typesSource.includes("passedChecks"), "passed checks output");
assert(typesSource.includes("recommendedActions"), "recommended actions output");
assert(typesSource.includes("InstitutionalReadinessVerificationBundle"), "verification bundle type");

const logicSource = readFileSync(join(rootPath, "src/utils/institutionalReadinessLogic.ts"), "utf8");
assert(logicSource.includes("propagateDependencyFailures"), "dependency propagation");
assert(logicSource.includes("buildGoNoGoRecommendation"), "go/no-go builder");
assert(logicSource.includes("buildInstitutionReadinessScore"), "readiness score builder");
assert(logicSource.includes("buildRecommendedActions"), "recommended actions builder");

const engineSource = readFileSync(join(rootPath, "src/utils/institutionalReadinessEngine.ts"), "utf8");
assert(engineSource.includes("buildInstitutionalReadinessVerificationBundle"), "verification bundle builder");
assert(engineSource.includes("buildRouteHealthReport"), "routing verification");
assert(engineSource.includes("buildPermissionsAuditReport"), "permissions verification");
assert(engineSource.includes("buildJourneyIntegrityReport"), "journey verification");
assert(engineSource.includes("buildMigrationGapReport"), "supabase verification");
assert(engineSource.includes("buildRemediationBoardBundle"), "remediation integration");
assert(engineSource.includes("propagateDependencyFailures"), "engine applies dependency rules");

const seedSource = readFileSync(join(rootPath, "src/data/institutionalReadinessSeed.ts"), "utf8");
assert(seedSource.includes("READINESS_DEPENDENCY_SEED"), "dependency seed");
assert(seedSource.includes("READINESS_SUBSYSTEM_CONTRACTS"), "subsystem contracts seed");

const adminComponents = [
  "ReadinessOverviewCard.tsx",
  "SubsystemHealthCard.tsx",
  "VerificationCard.tsx",
  "DependencyCard.tsx",
  "CriticalIssueCard.tsx",
  "LaunchRecommendationCard.tsx",
  "ReadinessPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/institutionalReadiness", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("ReadinessPage"), "admin hub mounts readiness page");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/readiness"), "readiness permission");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:institutional-readiness"), "package.json defines test:institutional-readiness");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("institutional-readiness.css"), "readiness styles imported");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("READINESS_VERIFICATION_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("bamsignal.institutionalReadiness.v1"), "localStorage manifest");

assert(READINESS_VERIFICATION_DB_TABLES.length === 6, "six readiness tables");
assert(getReadinessVerificationDatabaseTableManifest().length === 6, "database manifest");

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
assert(propagated.dependencies[0].surfaced === true, "failed dependency surfaced");

assert(
  !canSubsystemReportReady(
    { id: "payments", status: "healthy" },
    { supabase: "critical" },
    [{ downstreamId: "payments", upstreamId: "supabase", critical: true }]
  ),
  "cannot report ready with failing critical dependency"
);

const score = buildInstitutionReadinessScore([
  { score: 90, status: "healthy" },
  { score: 80, status: "healthy" },
  { score: 40, status: "critical" }
]);
assert(score < 85, "critical subsystems reduce score");

const recommendation = buildGoNoGoRecommendation(65, [{ id: "c1" }], []);
assert(recommendation.verdict === "no-go", "no-go with critical issues");
assert(formatReadinessSummaryLine({ healthyCount: 1, warningCount: 1, criticalCount: 1, score: 75 }).includes("score"), "summary line");

if (failed) {
  console.error(`\n${failed} institutional readiness test(s) failed.`);
  process.exit(1);
}

console.log("Institutional Readiness Verification Engine checks passed.");
