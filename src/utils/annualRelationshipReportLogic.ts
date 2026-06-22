import type {
  AnnualReportTimelineEntry,
  PreparedAnnualReportDefinition,
  PreparedAnnualReportId
} from "../constants/annualRelationshipReport";
import {
  ANNUAL_REPORT_CATEGORIES,
  PREPARED_ANNUAL_REPORTS,
  getAnnualReportCategory
} from "../constants/annualRelationshipReport";

export type AnnualRelationshipReportViewModel = {
  id: PreparedAnnualReportId;
  title: string;
  description: string;
  categoryLabel: string;
  publicationYear: number;
  statusLabel: string;
  timeline: AnnualReportTimelineEntry[];
};

export function buildReportTimeline(report: PreparedAnnualReportDefinition): AnnualReportTimelineEntry[] {
  const base = new Date(`${report.publicationYear - 1}-09-01T00:00:00.000Z`).getTime();
  const steps = [
    { label: "Report architecture prepared", note: "No PDF generation yet." },
    { label: "Research framing defined", note: report.description },
    { label: "Publication pathway reserved", note: "Future-ready — consent first." }
  ];
  return steps.map((step, index) => ({
    id: `arr_timeline_${report.id}_${index}`,
    reportId: report.id,
    label: step.label,
    recordedAt: new Date(base + index * 45 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildAnnualRelationshipReportViewModel(
  report: PreparedAnnualReportDefinition
): AnnualRelationshipReportViewModel {
  const category = getAnnualReportCategory(report.categoryId);
  return {
    id: report.id,
    title: report.title,
    description: report.description,
    categoryLabel: category?.label ?? report.categoryId,
    publicationYear: report.publicationYear,
    statusLabel: "Architecture prepared — not published yet",
    timeline: buildReportTimeline(report)
  };
}

export function sortAnnualReports(
  reports: AnnualRelationshipReportViewModel[]
): AnnualRelationshipReportViewModel[] {
  return [...reports].sort((a, b) => a.title.localeCompare(b.title));
}

export function listArchitectureAnnualReports(): AnnualRelationshipReportViewModel[] {
  return sortAnnualReports(PREPARED_ANNUAL_REPORTS.map(buildAnnualRelationshipReportViewModel));
}

export function listAnnualReportCategories() {
  return ANNUAL_REPORT_CATEGORIES;
}
