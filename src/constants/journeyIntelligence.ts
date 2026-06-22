export const JOURNEY_INTELLIGENCE_BRAND = "Journey Intelligence Dashboard™";
export const JOURNEY_INTELLIGENCE_NAV_LABEL = "Journey Intelligence™";
export const JOURNEY_INTELLIGENCE_PATH = "/hard/concierge/intelligence";

export const JOURNEY_INTELLIGENCE_TAGLINE =
  "Executive-level journey insights — human-first, dignified, never sales.";

export const JOURNEY_INTELLIGENCE_METRICS = [
  { id: "applications-received", label: "Applications received" },
  { id: "applications-approved", label: "Applications approved" },
  { id: "consultations-completed", label: "Consultations completed" },
  { id: "introductions-created", label: "Introductions created" },
  { id: "mutual-acceptances", label: "Mutual acceptances" },
  { id: "relationships-formed", label: "Relationships formed" },
  { id: "exclusive-relationships", label: "Exclusive relationships" },
  { id: "engagements", label: "Engagements" },
  { id: "marriages", label: "Marriages" },
  { id: "legacy-families", label: "Legacy Families" },
  { id: "success-stories", label: "Success stories" }
] as const;

export type JourneyIntelligenceMetricId = (typeof JOURNEY_INTELLIGENCE_METRICS)[number]["id"];

export const JOURNEY_INTELLIGENCE_METRIC_LABELS: Record<JourneyIntelligenceMetricId, string> =
  Object.fromEntries(JOURNEY_INTELLIGENCE_METRICS.map((metric) => [metric.id, metric.label])) as Record<
    JourneyIntelligenceMetricId,
    string
  >;

export const JOURNEY_INTELLIGENCE_METRIC_HINTS: Record<JourneyIntelligenceMetricId, string> = {
  "applications-received": "Members who began their concierge journey",
  "applications-approved": "Applications welcomed after human review",
  "consultations-completed": "Private consultations completed with stewards",
  "introductions-created": "Introductions created with intention",
  "mutual-acceptances": "Introductions where both members consented",
  "relationships-formed": "Relationships that took root beyond first conversations",
  "exclusive-relationships": "Couples choosing exclusivity",
  engagements: "Engagements celebrated",
  marriages: "Marriages formed through the journey",
  "legacy-families": "Families registered in the legacy index",
  "success-stories": "Success stories recorded with consent"
};

export const JOURNEY_INTELLIGENCE_CONSULTANT_METRIC_LABELS = {
  consultations: "Consultations",
  introductions: "Introductions",
  relationships: "Relationships",
  engagements: "Engagements",
  marriages: "Marriages",
  legacyFamilies: "Legacy families"
} as const;

export const JOURNEY_INTELLIGENCE_REGIONAL_SECTIONS = [
  { id: "cities", label: "Cities" },
  { id: "countries", label: "Countries" },
  { id: "diaspora-corridors", label: "Diaspora corridors" },
  { id: "legacy-cities", label: "Legacy cities" }
] as const;

export type JourneyIntelligenceRegionalSectionId =
  (typeof JOURNEY_INTELLIGENCE_REGIONAL_SECTIONS)[number]["id"];

/** Documented future capabilities — not implemented. */
export const JOURNEY_INTELLIGENCE_FUTURE_MODULES = [
  {
    id: "predictive-insights",
    label: "Predictive insights",
    description: "Reserved — gentle forecasting for steward planning, never member-facing scores."
  },
  {
    id: "ai-recommendations",
    label: "AI recommendations",
    description: "Reserved — human-reviewed briefing suggestions for executives and stewards."
  },
  {
    id: "relationship-observatory",
    label: "Relationship observatory",
    description: "Reserved — longitudinal relationship health observatory without public leaderboards."
  },
  {
    id: "house-institute-integration",
    label: "House Institute integration",
    description: "Reserved — BamSignal House Institute™ curriculum and fellowship journey signals."
  }
] as const;

export const JOURNEY_INTELLIGENCE_FORBIDDEN_TERMS = [
  "revenue",
  "sales",
  "conversion rate",
  "lead value",
  "top seller",
  "pipeline value",
  "funnel"
] as const;
