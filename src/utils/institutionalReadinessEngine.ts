import { DATABASE_AUDIT_ADMIN_PATH } from "../constants/databaseAudit";
import { EXECUTIVE_DASHBOARD_ADMIN_PATH } from "../constants/executiveDashboardAdmin";
import { HEALTH_SECTIONS } from "../constants/institutionalReadiness";
import { JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH } from "../constants/journeyIntegrityAudit";
import { LAUNCH_READINESS_ADMIN_PATH } from "../constants/launchReadiness";
import { PERMISSIONS_AUDIT_ADMIN_PATH } from "../constants/permissionsAudit";
import { REMEDIATION_BOARD_ADMIN_PATH } from "../constants/remediationBoardAdmin";
import { ROUTE_AUDIT_ADMIN_PATH } from "../constants/routeAudit";
import { SAFETY_CENTER_ADMIN_PATH } from "../constants/safetyCenterAdmin";
import { OPERATIONS_CENTER_PATH } from "../constants/operationsCenter";
import type { HealthCategory, HealthSectionId, InstitutionalReadinessReport } from "../types/institutionalReadiness";
import { buildExecutiveDashboard } from "./executiveDashboardEngine";
import {
  buildLaunchDecision,
  buildOverallScore,
  buildRiskRegistry,
  scoreToHealthStatus
} from "./institutionalReadinessLogic";
import { buildJourneyIntegrityReport, summarizeJourneyIntegrityStatus } from "./journeyIntegrityReport";
import { buildLaunchReadinessReport } from "./launchReadinessEngine";
import { buildMigrationGapReport } from "./migrationGapReport";
import { buildOperationsCenterBundle } from "./OperationsCenterEngine";
import { buildRemediationBoardBundle } from "./remediationBoardEngine";
import { buildRouteHealthReport } from "./routeHealthReport";
import { buildPermissionsAuditReport } from "./securityAuditReport";
import { listSafetyCenterIncidents } from "./safetyCenterEngine";
import { findFinanceRecordsMissingJourneyRef } from "./journeyIntegrityAudit";

function completionFromIssues(issueCount: number, criticalThreshold: number, reviewThreshold: number): number {
  if (issueCount >= criticalThreshold) return 35;
  if (issueCount >= reviewThreshold) return 68;
  if (issueCount > 0) return 82;
  return 100;
}

function evaluateRouteHealth(): HealthCategory {
  const report = buildRouteHealthReport();
  const orphanCount = report.orphans.length;
  const duplicateCount = report.duplicates.length;
  const redirectCount = report.redirectRecommendations.filter((item) => item.priority === "high").length;
  const issueCount = orphanCount + duplicateCount + redirectCount;
  const hasCritical = duplicateCount > 0 || orphanCount > 4;
  const score = completionFromIssues(issueCount, 5, 2);

  return {
    id: "routes",
    label: "Route Health",
    status: scoreToHealthStatus(score, hasCritical),
    score,
    summary:
      issueCount === 0
        ? "152 routes inventoried — no blocking orphans or duplicates."
        : `${orphanCount} orphan(s), ${duplicateCount} duplicate(s), ${redirectCount} high-priority redirect recommendation(s).`,
    issueCount,
    auditPath: ROUTE_AUDIT_ADMIN_PATH
  };
}

function evaluatePermissionHealth(): HealthCategory {
  const report = buildPermissionsAuditReport();
  const criticalCount = report.issues.filter((issue) => issue.status === "critical").length;
  const warningCount = report.issues.filter((issue) => issue.status === "warning").length;
  const issueCount = criticalCount + warningCount;
  const score = criticalCount > 0 ? 28 : completionFromIssues(warningCount, 4, 2);

  return {
    id: "permissions",
    label: "Permission Health",
    status: scoreToHealthStatus(score, criticalCount > 0),
    score,
    summary:
      criticalCount === 0
        ? `${report.roles.length} roles mapped across ${report.routes.length} enforced /hard routes.`
        : `${criticalCount} critical and ${warningCount} warning issue(s) in RBAC audit.`,
    issueCount,
    auditPath: PERMISSIONS_AUDIT_ADMIN_PATH
  };
}

function evaluateJourneyHealth(): HealthCategory {
  const report = buildJourneyIntegrityReport();
  const summaryStatus = summarizeJourneyIntegrityStatus(report);
  const orphanCount = report.issues.filter((issue) => issue.kind === "orphan-record").length;
  const financeGaps = findFinanceRecordsMissingJourneyRef();
  const issueCount = report.issues.length;
  const hasCritical = summaryStatus === "critical" || summaryStatus === "broken";
  let score = 100;
  if (summaryStatus === "critical") score = 30;
  else if (summaryStatus === "broken") score = 42;
  else if (summaryStatus === "partial") score = 74;
  else if (financeGaps > 0 || orphanCount > 0) score = 88;

  return {
    id: "journey",
    label: "Journey Health",
    status: scoreToHealthStatus(score, hasCritical),
    score,
    summary: `${report.journeys.length} canonical journeys — ${orphanCount} orphan reference(s), ${financeGaps} finance journeyRef gap(s).`,
    issueCount,
    auditPath: JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH
  };
}

function evaluatePersistenceHealth(): HealthCategory {
  const report = buildMigrationGapReport();
  const missingCount = report.missingTables.length;
  const blockedGaps = report.migrationGaps.filter(
    (gap) => gap.status === "needs-migration" || gap.status === "missing"
  ).length;
  const reviewGaps = report.migrationGaps.filter(
    (gap) => gap.status === "partial" || gap.status === "legacy-dependency"
  ).length;
  const localOnly = report.dependencies.filter((dep) => dep.health === "legacy-dependency").length;
  const issueCount = missingCount + blockedGaps + reviewGaps + localOnly;
  const hasCritical = missingCount > 0;
  let score = 100;
  if (missingCount > 0) score = 25;
  else if (blockedGaps > 2) score = 48;
  else if (blockedGaps > 0) score = 58;
  else if (reviewGaps > 4 || localOnly > 10) score = 68;
  else if (reviewGaps > 0 || localOnly > 0) score = 78;

  return {
    id: "persistence",
    label: "Persistence Health",
    status: scoreToHealthStatus(score, hasCritical),
    score,
    summary: `${report.totalTables} Postgres tables verified — ${localOnly} localStorage admin engine(s), ${blockedGaps} migration gap(s).`,
    issueCount,
    auditPath: DATABASE_AUDIT_ADMIN_PATH
  };
}

function evaluateOperationsHealth(): HealthCategory {
  const bundle = buildOperationsCenterBundle();
  const pendingApplications = bundle.metrics.find((metric) => metric.id === "applications")?.count ?? 0;
  const pendingAssignments =
    bundle.assignmentQueue.unassignedApplications.length + bundle.assignmentQueue.pendingReview.length;
  const failedNotifications = bundle.notifications.failed.length;
  const issueCount = pendingApplications + pendingAssignments + failedNotifications;
  const hasCritical = pendingAssignments > 4;
  const score = completionFromIssues(issueCount, 6, 3);

  return {
    id: "operations",
    label: "Operations Health",
    status: scoreToHealthStatus(score, hasCritical),
    score,
    summary: `${pendingApplications} pending application(s), ${pendingAssignments} assignment queue item(s), ${failedNotifications} failed notification(s).`,
    issueCount,
    auditPath: OPERATIONS_CENTER_PATH
  };
}

function evaluateSafetyHealth(): HealthCategory {
  const incidents = listSafetyCenterIncidents();
  const openIncidents = incidents.filter((incident) => incident.status !== "resolved").length;
  const criticalIncidents = incidents.filter(
    (incident) => incident.severity === "critical" && incident.status !== "resolved"
  ).length;
  const issueCount = openIncidents;
  const hasCritical = criticalIncidents > 0;
  const score = criticalIncidents > 0 ? 40 : completionFromIssues(openIncidents, 3, 1);

  return {
    id: "safety",
    label: "Safety Health",
    status: scoreToHealthStatus(score, hasCritical),
    score,
    summary:
      openIncidents === 0
        ? "Safety center operational — incidents tracked in admin layer (localStorage until Postgres cutover)."
        : `${openIncidents} open incident(s), ${criticalIncidents} critical — admin data local-only.`,
    issueCount,
    auditPath: SAFETY_CENTER_ADMIN_PATH
  };
}

function evaluateExecutiveHealth(): HealthCategory {
  const bundle = buildExecutiveDashboard("30-days");
  const score = Math.min(100, Math.round(bundle.institutionHealth.score));
  const hasCritical = score < 75;

  return {
    id: "executive",
    label: "Executive Health",
    status: scoreToHealthStatus(score, hasCritical),
    score,
    summary: `Institution health score ${score} — ${bundle.institutionHealth.label}.`,
    issueCount: score < 90 ? 1 : 0,
    auditPath: EXECUTIVE_DASHBOARD_ADMIN_PATH
  };
}

function evaluateLaunchReadiness(): HealthCategory {
  const report = buildLaunchReadinessReport();
  const completionMetric = report.metrics.find((metric) => metric.id === "completion-percent");
  const score = typeof completionMetric?.value === "number" ? completionMetric.value : 0;
  const criticalCount = report.criticalIssues.length;
  const hasCritical = report.overallStatus === "critical" || criticalCount > 2;

  return {
    id: "launch",
    label: "Launch Readiness",
    status: scoreToHealthStatus(score, hasCritical),
    score,
    summary: `${report.categories.filter((category) => category.status === "ready").length}/${report.categories.length} launch areas ready — overall ${report.overallStatus}.`,
    issueCount: criticalCount,
    auditPath: LAUNCH_READINESS_ADMIN_PATH
  };
}

const SECTION_EVALUATORS: Record<HealthSectionId, () => HealthCategory> = {
  routes: evaluateRouteHealth,
  permissions: evaluatePermissionHealth,
  journey: evaluateJourneyHealth,
  persistence: evaluatePersistenceHealth,
  operations: evaluateOperationsHealth,
  safety: evaluateSafetyHealth,
  executive: evaluateExecutiveHealth,
  launch: evaluateLaunchReadiness
};

export function buildInstitutionalReadinessReport(): InstitutionalReadinessReport {
  const generatedAt = new Date().toISOString();
  const sections = HEALTH_SECTIONS.map((section) => SECTION_EVALUATORS[section.id]());
  const overallScore = buildOverallScore(sections);
  const remediation = buildRemediationBoardBundle();
  const risks = buildRiskRegistry(remediation.findings);
  const decision = buildLaunchDecision(overallScore, risks.criticalBlockers, risks.highRisks);

  return {
    generatedAt,
    overallScore,
    sections,
    ...risks,
    decision
  };
}

/** Cross-link for remediation tracking. */
export const INSTITUTIONAL_READINESS_REMEDIATION_PATH = REMEDIATION_BOARD_ADMIN_PATH;
