import { EXECUTIVE_DASHBOARD_ADMIN_PATH } from "../constants/executiveDashboardAdmin";
import { AUDIT_CENTER_ADMIN_PATH } from "../constants/auditCenterAdmin";
import { DATABASE_AUDIT_ADMIN_PATH } from "../constants/databaseAudit";
import { DOCUMENT_CENTER_ADMIN_PATH } from "../constants/documentCenterAdmin";
import { JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH } from "../constants/journeyIntegrityAudit";
import { PERMISSIONS_AUDIT_ADMIN_PATH } from "../constants/permissionsAudit";
import { ROUTE_AUDIT_ADMIN_PATH } from "../constants/routeAudit";
import { SAFETY_CENTER_ADMIN_PATH } from "../constants/safetyCenterAdmin";
import { SUPPORT_CENTER_ADMIN_PATH } from "../constants/supportCenterAdmin";
import {
  LAUNCH_READINESS_AREA_LABELS,
  LAUNCH_READINESS_AREAS,
  type LaunchReadinessAreaId,
  type LaunchReadinessStatusId
} from "../constants/launchReadiness";
import { hardPathForTab } from "../constants/hardRoutes";
import {
  CONCIERGE_ADMIN_DASHBOARD_PATH,
  OPERATIONS_CENTER_PATH
} from "../constants/operationsCenter";
import type {
  LaunchChecklistItem,
  LaunchCriticalIssue,
  LaunchReadinessCategory,
  LaunchReadinessMetric,
  LaunchReadinessReport,
  ReadinessTimelineEntry
} from "../types/launchReadiness";
import { ACADEMY_MODULE_COUNT } from "../constants/consultantAcademy";
import { buildAssignmentEngineSnapshot } from "./consultantAssignmentEngine";
import { buildConsultantAcademyBundle } from "./consultantAcademyEngine";
import { countCompletedModules } from "./consultantAcademyLogic";
import { buildDocumentCenterBundle } from "./documentCenterEngine";
import { buildExecutiveDashboard } from "./executiveDashboardEngine";
import { buildFinanceOperationsBundle } from "./financeOperationsEngine";
import { findFinanceRecordsMissingJourneyRef } from "./journeyIntegrityAudit";
import { buildJourneyIntegrityReport, summarizeJourneyIntegrityStatus } from "./journeyIntegrityReport";
import { buildMigrationGapReport } from "./migrationGapReport";
import { buildNotificationOperationsBundle } from "./notificationOperationsEngine";
import { buildOperationsCenterBundle } from "./OperationsCenterEngine";
import { buildPermissionsAuditReport } from "./securityAuditReport";
import { buildRouteHealthReport } from "./routeHealthReport";
import { buildSafetyCenterBundle } from "./safetyCenterEngine";
import { buildSupportCenterBundle } from "./supportCenterEngine";

function statusRank(status: LaunchReadinessStatusId): number {
  if (status === "critical") return 4;
  if (status === "blocked") return 3;
  if (status === "needs-review") return 2;
  return 1;
}

function worstStatus(statuses: LaunchReadinessStatusId[]): LaunchReadinessStatusId {
  return statuses.reduce(
    (worst, status) => (statusRank(status) > statusRank(worst) ? status : worst),
    "ready" as LaunchReadinessStatusId
  );
}

function completionForStatus(status: LaunchReadinessStatusId): number {
  if (status === "ready") return 100;
  if (status === "needs-review") return 72;
  if (status === "blocked") return 38;
  return 12;
}

function mapJourneyStatus(
  status: ReturnType<typeof summarizeJourneyIntegrityStatus>
): LaunchReadinessStatusId {
  if (status === "critical") return "critical";
  if (status === "broken") return "blocked";
  if (status === "partial") return "needs-review";
  return "ready";
}

function evaluateRoutes(): LaunchReadinessCategory {
  const report = buildRouteHealthReport();
  const orphanCount = report.orphans.length;
  const duplicateCount = report.duplicates.length;
  const redirectCount = report.redirectRecommendations.filter((item) => item.priority === "high").length;
  const issueCount = orphanCount + duplicateCount + redirectCount;

  let status: LaunchReadinessStatusId = "ready";
  if (duplicateCount > 0) status = "blocked";
  else if (orphanCount > 4 || redirectCount > 2) status = "critical";
  else if (orphanCount > 0 || redirectCount > 0) status = "needs-review";

  return {
    id: "routes",
    label: LAUNCH_READINESS_AREA_LABELS.routes,
    status,
    summary:
      issueCount === 0
        ? "Route inventory healthy — no blocking orphans or duplicates."
        : `${orphanCount} orphan(s), ${duplicateCount} duplicate(s), ${redirectCount} high-priority redirect recommendation(s).`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: ROUTE_AUDIT_ADMIN_PATH
  };
}

function evaluateDatabase(): LaunchReadinessCategory {
  const report = buildMigrationGapReport();
  const missingCount = report.missingTables.length;
  const blockedGaps = report.migrationGaps.filter(
    (gap) => gap.status === "needs-migration" || gap.status === "missing"
  ).length;
  const reviewGaps = report.migrationGaps.filter(
    (gap) => gap.status === "partial" || gap.status === "legacy-dependency"
  ).length;
  const issueCount = missingCount + blockedGaps + reviewGaps;

  let status: LaunchReadinessStatusId = "ready";
  if (missingCount > 0) status = "critical";
  else if (blockedGaps > 0) status = "blocked";
  else if (reviewGaps > 0) status = "needs-review";

  return {
    id: "database",
    label: LAUNCH_READINESS_AREA_LABELS.database,
    status,
    summary:
      issueCount === 0
        ? "Postgres baseline aligned — no blocking migration gaps."
        : `${missingCount} missing table(s), ${blockedGaps} blocked gap(s), ${reviewGaps} review gap(s).`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: DATABASE_AUDIT_ADMIN_PATH
  };
}

function evaluatePermissions(): LaunchReadinessCategory {
  const report = buildPermissionsAuditReport();
  const criticalCount = report.issues.filter((issue) => issue.status === "critical").length;
  const warningCount = report.issues.filter((issue) => issue.status === "warning").length;
  const issueCount = criticalCount + warningCount;

  let status: LaunchReadinessStatusId = "ready";
  if (criticalCount > 0) status = "critical";
  else if (warningCount > 2) status = "blocked";
  else if (warningCount > 0) status = "needs-review";

  return {
    id: "permissions",
    label: LAUNCH_READINESS_AREA_LABELS.permissions,
    status,
    summary:
      issueCount === 0
        ? "Permission matrix secure — no escalation or overlap issues."
        : `${criticalCount} critical and ${warningCount} warning permission issue(s).`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: PERMISSIONS_AUDIT_ADMIN_PATH
  };
}

function evaluateJourneyIntegrity(): LaunchReadinessCategory {
  const report = buildJourneyIntegrityReport();
  const status = mapJourneyStatus(summarizeJourneyIntegrityStatus(report));
  const issueCount = report.issues.length;

  return {
    id: "journey-integrity",
    label: LAUNCH_READINESS_AREA_LABELS["journey-integrity"],
    status,
    summary:
      issueCount === 0
        ? "Journey ID backbone aligned across all institutional systems."
        : `${issueCount} journey integrity issue(s) across registry and dependencies.`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH
  };
}

function evaluatePayments(): LaunchReadinessCategory {
  const operations = buildOperationsCenterBundle();
  const failedCount = operations.payments.failed?.length ?? 0;
  const pendingCount = operations.payments.pending?.length ?? 0;
  const issueCount = failedCount + pendingCount;

  let status: LaunchReadinessStatusId = "ready";
  if (failedCount > 0) status = "critical";
  else if (pendingCount > 3) status = "blocked";
  else if (pendingCount > 0) status = "needs-review";

  return {
    id: "payments",
    label: LAUNCH_READINESS_AREA_LABELS.payments,
    status,
    summary:
      issueCount === 0
        ? "Consultation payments verified — no failed or stuck transactions."
        : `${failedCount} failed and ${pendingCount} pending payment(s).`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: OPERATIONS_CENTER_PATH
  };
}

function evaluateScheduling(): LaunchReadinessCategory {
  const operations = buildOperationsCenterBundle();
  const noShowCount = operations.consultations["no-show"]?.length ?? 0;
  const unconfirmedCount = operations.consultations.upcoming?.length ?? 0;
  const issueCount = noShowCount + unconfirmedCount;

  let status: LaunchReadinessStatusId = "ready";
  if (noShowCount > 2) status = "critical";
  else if (noShowCount > 0) status = "blocked";
  else if (unconfirmedCount > 6) status = "needs-review";

  return {
    id: "scheduling",
    label: LAUNCH_READINESS_AREA_LABELS.scheduling,
    status,
    summary:
      issueCount === 0
        ? "Consultation scheduling queue clear — no overdue bookings."
        : `${noShowCount} no-show and ${unconfirmedCount} upcoming consultation(s).`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: OPERATIONS_CENTER_PATH
  };
}

function evaluateNotifications(): LaunchReadinessCategory {
  const bundle = buildNotificationOperationsBundle();
  const failedCount = bundle.failed.length;
  const queueCount = bundle.queue.length;
  const issueCount = failedCount + (queueCount > 8 ? queueCount - 8 : 0);

  let status: LaunchReadinessStatusId = "ready";
  if (failedCount > 0) status = "critical";
  else if (queueCount > 12) status = "blocked";
  else if (queueCount > 4) status = "needs-review";

  return {
    id: "notifications",
    label: LAUNCH_READINESS_AREA_LABELS.notifications,
    status,
    summary:
      issueCount === 0
        ? "Notification delivery healthy — queue and history aligned."
        : `${failedCount} failed delivery record(s), ${queueCount} active queue item(s).`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: OPERATIONS_CENTER_PATH
  };
}

function evaluateConsultants(): LaunchReadinessCategory {
  const snapshot = buildAssignmentEngineSnapshot();
  const unassignedCount = snapshot.unassignedCount;
  const overloaded = snapshot.workloads.filter(
    (profile) => profile.health === "full" || profile.capacityLevel === "limited-capacity"
  ).length;
  const issueCount = unassignedCount + overloaded;

  let status: LaunchReadinessStatusId = "ready";
  if (unassignedCount > 4) status = "critical";
  else if (unassignedCount > 1) status = "blocked";
  else if (unassignedCount > 0 || overloaded > 0) status = "needs-review";

  return {
    id: "consultants",
    label: LAUNCH_READINESS_AREA_LABELS.consultants,
    status,
    summary:
      issueCount === 0
        ? "Consultant assignment coverage healthy — workloads balanced."
        : `${unassignedCount} unassigned journey(s), ${overloaded} high-load consultant(s).`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: CONCIERGE_ADMIN_DASHBOARD_PATH
  };
}

function evaluateSupport(): LaunchReadinessCategory {
  const bundle = buildSupportCenterBundle();
  const escalatedMetric = bundle.metrics.find((metric) => metric.id === "escalations");
  const openMetric = bundle.metrics.find((metric) => metric.id === "open-tickets");
  const escalatedCount = escalatedMetric?.numericValue ?? Number(escalatedMetric?.value ?? 0);
  const openCount = openMetric?.numericValue ?? Number(openMetric?.value ?? 0);
  const issueCount = escalatedCount + Math.max(openCount - 5, 0);

  let status: LaunchReadinessStatusId = "ready";
  if (escalatedCount > 2) status = "critical";
  else if (escalatedCount > 0) status = "blocked";
  else if (openCount > 5) status = "needs-review";

  return {
    id: "support",
    label: LAUNCH_READINESS_AREA_LABELS.support,
    status,
    summary:
      issueCount === 0
        ? "Support center queue stable — no escalations blocking launch."
        : `${openCount} open ticket(s), ${escalatedCount} escalated.`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: SUPPORT_CENTER_ADMIN_PATH
  };
}

function evaluateSafety(): LaunchReadinessCategory {
  const bundle = buildSafetyCenterBundle();
  const openIncidents = bundle.queue;
  const criticalCount = openIncidents.filter((incident) => incident.severity === "critical").length;
  const issueCount = openIncidents.length;

  let status: LaunchReadinessStatusId = "ready";
  if (criticalCount > 0) status = "critical";
  else if (openIncidents.length > 2) status = "blocked";
  else if (openIncidents.length > 0) status = "needs-review";

  return {
    id: "safety",
    label: LAUNCH_READINESS_AREA_LABELS.safety,
    status,
    summary:
      issueCount === 0
        ? "Safety center clear — no open incidents blocking launch."
        : `${openIncidents.length} open incident(s), ${criticalCount} critical.`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: SAFETY_CENTER_ADMIN_PATH
  };
}

function evaluateFinance(): LaunchReadinessCategory {
  const bundle = buildFinanceOperationsBundle();
  const failedPayments = Number(
    bundle.metrics.find((metric) => metric.id === "failed-payments")?.value ?? 0
  );
  const missingJourneyRefs = findFinanceRecordsMissingJourneyRef();
  const issueCount = failedPayments + missingJourneyRefs;

  let status: LaunchReadinessStatusId = "ready";
  if (failedPayments > 0) status = "critical";
  else if (missingJourneyRefs > 2) status = "blocked";
  else if (missingJourneyRefs > 0) status = "needs-review";

  return {
    id: "finance",
    label: LAUNCH_READINESS_AREA_LABELS.finance,
    status,
    summary:
      issueCount === 0
        ? "Finance operations reconciled — journey refs and payment integrity intact."
        : `${failedPayments} failed payment(s), ${missingJourneyRefs} record(s) missing journeyRef.`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: hardPathForTab("finance")
  };
}

function evaluateDocuments(): LaunchReadinessCategory {
  const bundle = buildDocumentCenterBundle();
  const documentCount = bundle.documents.length;
  const categoryCount = Object.keys(bundle.categoryCounts).length;
  const issueCount = Math.max(3 - categoryCount, 0);

  let status: LaunchReadinessStatusId = "ready";
  if (documentCount === 0) status = "critical";
  else if (categoryCount < 2) status = "blocked";
  else if (categoryCount < 4) status = "needs-review";

  return {
    id: "documents",
    label: LAUNCH_READINESS_AREA_LABELS.documents,
    status,
    summary:
      issueCount === 0
        ? "Document center populated across institutional categories."
        : `${documentCount} document(s) across ${categoryCount} categor(ies).`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: DOCUMENT_CENTER_ADMIN_PATH
  };
}

function evaluateAcademy(): LaunchReadinessCategory {
  const bundle = buildConsultantAcademyBundle();
  const behindCount = bundle.consultants.filter((consultant) => {
    const completed = countCompletedModules(consultant);
    return completed / ACADEMY_MODULE_COUNT < 0.8;
  }).length;
  const issueCount = behindCount;

  let status: LaunchReadinessStatusId = "ready";
  if (behindCount > 4) status = "critical";
  else if (behindCount > 2) status = "blocked";
  else if (behindCount > 0) status = "needs-review";

  return {
    id: "academy",
    label: LAUNCH_READINESS_AREA_LABELS.academy,
    status,
    summary:
      issueCount === 0
        ? "Consultant academy tracks on pace for launch readiness."
        : `${behindCount} consultant(s) below 80% academy completion.`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: hardPathForTab("academy")
  };
}

function evaluateOperations(): LaunchReadinessCategory {
  const bundle = buildOperationsCenterBundle();
  const pendingApplications = bundle.metrics.find((metric) => metric.id === "applications")?.count ?? 0;
  const pendingAssignments =
    bundle.assignmentQueue.unassignedApplications.length + bundle.assignmentQueue.pendingReview.length;
  const issueCount = pendingApplications + pendingAssignments;

  let status: LaunchReadinessStatusId = "ready";
  if (pendingAssignments > 4) status = "critical";
  else if (pendingAssignments > 1 || pendingApplications > 8) status = "blocked";
  else if (pendingAssignments > 0 || pendingApplications > 3) status = "needs-review";

  return {
    id: "operations",
    label: LAUNCH_READINESS_AREA_LABELS.operations,
    status,
    summary:
      issueCount === 0
        ? "Operations center queues within launch thresholds."
        : `${pendingApplications} pending application(s), ${pendingAssignments} assignment queue item(s).`,
    completionPercent: completionForStatus(status),
    issueCount,
    auditPath: OPERATIONS_CENTER_PATH
  };
}

function evaluateExecutive(): LaunchReadinessCategory {
  const bundle = buildExecutiveDashboard("30-days");
  const score = bundle.institutionHealth.score;
  const issueCount = score < 90 ? 1 : 0;

  let status: LaunchReadinessStatusId = "ready";
  if (score < 75) status = "critical";
  else if (score < 82) status = "blocked";
  else if (score < 90) status = "needs-review";

  return {
    id: "executive",
    label: LAUNCH_READINESS_AREA_LABELS.executive,
    status,
    summary: `Institution health score ${score} — ${bundle.institutionHealth.label}.`,
    completionPercent: Math.min(100, Math.round(score)),
    issueCount,
    auditPath: EXECUTIVE_DASHBOARD_ADMIN_PATH
  };
}

const CATEGORY_EVALUATORS: Record<LaunchReadinessAreaId, () => LaunchReadinessCategory> = {
  routes: evaluateRoutes,
  database: evaluateDatabase,
  permissions: evaluatePermissions,
  "journey-integrity": evaluateJourneyIntegrity,
  payments: evaluatePayments,
  scheduling: evaluateScheduling,
  notifications: evaluateNotifications,
  consultants: evaluateConsultants,
  support: evaluateSupport,
  safety: evaluateSafety,
  finance: evaluateFinance,
  documents: evaluateDocuments,
  academy: evaluateAcademy,
  operations: evaluateOperations,
  executive: evaluateExecutive
};

function buildCriticalIssues(categories: LaunchReadinessCategory[]): LaunchCriticalIssue[] {
  return categories
    .filter((category) => category.status === "critical" || category.status === "blocked")
    .map((category) => ({
      id: `critical-${category.id}`,
      areaId: category.id,
      title: `${category.label} — ${category.status === "critical" ? "Critical" : "Blocked"}`,
      summary: category.summary,
      status: category.status
    }));
}

function buildChecklist(categories: LaunchReadinessCategory[]): LaunchChecklistItem[] {
  return LAUNCH_READINESS_AREAS.map((area) => {
    const category = categories.find((item) => item.id === area.id)!;
    return {
      id: `check-${area.id}`,
      label: `${area.label} readiness verified`,
      areaId: area.id,
      complete: category.status === "ready",
      status: category.status
    };
  });
}

function buildTimeline(categories: LaunchReadinessCategory[], generatedAt: string): ReadinessTimelineEntry[] {
  const baseTime = Date.parse(generatedAt);
  return categories.map((category, index) => ({
    id: `timeline-${category.id}`,
    at: new Date(baseTime - (categories.length - index) * 60_000).toISOString(),
    label: `${category.label} assessed`,
    areaId: category.id,
    status: category.status,
    note: category.summary
  }));
}

function buildMetrics(categories: LaunchReadinessCategory[]): LaunchReadinessMetric[] {
  const readySystems = categories.filter((category) => category.status === "ready").length;
  const warnings = categories.filter((category) => category.status === "needs-review").length;
  const blockedSystems = categories.filter((category) => category.status === "blocked").length;
  const criticalIssues = categories.filter(
    (category) => category.status === "critical" || category.status === "blocked"
  ).length;
  const completionPercent = Math.round(
    categories.reduce((sum, category) => sum + category.completionPercent, 0) / categories.length
  );

  return [
    { id: "completion-percent", label: "Completion %", value: completionPercent },
    { id: "critical-issues", label: "Critical issues", value: criticalIssues },
    { id: "warnings", label: "Warnings", value: warnings },
    { id: "blocked-systems", label: "Blocked systems", value: blockedSystems },
    { id: "ready-systems", label: "Ready systems", value: readySystems }
  ];
}

export function buildLaunchReadinessReport(): LaunchReadinessReport {
  const generatedAt = new Date().toISOString();
  const categories = LAUNCH_READINESS_AREAS.map((area) => CATEGORY_EVALUATORS[area.id]());
  const overallStatus = worstStatus(categories.map((category) => category.status));
  const criticalIssues = buildCriticalIssues(categories);
  const checklist = buildChecklist(categories);
  const timeline = buildTimeline(categories, generatedAt);
  const metrics = buildMetrics(categories);

  return {
    generatedAt,
    overallStatus,
    metrics,
    categories,
    criticalIssues,
    checklist,
    timeline
  };
}

export function summarizeLaunchReadinessStatus(
  report: LaunchReadinessReport
): LaunchReadinessStatusId {
  return report.overallStatus;
}

/** Read-only audit reference — compliance hub for cross-system audit trail. */
export const LAUNCH_READINESS_COMPLIANCE_PATH = AUDIT_CENTER_ADMIN_PATH;
