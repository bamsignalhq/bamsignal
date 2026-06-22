import type { JourneyAnalyticsMetricId } from "../constants/journeyAnalytics";

export type JourneyAnalyticsMetric = {
  id: JourneyAnalyticsMetricId;
  label: string;
  count: number;
  hint: string;
};

export type JourneyAnalyticsTrendPoint = {
  id: string;
  label: string;
  value: number;
  period: string;
};

export type JourneyAnalyticsOutcome = {
  id: string;
  label: string;
  count: number;
  narrative: string;
};

export type JourneyAnalyticsGrowthSignal = {
  id: string;
  label: string;
  recent: number;
  prior: number;
  direction: "up" | "steady" | "down";
  narrative: string;
};

export type JourneyAnalyticsBundle = {
  metrics: JourneyAnalyticsMetric[];
  trends: JourneyAnalyticsTrendPoint[];
  outcomes: JourneyAnalyticsOutcome[];
  growth: JourneyAnalyticsGrowthSignal[];
  updatedAt: string;
};
