/** House Institute Data Pipeline™ — anonymous aggregate bridge from journey outcomes to research. */

export const HOUSE_INSTITUTE_DATA_PIPELINE_BRAND = "House Institute Data Pipeline™";
export const HOUSE_INSTITUTE_DATA_PIPELINE_TAGLINE =
  "Anonymous aggregates only — bridging Journey Intelligence to institutional research.";

export const HOUSE_PIPELINE_ANONYMITY_RULES = [
  "Aggregate counts only — no member identities.",
  "No names, emails, phone numbers, or Journey IDs.",
  "No consultant notes or private journey notes.",
  "Geographic labels are corridor or city aggregates, never individuals."
] as const;

export const HOUSE_PIPELINE_DATA_SOURCES = [
  { id: "applications", label: "Applications", hint: "Journey applications received" },
  { id: "consultations", label: "Consultations", hint: "Private consultations completed" },
  { id: "introductions", label: "Introductions", hint: "Stewarded introductions created" },
  { id: "relationships", label: "Relationships", hint: "Relationships that took root" },
  { id: "engagements", label: "Engagements", hint: "Engagements celebrated" },
  { id: "marriages", label: "Marriages", hint: "Marriages formed through the journey" },
  { id: "legacy-families", label: "Legacy Families", hint: "Families in the legacy index" },
  { id: "success-stories", label: "Success Stories", hint: "Consent-based success stories" },
  { id: "community-growth", label: "Community Growth", hint: "Active city aggregates" },
  { id: "diaspora-corridors", label: "Diaspora Corridors", hint: "Cross-border corridor aggregates" }
] as const;

export type HousePipelineDataSourceId = (typeof HOUSE_PIPELINE_DATA_SOURCES)[number]["id"];

export const HOUSE_PIPELINE_DATA_SOURCE_LABELS: Record<HousePipelineDataSourceId, string> =
  Object.fromEntries(HOUSE_PIPELINE_DATA_SOURCES.map((source) => [source.id, source.label])) as Record<
    HousePipelineDataSourceId,
    string
  >;

export const HOUSE_PIPELINE_RESEARCH_OUTPUTS = [
  {
    id: "relationship-trends",
    title: "Relationship Trends",
    description: "Formation, exclusivity, and marriage aggregates — never ratings."
  },
  {
    id: "family-trends",
    title: "Family Trends",
    description: "Legacy families and dignified success-story counts."
  },
  {
    id: "diaspora-trends",
    title: "Diaspora Trends",
    description: "Corridor-level movement without personal identifiers."
  },
  {
    id: "community-trends",
    title: "Community Trends",
    description: "City and regional growth aggregates for community research."
  },
  {
    id: "legacy-trends",
    title: "Legacy Trends",
    description: "Longitudinal legacy family and city signals."
  }
] as const;

export type HousePipelineTrendCategoryId = (typeof HOUSE_PIPELINE_RESEARCH_OUTPUTS)[number]["id"];

export const HOUSE_PIPELINE_FUTURE_MODULES = [
  {
    id: "annual-reports",
    label: "Annual reports",
    description: "Yearly House Institute publications — documented, not implemented."
  },
  {
    id: "research-publications",
    label: "Research publications",
    description: "Peer-style research outputs — architecture reserved."
  },
  {
    id: "public-dashboards",
    label: "Public dashboards",
    description: "Public-facing observatory dashboards — not enabled."
  }
] as const;

export const HOUSE_PIPELINE_BRIDGE_COPY =
  "Journey Intelligence outcomes flow into House Institute research as anonymous aggregates — never member identities.";
