export const JOURNEY_ANALYTICS_BRAND = "Journey Analytics™";
export const JOURNEY_ANALYTICS_TAGLINE =
  "Relationship intelligence across every Signal Concierge journey — human-first, never sales.";

export const JOURNEY_ANALYTICS_METRICS = [
  { id: "applications", label: "Applications" },
  { id: "consultations", label: "Consultations" },
  { id: "approvals", label: "Approvals" },
  { id: "introductions", label: "Introductions" },
  { id: "relationships", label: "Relationships" },
  { id: "exclusive", label: "Exclusive" },
  { id: "engagements", label: "Engagements" },
  { id: "marriages", label: "Marriages" },
  { id: "legacyFamilies", label: "Legacy Families" }
] as const;

export type JourneyAnalyticsMetricId = (typeof JOURNEY_ANALYTICS_METRICS)[number]["id"];

export const JOURNEY_ANALYTICS_METRIC_LABELS: Record<JourneyAnalyticsMetricId, string> =
  Object.fromEntries(JOURNEY_ANALYTICS_METRICS.map((metric) => [metric.id, metric.label])) as Record<
    JourneyAnalyticsMetricId,
    string
  >;

export const JOURNEY_ANALYTICS_METRIC_HINTS: Record<JourneyAnalyticsMetricId, string> = {
  applications: "Members who began their journey",
  consultations: "Consultations completed with care",
  approvals: "Applications welcomed into the program",
  introductions: "Thoughtful introductions made",
  relationships: "Relationships that took root",
  exclusive: "Couples choosing exclusivity",
  engagements: "Engagements celebrated",
  marriages: "Marriages formed through the journey",
  legacyFamilies: "Families registered in the legacy index"
};

/** Documented future modules — not implemented in this release. */
export const JOURNEY_ANALYTICS_FUTURE_MODULES = [
  {
    id: "regional-analytics",
    label: "Regional Analytics",
    description: "City and diaspora corridor insights without leaderboards."
  },
  {
    id: "ai-summaries",
    label: "AI Summaries",
    description: "Narrative briefings for consultants — opt-in only."
  },
  {
    id: "global-communities",
    label: "Global Communities",
    description: "Cross-community journey patterns and celebrations."
  }
] as const;

export const JOURNEY_ANALYTICS_FORBIDDEN_TERMS = [
  "revenue",
  "sales",
  "conversion rate",
  "lead value",
  "top seller",
  "pipeline value"
] as const;
