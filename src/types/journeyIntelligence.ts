import type { JourneyIntelligenceMetricId } from "../constants/journeyIntelligence";
import type { JourneyAnalyticsGrowthSignal, JourneyAnalyticsTrendPoint } from "./journeyAnalytics";

export type JourneyIntelligenceMetric = {
  id: JourneyIntelligenceMetricId;
  label: string;
  count: number;
  hint: string;
};

export type JourneyIntelligenceConsultantInsight = {
  id: string;
  name: string;
  consultations: number;
  introductions: number;
  relationships: number;
  engagements: number;
  marriages: number;
  legacyFamilies: number;
  narrative: string;
};

export type JourneyIntelligenceRegionalRow = {
  id: string;
  label: string;
  count: number;
  hint?: string;
};

export type JourneyIntelligenceRegionalInsights = {
  cities: JourneyIntelligenceRegionalRow[];
  countries: JourneyIntelligenceRegionalRow[];
  diasporaCorridors: JourneyIntelligenceRegionalRow[];
  legacyCities: JourneyIntelligenceRegionalRow[];
};

export type JourneyIntelligenceLegacyGrowthSignal = {
  id: string;
  label: string;
  recent: number;
  prior: number;
  direction: "up" | "steady" | "down";
  narrative: string;
};

export type JourneyIntelligenceBundle = {
  metrics: JourneyIntelligenceMetric[];
  consultants: JourneyIntelligenceConsultantInsight[];
  regional: JourneyIntelligenceRegionalInsights;
  trends: JourneyAnalyticsTrendPoint[];
  legacyGrowth: JourneyIntelligenceLegacyGrowthSignal[];
  updatedAt: string;
};

/** Reserved — not implemented. */
export type JourneyIntelligenceFutureCapability =
  | "predictive-insights"
  | "ai-recommendations"
  | "relationship-observatory"
  | "house-institute-integration";

export type JourneyIntelligenceFutureConfig = {
  capability?: JourneyIntelligenceFutureCapability;
  enabled?: boolean;
};
