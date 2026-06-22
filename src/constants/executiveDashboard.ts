/** Executive Dashboard™ — founder/executive strategic visibility. */

export const EXECUTIVE_DASHBOARD_BRAND = "Executive Dashboard™";

export type ExecutiveViewId = "today" | "30-days" | "90-days" | "12-months" | "lifetime";

export type ExecutiveAreaId =
  | "institution-health"
  | "growth"
  | "journey-outcomes"
  | "consultant-health"
  | "communities"
  | "research"
  | "finance"
  | "legacy";

export type ExecutiveMetricId =
  | "applications"
  | "consultations"
  | "introductions"
  | "relationships"
  | "engagements"
  | "marriages"
  | "legacy-families"
  | "success-stories"
  | "cities"
  | "consultants"
  | "revenue";

export type ExecutiveHealthStatusId = "healthy" | "growing" | "attention" | "strong";

export const EXECUTIVE_VIEWS: {
  id: ExecutiveViewId;
  label: string;
}[] = [
  { id: "today", label: "Today" },
  { id: "30-days", label: "30 days" },
  { id: "90-days", label: "90 days" },
  { id: "12-months", label: "12 months" },
  { id: "lifetime", label: "Lifetime" }
];

export const EXECUTIVE_VIEW_LABELS: Record<ExecutiveViewId, string> = Object.fromEntries(
  EXECUTIVE_VIEWS.map((item) => [item.id, item.label])
) as Record<ExecutiveViewId, string>;

export const EXECUTIVE_AREAS: {
  id: ExecutiveAreaId;
  label: string;
}[] = [
  { id: "institution-health", label: "Institution Health" },
  { id: "growth", label: "Growth" },
  { id: "journey-outcomes", label: "Journey Outcomes" },
  { id: "consultant-health", label: "Consultant Health" },
  { id: "communities", label: "Communities" },
  { id: "research", label: "Research" },
  { id: "finance", label: "Finance" },
  { id: "legacy", label: "Legacy" }
];

export const EXECUTIVE_AREA_LABELS: Record<ExecutiveAreaId, string> = Object.fromEntries(
  EXECUTIVE_AREAS.map((item) => [item.id, item.label.trim()])
) as Record<ExecutiveAreaId, string>;

export const EXECUTIVE_METRICS: {
  id: ExecutiveMetricId;
  label: string;
}[] = [
  { id: "applications", label: "Applications" },
  { id: "consultations", label: "Consultations" },
  { id: "introductions", label: "Introductions" },
  { id: "relationships", label: "Relationships" },
  { id: "engagements", label: "Engagements" },
  { id: "marriages", label: "Marriages" },
  { id: "legacy-families", label: "Legacy Families" },
  { id: "success-stories", label: "Success Stories" },
  { id: "cities", label: "Cities" },
  { id: "consultants", label: "Consultants" },
  { id: "revenue", label: "Revenue" }
];

export const EXECUTIVE_METRIC_LABELS: Record<ExecutiveMetricId, string> = Object.fromEntries(
  EXECUTIVE_METRICS.map((item) => [item.id, item.label])
) as Record<ExecutiveMetricId, string>;

/**
 * Future-ready executive capabilities — documented only, not implemented.
 */
export const EXECUTIVE_DASHBOARD_FUTURE_KINDS = [
  { id: "predictive-forecasting", label: "Predictive forecasting" },
  { id: "strategic-planning", label: "Strategic planning" },
  { id: "board-reporting", label: "Board reporting" }
] as const;
