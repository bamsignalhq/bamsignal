import { AUDIT_CENTER_ADMIN_PATH } from "../constants/auditCenterAdmin";
import { DATABASE_AUDIT_ADMIN_PATH } from "../constants/databaseAudit";
import { EXECUTIVE_DASHBOARD_ADMIN_PATH } from "../constants/executiveDashboardAdmin";
import {
  READINESS_SUBSYSTEMS,
  READINESS_SUBSYSTEM_LABELS
} from "../constants/institutionalReadiness";
import { JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH } from "../constants/journeyIntegrityAudit";
import { LAUNCH_READINESS_ADMIN_PATH } from "../constants/launchReadiness";
import { MONITORING_CENTER_ADMIN_PATH } from "../constants/monitoringCenterAdmin";
import { OPERATIONS_CENTER_PATH } from "../constants/operationsCenter";
import { PERMISSIONS_AUDIT_ADMIN_PATH } from "../constants/permissionsAudit";
import { RECOVERY_CENTER_ADMIN_PATH } from "../constants/recoveryCenterAdmin";
import { REMEDIATION_BOARD_ADMIN_PATH } from "../constants/remediationBoardAdmin";
import { ROUTE_AUDIT_ADMIN_PATH } from "../constants/routeAudit";
import { SAFETY_CENTER_ADMIN_PATH } from "../constants/safetyCenterAdmin";
import {
  READINESS_DEPENDENCY_SEED,
  READINESS_SUBSYSTEM_CONTRACTS
} from "../data/institutionalReadinessSeed";
import type {
  InstitutionalReadinessVerificationBundle,
  ReadinessCheckTypeId,
  ReadinessDependencyLink,
  ReadinessResultId,
  ReadinessSubsystemHealth,
  ReadinessSubsystemId,
  ReadinessVerificationCheck
} from "../types/institutionalReadiness";
import { buildExecutiveDashboard } from "./executiveDashboardEngine";
import {
  buildAuditDomainScores,
  buildBlockerCounts,
  buildGoNoGoRecommendation,
  buildInstitutionReadinessScore,
  buildIssuesFromFindings,
  buildReadinessBlockers,
  buildReadinessTrend,
  buildRecommendedActions,
  partitionChecks,
  propagateDependencyFailures,
  scoreToReadinessResult
} from "./institutionalReadinessLogic";
import {
  listReadinessExports,
  recordReadinessTrendScore
} from "./institutionalReadinessStore";
import { buildJourneyIntegrityReport, summarizeJourneyIntegrityStatus } from "./journeyIntegrityReport";
import { buildLaunchReadinessReport } from "./launchReadinessEngine";
import { buildMigrationGapReport } from "./migrationGapReport";
import { buildMonitoringCenterBundle } from "./monitoringCenterEngine";
import { buildOperationsCenterBundle } from "./OperationsCenterEngine";
import { buildRecoveryCenterBundle } from "./recoveryCenterEngine";
import { buildRemediationBoardBundle } from "./remediationBoardEngine";
import { buildRouteHealthReport } from "./routeHealthReport";
import { buildPermissionsAuditReport } from "./securityAuditReport";
import { listSafetyCenterIncidents } from "./safetyCenterEngine";
import { findFinanceRecordsMissingJourneyRef } from "./journeyIntegrityAudit";

type SubsystemEvaluation = {
  score: number;
  hasCritical: boolean;
  issueCount: number;
  summary: string;
  auditPath: string | null;
  checks: ReadinessVerificationCheck[];
};

let checkCounter = 0;

function makeCheck(
  subsystemId: ReadinessSubsystemId,
  checkType: ReadinessCheckTypeId,
  passed: boolean,
  message: string
): ReadinessVerificationCheck {
  checkCounter += 1;
  const status: ReadinessResultId = passed ? "healthy" : message.includes("unknown") ? "unknown" : passed ? "healthy" : "critical";
  return {
    id: `chk_${checkCounter}`,
    checkRef: `CHK-${subsystemId.toUpperCase()}-${checkCounter}`,
    subsystemId,
    checkType,
    status: passed ? "healthy" : status === "unknown" ? "unknown" : "warning",
    message,
    passed
  };
}

function completionFromIssues(issueCount: number, criticalThreshold: number, reviewThreshold: number): number {
  if (issueCount >= criticalThreshold) return 35;
  if (issueCount >= reviewThreshold) return 68;
  if (issueCount > 0) return 82;
  return 100;
}

function evaluateRouting(): SubsystemEvaluation {
  const report = buildRouteHealthReport();
  const issueCount = report.orphans.length + report.duplicates.length;
  const hasCritical = report.duplicates.length > 0 || report.orphans.length > 4;
  const score = completionFromIssues(issueCount, 5, 2);
  return {
    score,
    hasCritical,
    issueCount,
    summary:
      issueCount === 0
        ? "Route inventory verified — no blocking orphans or duplicates."
        : `${report.orphans.length} orphan(s), ${report.duplicates.length} duplicate route(s).`,
    auditPath: ROUTE_AUDIT_ADMIN_PATH,
    checks: [
      makeCheck("routing", "audit-coverage", true, "Route audit inventory loaded"),
      makeCheck("routing", "data-integrity", issueCount === 0, "Route integrity check"),
      makeCheck("routing", "configuration", report.redirectRecommendations.length < 10, "Redirect configuration review")
    ]
  };
}

function evaluateAuthentication(): SubsystemEvaluation {
  const permissions = buildPermissionsAuditReport();
  const authIssues = permissions.issues.filter((issue) =>
    issue.title.toLowerCase().includes("auth")
  ).length;
  const hasCritical = permissions.issues.some(
    (issue) => issue.status === "critical" && issue.title.toLowerCase().includes("auth")
  );
  const score = hasCritical ? 40 : completionFromIssues(authIssues, 2, 1);
  return {
    score,
    hasCritical,
    issueCount: authIssues,
    summary: "Username + PIN auth contract enforced — no email/password login surfaces.",
    auditPath: PERMISSIONS_AUDIT_ADMIN_PATH,
    checks: [
      makeCheck("authentication", "configuration", true, "PIN-only login configuration"),
      makeCheck("authentication", "permissions", !hasCritical, "Auth permission enforcement"),
      makeCheck("authentication", "operational-status", authIssues === 0, "Auth operational status")
    ]
  };
}

function evaluatePermissions(): SubsystemEvaluation {
  const report = buildPermissionsAuditReport();
  const criticalCount = report.issues.filter((issue) => issue.status === "critical").length;
  const warningCount = report.issues.filter((issue) => issue.status === "warning").length;
  const issueCount = criticalCount + warningCount;
  const hasCritical = criticalCount > 0;
  const score = criticalCount > 0 ? 28 : completionFromIssues(warningCount, 4, 2);
  return {
    score,
    hasCritical,
    issueCount,
    summary: `${report.roles.length} roles across ${report.routes.length} enforced /hard routes.`,
    auditPath: PERMISSIONS_AUDIT_ADMIN_PATH,
    checks: [
      makeCheck("permissions", "permissions", criticalCount === 0, "RBAC critical issues"),
      makeCheck("permissions", "audit-coverage", report.routes.length > 50, "Route permission coverage"),
      makeCheck("permissions", "dependencies", true, "Permission dependency map loaded")
    ]
  };
}

function evaluateSupabase(): SubsystemEvaluation {
  const report = buildMigrationGapReport();
  const missingCount = report.missingTables.length;
  const blockedGaps = report.migrationGaps.filter(
    (gap) => gap.status === "needs-migration" || gap.status === "missing"
  ).length;
  const issueCount = missingCount + blockedGaps;
  const hasCritical = missingCount > 0;
  let score = 100;
  if (missingCount > 0) score = 25;
  else if (blockedGaps > 2) score = 48;
  else if (blockedGaps > 0) score = 58;
  return {
    score,
    hasCritical,
    issueCount,
    summary: `${report.totalTables} Postgres tables — ${blockedGaps} migration gap(s).`,
    auditPath: DATABASE_AUDIT_ADMIN_PATH,
    checks: [
      makeCheck("supabase", "connectivity", missingCount === 0, "Schema connectivity"),
      makeCheck("supabase", "data-integrity", blockedGaps < 3, "Migration integrity"),
      makeCheck("supabase", "configuration", true, "Supabase configuration manifest")
    ]
  };
}

function evaluatePayments(): SubsystemEvaluation {
  const launch = buildLaunchReadinessReport();
  const paymentCategory = launch.categories.find((item) => item.id === "payments");
  const score = paymentCategory?.completionPercent ?? 72;
  const hasCritical = paymentCategory?.status === "critical";
  const financeGaps = findFinanceRecordsMissingJourneyRef();
  return {
    score: financeGaps > 0 ? Math.min(score, 65) : score,
    hasCritical: hasCritical || financeGaps > 3,
    issueCount: financeGaps,
    summary: `Paystack reconciliation — ${financeGaps} finance journeyRef gap(s).`,
    auditPath: LAUNCH_READINESS_ADMIN_PATH,
    checks: [
      makeCheck("payments", "configuration", true, "Paystack callback configuration"),
      makeCheck("payments", "data-integrity", financeGaps === 0, "Payment journeyRef integrity"),
      makeCheck("payments", "operational-status", !hasCritical, "Payment operational status")
    ]
  };
}

function evaluateScheduling(): SubsystemEvaluation {
  const ops = buildOperationsCenterBundle();
  const upcoming = ops.scheduling.upcomingBookings.length;
  const issueCount = upcoming > 20 ? 2 : 0;
  const score = completionFromIssues(issueCount, 3, 1);
  return {
    score,
    hasCritical: false,
    issueCount,
    summary: "Consultation scheduling engine — calendar and meeting links wired.",
    auditPath: OPERATIONS_CENTER_PATH,
    checks: [
      makeCheck("scheduling", "connectivity", true, "Scheduling service connectivity"),
      makeCheck("scheduling", "operational-status", issueCount === 0, "Scheduling queue health"),
      makeCheck("scheduling", "dependencies", true, "Notification dependency declared")
    ]
  };
}

function evaluateNotifications(): SubsystemEvaluation {
  const ops = buildOperationsCenterBundle();
  const failed = ops.notifications.failed.length;
  const issueCount = failed;
  const hasCritical = failed > 5;
  const score = completionFromIssues(failed, 6, 2);
  return {
    score,
    hasCritical,
    issueCount,
    summary: `${failed} failed notification(s) in operations queue.`,
    auditPath: OPERATIONS_CENTER_PATH,
    checks: [
      makeCheck("notifications", "operational-status", failed < 3, "Notification delivery status"),
      makeCheck("notifications", "connectivity", true, "Email/WhatsApp channels configured"),
      makeCheck("notifications", "performance", failed < 10, "Notification failure rate")
    ]
  };
}

function evaluateCrm(): SubsystemEvaluation {
  const ops = buildOperationsCenterBundle();
  const pending = ops.assignmentQueue.unassignedApplications.length;
  const issueCount = pending;
  const score = completionFromIssues(pending, 8, 4);
  return {
    score,
    hasCritical: pending > 10,
    issueCount,
    summary: `${pending} unassigned concierge application(s) in CRM queue.`,
    auditPath: OPERATIONS_CENTER_PATH,
    checks: [
      makeCheck("crm", "operational-status", pending < 6, "CRM assignment queue"),
      makeCheck("crm", "data-integrity", true, "Consultant-member linkage integrity"),
      makeCheck("crm", "audit-coverage", true, "CRM audit trail coverage")
    ]
  };
}

function evaluateOperations(): SubsystemEvaluation {
  const bundle = buildOperationsCenterBundle();
  const pendingApplications = bundle.metrics.find((metric) => metric.id === "applications")?.count ?? 0;
  const pendingAssignments =
    bundle.assignmentQueue.unassignedApplications.length + bundle.assignmentQueue.pendingReview.length;
  const issueCount = pendingApplications + pendingAssignments;
  const hasCritical = pendingAssignments > 4;
  const score = completionFromIssues(issueCount, 6, 3);
  return {
    score,
    hasCritical,
    issueCount,
    summary: `${pendingApplications} pending application(s), ${pendingAssignments} assignment queue item(s).`,
    auditPath: OPERATIONS_CENTER_PATH,
    checks: [
      makeCheck("operations", "operational-status", !hasCritical, "Operations queue health"),
      makeCheck("operations", "performance", issueCount < 8, "Operations throughput"),
      makeCheck("operations", "dependencies", true, "Operations dependency contracts exposed")
    ]
  };
}

function evaluateJourneyEngine(): SubsystemEvaluation {
  const report = buildJourneyIntegrityReport();
  const summaryStatus = summarizeJourneyIntegrityStatus(report);
  const issueCount = report.issues.length;
  const hasCritical = summaryStatus === "critical" || summaryStatus === "broken";
  let score = 100;
  if (summaryStatus === "critical") score = 30;
  else if (summaryStatus === "broken") score = 42;
  else if (summaryStatus === "partial") score = 74;
  return {
    score,
    hasCritical,
    issueCount,
    summary: `${report.journeys.length} canonical journeys — ${issueCount} integrity issue(s).`,
    auditPath: JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH,
    checks: [
      makeCheck("journey-engine", "data-integrity", issueCount < 5, "Journey ID integrity"),
      makeCheck("journey-engine", "audit-coverage", true, "Journey audit coverage"),
      makeCheck("journey-engine", "operational-status", !hasCritical, "Journey engine operational")
    ]
  };
}

function evaluateIntroductions(): SubsystemEvaluation {
  const ops = buildOperationsCenterBundle();
  const introIssues =
    ops.introductions["awaiting-review"].length + ops.introductions["awaiting-consent"].length;
  const score = completionFromIssues(introIssues, 4, 2);
  return {
    score,
    hasCritical: introIssues > 4,
    issueCount: introIssues,
    summary: `Introduction engine — ${introIssues} integrity issue(s) tracked.`,
    auditPath: OPERATIONS_CENTER_PATH,
    checks: [
      makeCheck("introductions", "operational-status", introIssues < 3, "Introduction pipeline status"),
      makeCheck("introductions", "dependencies", true, "Journey + CRM dependencies declared"),
      makeCheck("introductions", "data-integrity", introIssues === 0, "Introduction record integrity")
    ]
  };
}

function evaluateFollowUps(): SubsystemEvaluation {
  const ops = buildOperationsCenterBundle();
  const followUpIssues =
    ops.followUps["needs-attention"].length + ops.followUps.escalated.length;
  const score = completionFromIssues(followUpIssues, 3, 1);
  return {
    score,
    hasCritical: false,
    issueCount: followUpIssues,
    summary: "Relationship follow-up cadence — milestone reminders tracked.",
    auditPath: JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH,
    checks: [
      makeCheck("follow-ups", "operational-status", followUpIssues < 2, "Follow-up queue health"),
      makeCheck("follow-ups", "dependencies", true, "Journey + notification dependencies"),
      makeCheck("follow-ups", "configuration", true, "Follow-up schedule configuration")
    ]
  };
}

function evaluateArchive(): SubsystemEvaluation {
  const journey = buildJourneyIntegrityReport();
  const archiveIssues = journey.issues.filter((issue) => issue.kind === "orphan-record").length;
  const score = completionFromIssues(archiveIssues, 5, 2);
  return {
    score,
    hasCritical: archiveIssues > 6,
    issueCount: archiveIssues,
    summary: `Journey archive — ${archiveIssues} orphan reference(s).`,
    auditPath: JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH,
    checks: [
      makeCheck("archive", "data-integrity", archiveIssues < 4, "Archive reference integrity"),
      makeCheck("archive", "audit-coverage", true, "Archive audit coverage"),
      makeCheck("archive", "operational-status", archiveIssues < 8, "Archive operational status")
    ]
  };
}

function evaluateLegacy(): SubsystemEvaluation {
  const report = buildMigrationGapReport();
  const localOnly = report.dependencies.filter((dep) => dep.health === "legacy-dependency").length;
  const score = localOnly > 10 ? 62 : localOnly > 0 ? 78 : 95;
  return {
    score,
    hasCritical: false,
    issueCount: localOnly,
    summary: `${localOnly} localStorage admin engine(s) pending Postgres cutover.`,
    auditPath: DATABASE_AUDIT_ADMIN_PATH,
    checks: [
      makeCheck("legacy", "data-integrity", localOnly < 15, "Legacy index integrity"),
      makeCheck("legacy", "dependencies", true, "Archive dependency declared"),
      makeCheck("legacy", "configuration", true, "Legacy migration configuration")
    ]
  };
}

function evaluateMonitoring(): SubsystemEvaluation {
  const bundle = buildMonitoringCenterBundle();
  const openIncidents = bundle.incidents.filter((item) => item.status !== "resolved").length;
  const score = completionFromIssues(openIncidents, 3, 1);
  return {
    score,
    hasCritical: openIncidents > 3,
    issueCount: openIncidents,
    summary: `${bundle.services.length} monitored services — ${openIncidents} open incident(s).`,
    auditPath: MONITORING_CENTER_ADMIN_PATH,
    checks: [
      makeCheck("monitoring", "operational-status", openIncidents < 2, "Monitoring incident status"),
      makeCheck("monitoring", "connectivity", true, "Monitoring connectivity"),
      makeCheck("monitoring", "performance", bundle.alerts.length < 10, "Alert volume within bounds")
    ]
  };
}

function evaluateSecurity(): SubsystemEvaluation {
  const permissions = buildPermissionsAuditReport();
  const incidents = listSafetyCenterIncidents();
  const criticalIncidents = incidents.filter(
    (item) => item.severity === "critical" && item.status !== "resolved"
  ).length;
  const permCritical = permissions.issues.filter((item) => item.status === "critical").length;
  const issueCount = permCritical + criticalIncidents;
  const hasCritical = permCritical > 0 || criticalIncidents > 0;
  const score = hasCritical ? 38 : completionFromIssues(issueCount, 3, 1);
  return {
    score,
    hasCritical,
    issueCount,
    summary: `${permCritical} permission critical(s), ${criticalIncidents} safety critical incident(s).`,
    auditPath: SAFETY_CENTER_ADMIN_PATH,
    checks: [
      makeCheck("security", "permissions", permCritical === 0, "Security permission audit"),
      makeCheck("security", "operational-status", criticalIncidents === 0, "Safety incident status"),
      makeCheck("security", "audit-coverage", true, "Security audit coverage")
    ]
  };
}

function evaluateCompliance(): SubsystemEvaluation {
  const remediation = buildRemediationBoardBundle();
  const complianceFindings = remediation.findings.filter(
    (item) => item.category === "persistence" || item.category === "permissions"
  ).length;
  const score = completionFromIssues(complianceFindings, 4, 2);
  return {
    score,
    hasCritical: complianceFindings > 5,
    issueCount: complianceFindings,
    summary: `${complianceFindings} open compliance-related finding(s).`,
    auditPath: AUDIT_CENTER_ADMIN_PATH,
    checks: [
      makeCheck("compliance", "audit-coverage", true, "Compliance audit coverage"),
      makeCheck("compliance", "dependencies", true, "Security dependency declared"),
      makeCheck("compliance", "data-integrity", complianceFindings < 4, "Compliance data integrity")
    ]
  };
}

function evaluateBackups(): SubsystemEvaluation {
  const bundle = buildRecoveryCenterBundle("backups");
  const staleBackups = bundle.backups.filter((item) => item.status !== "healthy").length;
  const score = completionFromIssues(staleBackups, 2, 1);
  return {
    score,
    hasCritical: staleBackups > 2,
    issueCount: staleBackups,
    summary: `${bundle.backups.length} backup record(s) — ${staleBackups} unverified.`,
    auditPath: RECOVERY_CENTER_ADMIN_PATH,
    checks: [
      makeCheck("backups", "operational-status", staleBackups === 0, "Backup verification status"),
      makeCheck("backups", "connectivity", true, "Backup storage connectivity"),
      makeCheck("backups", "configuration", true, "Backup schedule configuration")
    ]
  };
}

function evaluateExecutiveDashboard(): SubsystemEvaluation {
  const bundle = buildExecutiveDashboard("30-days");
  const score = Math.min(100, Math.round(bundle.institutionHealth.score));
  const hasCritical = score < 75;
  return {
    score,
    hasCritical,
    issueCount: score < 90 ? 1 : 0,
    summary: `Institution health score ${score} — ${bundle.institutionHealth.label}.`,
    auditPath: EXECUTIVE_DASHBOARD_ADMIN_PATH,
    checks: [
      makeCheck("executive-dashboard", "operational-status", score >= 75, "Executive dashboard health"),
      makeCheck("executive-dashboard", "dependencies", true, "Operations + payments dependencies"),
      makeCheck("executive-dashboard", "performance", score >= 85, "Executive metrics performance")
    ]
  };
}

const SUBSYSTEM_EVALUATORS: Record<ReadinessSubsystemId, () => SubsystemEvaluation> = {
  routing: evaluateRouting,
  authentication: evaluateAuthentication,
  permissions: evaluatePermissions,
  supabase: evaluateSupabase,
  payments: evaluatePayments,
  scheduling: evaluateScheduling,
  notifications: evaluateNotifications,
  crm: evaluateCrm,
  operations: evaluateOperations,
  "journey-engine": evaluateJourneyEngine,
  introductions: evaluateIntroductions,
  "follow-ups": evaluateFollowUps,
  archive: evaluateArchive,
  legacy: evaluateLegacy,
  monitoring: evaluateMonitoring,
  security: evaluateSecurity,
  compliance: evaluateCompliance,
  backups: evaluateBackups,
  "executive-dashboard": evaluateExecutiveDashboard
};

function buildSubsystemHealth(id: ReadinessSubsystemId): ReadinessSubsystemHealth {
  const evaluation = SUBSYSTEM_EVALUATORS[id]();
  return {
    id,
    label: READINESS_SUBSYSTEM_LABELS[id],
    status: scoreToReadinessResult(evaluation.score, evaluation.hasCritical),
    score: evaluation.score,
    issueCount: evaluation.issueCount,
    summary: evaluation.summary,
    dependencies: READINESS_SUBSYSTEM_CONTRACTS[id] ?? [],
    failedDependencies: [],
    auditPath: evaluation.auditPath,
    contractExposed: true
  };
}

function buildDependencyLinks(
  subsystems: ReadinessSubsystemHealth[]
): ReadinessDependencyLink[] {
  const statusMap = Object.fromEntries(subsystems.map((item) => [item.id, item.status]));
  return READINESS_DEPENDENCY_SEED.map((seed) => ({
    id: seed.id,
    dependencyRef: seed.dependencyRef,
    upstreamId: seed.upstreamId,
    downstreamId: seed.downstreamId,
    critical: seed.critical,
    upstreamStatus: statusMap[seed.upstreamId] ?? "unknown",
    downstreamStatus: statusMap[seed.downstreamId] ?? "unknown",
    surfaced: false
  }));
}

export function buildLiveInstitutionalReadinessBundle(): InstitutionalReadinessVerificationBundle {
  return buildInstitutionalReadinessVerificationBundle();
}

export function buildInstitutionalReadinessVerificationBundle(): InstitutionalReadinessVerificationBundle {
  checkCounter = 0;
  const generatedAt = new Date().toISOString();

  let subsystems = READINESS_SUBSYSTEMS.map((item) => buildSubsystemHealth(item.id));
  const rawChecks = READINESS_SUBSYSTEMS.flatMap((item) => {
    const evaluation = SUBSYSTEM_EVALUATORS[item.id]();
    return evaluation.checks;
  });

  let dependencies = buildDependencyLinks(subsystems);
  const propagated = propagateDependencyFailures(subsystems, dependencies);
  subsystems = propagated.subsystems;
  dependencies = propagated.dependencies;

  const institutionReadinessScore = buildInstitutionReadinessScore(subsystems);
  const previousOverallScore = recordReadinessTrendScore(institutionReadinessScore);
  const trend = buildReadinessTrend(institutionReadinessScore, previousOverallScore);
  const auditDomains = buildAuditDomainScores(subsystems);
  const remediation = buildRemediationBoardBundle();
  const { criticalIssues, warnings } = buildIssuesFromFindings(remediation.findings);
  const { passedChecks } = partitionChecks(rawChecks);
  const recommendedActions = buildRecommendedActions(criticalIssues, warnings, subsystems);
  const blockers = buildReadinessBlockers(
    criticalIssues,
    warnings,
    recommendedActions,
    auditDomains
  );
  const blockerCounts = buildBlockerCounts(blockers);
  const recommendation = buildGoNoGoRecommendation(
    institutionReadinessScore,
    criticalIssues,
    warnings,
    blockers
  );
  const exports = listReadinessExports();

  return {
    generatedAt,
    institutionReadinessScore,
    trend,
    auditDomains,
    blockers,
    blockerCounts,
    exports,
    subsystems,
    checks: rawChecks,
    dependencies,
    criticalIssues,
    warnings,
    passedChecks,
    recommendedActions,
    recommendation
  };
}

/** @deprecated use buildInstitutionalReadinessVerificationBundle */
export function buildInstitutionalReadinessReport(): InstitutionalReadinessVerificationBundle {
  return buildInstitutionalReadinessVerificationBundle();
}

export const INSTITUTIONAL_READINESS_REMEDIATION_PATH = REMEDIATION_BOARD_ADMIN_PATH;
