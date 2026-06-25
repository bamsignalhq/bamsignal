import type { ReportingAuditActionId } from "../constants/reportingCenter";
import {
  REPORT_CATALOG_SEED,
  REPORT_EXPORT_SEED,
  REPORT_FILTER_PRESET_SEED,
  REPORT_RUN_HISTORY_SEED,
  REPORT_SCHEDULE_SEED
} from "../data/reportingCenterSeed";
import type { ReportExportRecord } from "../types/reportingCenter";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { recordReportExport } from "./reportingCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.reportingCenter.v1";

type ReportingCenterState = {
  reports: typeof REPORT_CATALOG_SEED;
  schedules: typeof REPORT_SCHEDULE_SEED;
  exports: typeof REPORT_EXPORT_SEED;
  filterPresets: typeof REPORT_FILTER_PRESET_SEED;
  runHistory: typeof REPORT_RUN_HISTORY_SEED;
  updatedAt: string;
};

function defaultState(): ReportingCenterState {
  return {
    reports: [...REPORT_CATALOG_SEED],
    schedules: [...REPORT_SCHEDULE_SEED],
    exports: [...REPORT_EXPORT_SEED],
    filterPresets: [...REPORT_FILTER_PRESET_SEED],
    runHistory: [...REPORT_RUN_HISTORY_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): ReportingCenterState {
  const stored = readJson<ReportingCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.reports?.length) return defaultState();
  return { ...defaultState(), ...stored };
}

function saveState(state: ReportingCenterState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logReportingAudit(
  action: ReportingAuditActionId,
  detail: string,
  entityRef: string
): void {
  appendAuditCenterEvent({
    actor: "reporting-center",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listReportCatalog() {
  return loadState().reports;
}

export function listReportSchedules() {
  return loadState().schedules;
}

export function listReportExports() {
  return loadState().exports;
}

export function listReportFilterPresets() {
  return loadState().filterPresets;
}

export function listReportRunHistory() {
  return loadState().runHistory;
}

export function exportReportingCatalog(
  reportId: string,
  format: ReportExportRecord["format"],
  actor: string
): ReportExportRecord | null {
  const state = loadState();
  const report = state.reports.find((item) => item.id === reportId);
  if (!report) return null;
  if (!report.supportedFormats.includes(format)) return null;

  const exportRecord = recordReportExport(
    {
      id: `exp_${Date.now()}`,
      exportRef: `EXP-${Date.now()}`,
      reportTitle: report.title,
      categoryId: report.categoryId,
      format,
      fileSizeKb: format === "csv" ? 120 : 480
    },
    actor
  );

  state.exports = [exportRecord, ...state.exports];
  saveState(state);
  logReportingAudit(
    "report-exported",
    `${report.reportRef} as ${format} by ${actor}`,
    exportRecord.exportRef
  );
  return exportRecord;
}
