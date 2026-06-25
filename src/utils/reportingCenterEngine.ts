import type { ReportingCenterBundle } from "../types/reportingCenter";
import type { ReportCategoryId } from "../constants/reportingCenter";
import { buildReportingSummary, filterReportsByCategory } from "./reportingCenterLogic";
import {
  listReportCatalog,
  listReportExports,
  listReportFilterPresets,
  listReportRunHistory,
  listReportSchedules
} from "./reportingCenterStore";

export function buildReportingCenterBundle(
  categoryId: ReportCategoryId | "all" = "all"
): ReportingCenterBundle {
  const allReports = listReportCatalog();
  const schedules = listReportSchedules();
  const exports = listReportExports();
  const runHistory = listReportRunHistory();

  return {
    generatedAt: new Date().toISOString(),
    summary: buildReportingSummary(allReports, schedules, exports, runHistory),
    reports: filterReportsByCategory(allReports, categoryId),
    schedules,
    exports,
    filterPresets: listReportFilterPresets(),
    runHistory
  };
}
