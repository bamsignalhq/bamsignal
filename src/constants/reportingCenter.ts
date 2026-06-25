/** Institutional Reporting Center™ — operational dashboards and institutional knowledge preservation. */

import { REPORTING_CENTER_ADMIN_BRAND } from "./reportingCenterAdmin";

export const REPORTING_CENTER_BRAND = REPORTING_CENTER_ADMIN_BRAND;

export const REPORT_CATEGORIES = [
  { id: "executive", label: "Executive Reports" },
  { id: "operations", label: "Operations Reports" },
  { id: "consultant", label: "Consultant Reports" },
  { id: "journey", label: "Journey Reports" },
  { id: "community", label: "Community Reports" },
  { id: "research", label: "Research Reports" },
  { id: "financial", label: "Financial Reports" },
  { id: "support", label: "Support Reports" },
  { id: "compliance", label: "Compliance Reports" }
] as const;

export type ReportCategoryId = (typeof REPORT_CATEGORIES)[number]["id"];

export const REPORT_CATEGORY_LABELS: Record<ReportCategoryId, string> =
  Object.fromEntries(REPORT_CATEGORIES.map((item) => [item.id, item.label])) as Record<
    ReportCategoryId,
    string
  >;

export const REPORT_EXPORT_FORMATS = [
  { id: "pdf", label: "PDF" },
  { id: "excel", label: "Excel" },
  { id: "csv", label: "CSV" },
  { id: "print", label: "Print" }
] as const;

export type ReportExportFormatId = (typeof REPORT_EXPORT_FORMATS)[number]["id"];

export const REPORT_EXPORT_FORMAT_LABELS: Record<ReportExportFormatId, string> =
  Object.fromEntries(REPORT_EXPORT_FORMATS.map((item) => [item.id, item.label])) as Record<
    ReportExportFormatId,
    string
  >;

export const REPORT_FILTERS = [
  { id: "date", label: "Date" },
  { id: "consultant", label: "Consultant" },
  { id: "journey", label: "Journey" },
  { id: "region", label: "Region" },
  { id: "community", label: "Community" },
  { id: "status", label: "Status" },
  { id: "tier", label: "Tier" }
] as const;

export type ReportFilterId = (typeof REPORT_FILTERS)[number]["id"];

export const REPORT_FILTER_LABELS: Record<ReportFilterId, string> =
  Object.fromEntries(REPORT_FILTERS.map((item) => [item.id, item.label])) as Record<
    ReportFilterId,
    string
  >;

export const REPORT_SCHEDULE_FREQUENCIES = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "annual", label: "Annual" }
] as const;

export type ReportScheduleFrequencyId = (typeof REPORT_SCHEDULE_FREQUENCIES)[number]["id"];

export const REPORT_SCHEDULE_FREQUENCY_LABELS: Record<ReportScheduleFrequencyId, string> =
  Object.fromEntries(REPORT_SCHEDULE_FREQUENCIES.map((item) => [item.id, item.label])) as Record<
    ReportScheduleFrequencyId,
    string
  >;

export const REPORT_STATUSES = ["published", "draft", "archived"] as const;
export type ReportStatusId = (typeof REPORT_STATUSES)[number];

export const REPORTING_CENTER_DB_TABLES = [
  "reporting_catalog_entries",
  "reporting_schedules",
  "reporting_export_history",
  "reporting_filter_presets",
  "reporting_run_history",
  "reporting_snapshots"
] as const;

export const REPORTING_AUDIT_ACTIONS = [
  "report-generated",
  "report-exported",
  "schedule-created",
  "schedule-updated",
  "snapshot-archived"
] as const;

export type ReportingAuditActionId = (typeof REPORTING_AUDIT_ACTIONS)[number];

/** Future-ready — documented only, not implemented. */
export const REPORTING_FUTURE_ARCHITECTURE = [
  { id: "board-reports", label: "Board Reports" },
  { id: "ai-narrative-summaries", label: "AI Narrative Summaries" },
  { id: "forecast-reports", label: "Forecast Reports" },
  { id: "benchmark-reports", label: "Benchmark Reports" }
] as const;
