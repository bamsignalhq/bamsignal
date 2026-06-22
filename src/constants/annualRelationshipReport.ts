/** Annual Relationship Report™ — yearly relationship publications architecture. */

import {
  AFRICAN_RELATIONSHIP_CULTURE_LABEL,
  INSIGHTS_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "./bamSignalInstitute";

export const ANNUAL_RELATIONSHIP_REPORT_TITLE = "Annual Relationship Report™";
export const ANNUAL_RELATIONSHIP_REPORT_SUBCOPY =
  "Insights — BamSignal's yearly relationship publications prepared with dignity.";
export const ANNUAL_RELATIONSHIP_REPORT_LABEL = "Annual Relationship Report";

export const ANNUAL_RELATIONSHIP_REPORT_PURPOSE_COPY =
  "Prepare BamSignal's yearly relationship publications — understanding first, never user analytics.";
export const ANNUAL_RELATIONSHIP_REPORT_RESERVED_COPY =
  "Architecture prepared. PDF publications, research books, public reports, and press releases are not enabled yet.";
export const ANNUAL_RELATIONSHIP_REPORT_STATIC_COPY =
  "Publication preview — no PDF generation yet.";

/** Reserved — never use in member-facing copy. */
export const ANNUAL_RELATIONSHIP_REPORT_AVOID_COPY = ["Statistics", "Analytics", "User Report"] as const;

export { AFRICAN_RELATIONSHIP_CULTURE_LABEL, INSIGHTS_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedAnnualReportId =
  | "african-relationship-report-2027"
  | "nigerian-dating-trends"
  | "diaspora-marriage-trends"
  | "faith-family"
  | "communication-trends"
  | "marriage-timeline"
  | "relationship-intentions";

export type AnnualReportCategoryId =
  | "culture"
  | "trends"
  | "diaspora"
  | "faith-family"
  | "communication"
  | "marriage"
  | "intentions";

export type AnnualReportCategoryDefinition = {
  id: AnnualReportCategoryId;
  label: string;
  description: string;
};

export const ANNUAL_REPORT_CATEGORIES: AnnualReportCategoryDefinition[] = [
  {
    id: "culture",
    label: AFRICAN_RELATIONSHIP_CULTURE_LABEL,
    description: "African relationship culture — dignity-first insights."
  },
  {
    id: "trends",
    label: "Relationship trends",
    description: "Trends observed with care — never popularity scoring."
  },
  {
    id: "diaspora",
    label: "Diaspora insights",
    description: "Diaspora marriage and family pathways."
  },
  {
    id: "faith-family",
    label: "Faith & family",
    description: "Faith and family — respectful research framing."
  },
  {
    id: "communication",
    label: "Communication",
    description: "Communication patterns — insights without surveillance."
  },
  {
    id: "marriage",
    label: "Marriage journey",
    description: "Marriage timelines — human-first understanding."
  },
  {
    id: "intentions",
    label: "Relationship intentions",
    description: "Intentions and commitment — never funnel analytics."
  }
];

export type PreparedAnnualReportDefinition = {
  id: PreparedAnnualReportId;
  title: string;
  description: string;
  categoryId: AnnualReportCategoryId;
  publicationYear: number;
};

export const PREPARED_ANNUAL_REPORTS: PreparedAnnualReportDefinition[] = [
  {
    id: "african-relationship-report-2027",
    title: "African Relationship Report 2027",
    description: "Flagship annual report — African Relationship Culture with dignity.",
    categoryId: "culture",
    publicationYear: 2027
  },
  {
    id: "nigerian-dating-trends",
    title: "Nigerian Dating Trends Report",
    description: "Nigerian dating trends — insights, not statistics dashboards.",
    categoryId: "trends",
    publicationYear: 2027
  },
  {
    id: "diaspora-marriage-trends",
    title: "Diaspora Marriage Trends Report",
    description: "Diaspora marriage trends across corridors — Journey Across Borders.",
    categoryId: "diaspora",
    publicationYear: 2027
  },
  {
    id: "faith-family",
    title: "Faith & Family Report",
    description: "Faith and family — respectful yearly insights.",
    categoryId: "faith-family",
    publicationYear: 2027
  },
  {
    id: "communication-trends",
    title: "Communication Trends Report",
    description: "Communication trends — understanding relationships with care.",
    categoryId: "communication",
    publicationYear: 2027
  },
  {
    id: "marriage-timeline",
    title: "Marriage Timeline Report",
    description: "Marriage timeline insights — milestones without user reports.",
    categoryId: "marriage",
    publicationYear: 2027
  },
  {
    id: "relationship-intentions",
    title: "Relationship Intentions Report",
    description: "Relationship intentions — human-first annual insights.",
    categoryId: "intentions",
    publicationYear: 2027
  }
];

export type AnnualReportTimelineEntry = {
  id: string;
  reportId: PreparedAnnualReportId;
  label: string;
  recordedAt: string;
  note?: string;
};

export type AnnualReportFutureCapabilityId =
  | "pdf-publications"
  | "research-books"
  | "public-reports"
  | "press-releases";

export const ANNUAL_REPORT_FUTURE_CAPABILITIES: {
  id: AnnualReportFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "pdf-publications",
    label: "PDF publications",
    description: "Reserved — PDF annual relationship publications."
  },
  {
    id: "research-books",
    label: "Research books",
    description: "Reserved — research books from annual insights."
  },
  {
    id: "public-reports",
    label: "Public reports",
    description: "Reserved — public reports with consent and dignity."
  },
  {
    id: "press-releases",
    label: "Press releases",
    description: "Reserved — press releases — never user analytics."
  }
];

export function getAnnualReportCategory(
  categoryId: AnnualReportCategoryId
): AnnualReportCategoryDefinition | undefined {
  return ANNUAL_REPORT_CATEGORIES.find((category) => category.id === categoryId);
}
