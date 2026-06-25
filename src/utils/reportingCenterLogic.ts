import type {
  ReportCatalogEntry,
  ReportExportRecord,
  ReportRunRecord,
  ReportScheduleRecord,
  ReportingCenterSummary
} from "../types/reportingCenter";
import type { ReportCategoryId, ReportExportFormatId } from "../constants/reportingCenter";

export function buildReportingSummary(
  reports: ReportCatalogEntry[],
  schedules: ReportScheduleRecord[],
  exports: ReportExportRecord[],
  runHistory: ReportRunRecord[]
): ReportingCenterSummary {
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

export function filterReportsByCategory(
  reports: ReportCatalogEntry[],
  categoryId: ReportCategoryId | "all"
) {
  if (categoryId === "all") return reports;
  return reports.filter((item) => item.categoryId === categoryId);
}

export function listEnabledSchedules(schedules: ReportScheduleRecord[]) {
  return schedules.filter((item) => item.enabled);
}

export function validateExportFormat(
  report: ReportCatalogEntry,
  format: ReportExportFormatId
): boolean {
  return report.supportedFormats.includes(format);
}

export function recordReportExport(
  exportRecord: Omit<ReportExportRecord, "exportedBy" | "exportedAt">,
  actor: string
): ReportExportRecord {
  if (!exportRecord.reportTitle) {
    throw new Error("Reporting violation: missing report title");
  }
  return {
    ...exportRecord,
    exportedBy: actor,
    exportedAt: new Date().toISOString()
  };
}

export function formatReportingSummaryLine(summary: ReportingCenterSummary): string {
  return `${summary.publishedReports} published · ${summary.scheduledReports} scheduled · ${summary.exportsLast30d} exports/30d · ${summary.preservedRuns} preserved`;
}
