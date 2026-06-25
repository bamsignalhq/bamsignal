/**
 * Institutional Reporting Center™ — server-side reporting logic.
 */

export const REPORTING_CENTER_DB_TABLES = [
  "reporting_catalog_entries",
  "reporting_schedules",
  "reporting_export_history",
  "reporting_filter_presets",
  "reporting_run_history",
  "reporting_snapshots"
];

export function getReportingCenterDatabaseTableManifest() {
  return REPORTING_CENTER_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "reporting",
    migrationRef: "0019_reporting_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function canAccessReportingCenter(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("ViewExecutiveDashboard") ||
    permissions.includes("ManageExecutiveReports") ||
    permissions.includes("ExportReports") ||
    permissions.includes("SystemAdministration")
  );
}

export function buildReportingSummary(reports, schedules, exports, runHistory) {
  const publishedReports = reports.filter((item) => item.status === "published").length;
  const scheduledReports = schedules.filter((item) => item.enabled).length;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const exportsLast30d = exports.filter(
    (item) => new Date(item.exportedAt).getTime() >= thirtyDaysAgo
  ).length;
  const preservedRuns = runHistory.filter((item) => item.preserved).length;
  const categoriesCovered = new Set(reports.map((item) => item.categoryId)).size;

  return {
    totalReports: reports.length,
    publishedReports,
    scheduledReports,
    exportsLast30d,
    preservedRuns,
    categoriesCovered
  };
}

export function filterReportsByCategory(reports, categoryId) {
  if (!categoryId || categoryId === "all") return reports;
  return reports.filter((item) => item.categoryId === categoryId);
}

export function listEnabledSchedules(schedules) {
  return schedules.filter((item) => item.enabled);
}

export function validateExportFormat(report, format) {
  return report.supportedFormats?.includes(format) ?? false;
}

export function recordReportExport(exportRecord, actor) {
  if (!exportRecord.reportTitle) {
    throw new Error("Reporting violation: missing report title");
  }
  return {
    ...exportRecord,
    exportedBy: actor,
    exportedAt: new Date().toISOString()
  };
}

export function formatReportingSummaryLine(summary) {
  return `${summary.publishedReports} published · ${summary.scheduledReports} scheduled · ${summary.exportsLast30d} exports/30d · ${summary.preservedRuns} preserved`;
}
