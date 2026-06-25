import type {
  ReportCatalogEntry,
  ReportExportRecord,
  ReportFilterPreset,
  ReportRunRecord,
  ReportScheduleRecord
} from "../types/reportingCenter";
import { REPORT_CATEGORIES } from "../constants/reportingCenter";

const NOW = "2026-06-25T16:00:00.000Z";

const REPORT_TITLES: Record<string, { title: string; description: string; formats: ReportCatalogEntry["supportedFormats"]; filters: ReportCatalogEntry["activeFilters"] }> = {
  executive: {
    title: "Executive Dashboard Summary",
    description: "Institutional health, growth, and go/no-go readiness for leadership.",
    formats: ["pdf", "excel"],
    filters: ["date", "region", "tier"]
  },
  operations: {
    title: "Operations Center Daily Brief",
    description: "Assignments, queue depth, SLA breaches, and workflow automation coverage.",
    formats: ["pdf", "csv", "print"],
    filters: ["date", "consultant", "status"]
  },
  consultant: {
    title: "Consultant Performance Scorecard",
    description: "Journey outcomes, satisfaction, capacity, and quality metrics by consultant.",
    formats: ["pdf", "excel", "csv"],
    filters: ["date", "consultant", "tier"]
  },
  journey: {
    title: "Journey Pipeline & Milestones",
    description: "Active journeys, milestone progression, archives, and follow-up cadence.",
    formats: ["pdf", "csv"],
    filters: ["date", "journey", "status", "consultant"]
  },
  community: {
    title: "Community Growth & Engagement",
    description: "City communities, events attendance, and corridor activity.",
    formats: ["pdf", "excel"],
    filters: ["date", "community", "region"]
  },
  research: {
    title: "Relationship Index Quarterly",
    description: "Institute research metrics, corridor analysis, and publication readiness.",
    formats: ["pdf", "excel"],
    filters: ["date", "region"]
  },
  financial: {
    title: "Revenue & Reconciliation",
    description: "Consultation revenue, refunds, payouts, and Paystack reconciliation.",
    formats: ["pdf", "excel", "csv"],
    filters: ["date", "tier"]
  },
  support: {
    title: "Support Ticket & SLA Report",
    description: "Ticket volume, first-response SLA, resolution time, and escalation trends.",
    formats: ["pdf", "csv", "print"],
    filters: ["date", "status", "tier"]
  },
  compliance: {
    title: "Compliance & Audit Trail",
    description: "Permission changes, data governance actions, and institutional audit exports.",
    formats: ["pdf", "csv"],
    filters: ["date", "status"]
  }
};

export const REPORT_CATALOG_SEED: ReportCatalogEntry[] = REPORT_CATEGORIES.map((cat, index) => {
  const meta = REPORT_TITLES[cat.id];
  return {
    id: `rpt_${index + 1}`,
    reportRef: `RPT-${cat.id.toUpperCase().replace(/-/g, "_")}`,
    categoryId: cat.id,
    title: meta.title,
    description: meta.description,
    status: index === 6 ? "draft" : "published",
    lastGeneratedAt: index % 2 === 0 ? NOW : "2026-06-24T08:00:00.000Z",
    ownerEmail: cat.id === "executive" ? "founder@bamsignal.com" : "ops@bamsignal.com",
    supportedFormats: meta.formats,
    activeFilters: meta.filters
  };
});

export const REPORT_SCHEDULE_SEED: ReportScheduleRecord[] = [
  {
    id: "sch_001",
    scheduleRef: "SCH-DAILY-OPS",
    reportId: "rpt_2",
    reportTitle: "Operations Center Daily Brief",
    frequency: "daily",
    format: "pdf",
    recipients: ["ops@bamsignal.com"],
    nextRunAt: "2026-06-26T06:00:00.000Z",
    enabled: true
  },
  {
    id: "sch_002",
    scheduleRef: "SCH-WEEKLY-CONSULTANT",
    reportId: "rpt_3",
    reportTitle: "Consultant Performance Scorecard",
    frequency: "weekly",
    format: "excel",
    recipients: ["ops@bamsignal.com", "founder@bamsignal.com"],
    nextRunAt: "2026-06-30T07:00:00.000Z",
    enabled: true
  },
  {
    id: "sch_003",
    scheduleRef: "SCH-MONTHLY-FINANCE",
    reportId: "rpt_7",
    reportTitle: "Revenue & Reconciliation",
    frequency: "monthly",
    format: "excel",
    recipients: ["finance@bamsignal.com"],
    nextRunAt: "2026-07-01T08:00:00.000Z",
    enabled: true
  },
  {
    id: "sch_004",
    scheduleRef: "SCH-QUARTERLY-RESEARCH",
    reportId: "rpt_6",
    reportTitle: "Relationship Index Quarterly",
    frequency: "quarterly",
    format: "pdf",
    recipients: ["research@bamsignal.com", "founder@bamsignal.com"],
    nextRunAt: "2026-07-01T09:00:00.000Z",
    enabled: true
  },
  {
    id: "sch_005",
    scheduleRef: "SCH-ANNUAL-EXEC",
    reportId: "rpt_1",
    reportTitle: "Executive Dashboard Summary",
    frequency: "annual",
    format: "pdf",
    recipients: ["founder@bamsignal.com"],
    nextRunAt: "2027-01-01T10:00:00.000Z",
    enabled: true
  }
];

export const REPORT_EXPORT_SEED: ReportExportRecord[] = [
  {
    id: "exp_001",
    exportRef: "EXP-2026-06-25-0012",
    reportTitle: "Operations Center Daily Brief",
    categoryId: "operations",
    format: "pdf",
    exportedBy: "ops@bamsignal.com",
    exportedAt: "2026-06-25T06:05:00.000Z",
    fileSizeKb: 420
  },
  {
    id: "exp_002",
    exportRef: "EXP-2026-06-24-0098",
    reportTitle: "Consultant Performance Scorecard",
    categoryId: "consultant",
    format: "excel",
    exportedBy: "ops@bamsignal.com",
    exportedAt: "2026-06-24T07:12:00.000Z",
    fileSizeKb: 890
  },
  {
    id: "exp_003",
    exportRef: "EXP-2026-06-23-0087",
    reportTitle: "Journey Pipeline & Milestones",
    categoryId: "journey",
    format: "csv",
    exportedBy: "ops@bamsignal.com",
    exportedAt: "2026-06-23T14:30:00.000Z",
    fileSizeKb: 156
  },
  {
    id: "exp_004",
    exportRef: "EXP-2026-06-22-0076",
    reportTitle: "Compliance & Audit Trail",
    categoryId: "compliance",
    format: "csv",
    exportedBy: "governance@bamsignal.com",
    exportedAt: "2026-06-22T11:00:00.000Z",
    fileSizeKb: 240
  }
];

export const REPORT_FILTER_PRESET_SEED: ReportFilterPreset[] = [
  {
    id: "fp_001",
    presetRef: "FP-NIGERIA-Q2",
    label: "Nigeria Q2 2026",
    categoryId: "executive",
    filters: { date: "2026-Q2", region: "nigeria", tier: "all" }
  },
  {
    id: "fp_002",
    presetRef: "FP-ACTIVE-JOURNEYS",
    label: "Active journeys — Lagos",
    categoryId: "journey",
    filters: { status: "active", community: "lagos", consultant: "all" }
  },
  {
    id: "fp_003",
    presetRef: "FP-TIER1-CONSULTANTS",
    label: "Tier 1 consultants",
    categoryId: "consultant",
    filters: { tier: "tier-1", date: "last-30-days" }
  }
];

export const REPORT_RUN_HISTORY_SEED: ReportRunRecord[] = [
  {
    id: "run_001",
    runRef: "RUN-2026-06-25-0012",
    reportId: "rpt_2",
    reportTitle: "Operations Center Daily Brief",
    categoryId: "operations",
    generatedBy: "scheduler",
    generatedAt: "2026-06-25T06:00:00.000Z",
    rowCount: 184,
    preserved: true
  },
  {
    id: "run_002",
    runRef: "RUN-2026-06-24-0098",
    reportId: "rpt_3",
    reportTitle: "Consultant Performance Scorecard",
    categoryId: "consultant",
    generatedBy: "ops@bamsignal.com",
    generatedAt: "2026-06-24T07:00:00.000Z",
    rowCount: 42,
    preserved: true
  },
  {
    id: "run_003",
    runRef: "RUN-2026-06-23-0087",
    reportId: "rpt_4",
    reportTitle: "Journey Pipeline & Milestones",
    categoryId: "journey",
    generatedBy: "ops@bamsignal.com",
    generatedAt: "2026-06-23T14:00:00.000Z",
    rowCount: 310,
    preserved: true
  },
  {
    id: "run_004",
    runRef: "RUN-2026-06-22-0076",
    reportId: "rpt_9",
    reportTitle: "Compliance & Audit Trail",
    categoryId: "compliance",
    generatedBy: "governance@bamsignal.com",
    generatedAt: "2026-06-22T10:30:00.000Z",
    rowCount: 1200,
    preserved: true
  }
];
