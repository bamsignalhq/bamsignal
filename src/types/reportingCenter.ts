import type {
  ReportCategoryId,
  ReportExportFormatId,
  ReportFilterId,
  ReportScheduleFrequencyId,
  ReportStatusId
} from "../constants/reportingCenter";

export type ReportCatalogEntry = {
  id: string;
  reportRef: string;
  categoryId: ReportCategoryId;
  title: string;
  description?: string;
  status: ReportStatusId;
  lastGeneratedAt?: string;
  ownerEmail: string;
  supportedFormats: ReportExportFormatId[];
  activeFilters: ReportFilterId[];
};

export type ReportScheduleRecord = {
  id: string;
  scheduleRef: string;
  reportId: string;
  reportTitle: string;
  frequency: ReportScheduleFrequencyId;
  format: ReportExportFormatId;
  recipients: string[];
  nextRunAt: string;
  enabled: boolean;
};

export type ReportExportRecord = {
  id: string;
  exportRef: string;
  reportTitle: string;
  categoryId: ReportCategoryId;
  format: ReportExportFormatId;
  exportedBy: string;
  exportedAt: string;
  fileSizeKb?: number;
};

export type ReportFilterPreset = {
  id: string;
  presetRef: string;
  label: string;
  filters: Partial<Record<ReportFilterId, string>>;
  categoryId: ReportCategoryId;
};

export type ReportRunRecord = {
  id: string;
  runRef: string;
  reportId: string;
  reportTitle: string;
  categoryId: ReportCategoryId;
  generatedBy: string;
  generatedAt: string;
  rowCount: number;
  preserved: boolean;
};

export type ReportingCenterSummary = {
  totalReports: number;
  publishedReports: number;
  scheduledReports: number;
  exportsLast30d: number;
  preservedRuns: number;
  categoriesCovered: number;
};

export type ReportingCenterBundle = {
  generatedAt: string;
  summary: ReportingCenterSummary;
  reports: ReportCatalogEntry[];
  schedules: ReportScheduleRecord[];
  exports: ReportExportRecord[];
  filterPresets: ReportFilterPreset[];
  runHistory: ReportRunRecord[];
};
