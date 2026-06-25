import type {
  OptimizationCategoryId,
  PerformanceHealthStatusId,
  PerformanceImpactLevelId,
  PerformanceMetricId,
  PerformanceSectionId
} from "../constants/performanceCenter";

export type PerformanceMetricSnapshot = {
  id: string;
  metricRef: string;
  metricId: PerformanceMetricId;
  sectionId: PerformanceSectionId;
  value: number;
  unit: string;
  status: PerformanceHealthStatusId;
  collectedAt: string;
};

export type PerformanceApiProfile = {
  id: string;
  endpointRef: string;
  path: string;
  method: string;
  avgResponseMs: number;
  p95Ms: number;
  p99Ms: number;
  throughputPerMin: number;
  errorRate: number;
  status: PerformanceHealthStatusId;
};

export type PerformanceDatabaseProfile = {
  id: string;
  profileRef: string;
  name: string;
  queryCount: number;
  slowQueryCount: number;
  indexUsagePercent: number;
  cacheHitPercent: number;
  connectionPoolUsed: number;
  status: PerformanceHealthStatusId;
};

export type PerformanceCapacityPlan = {
  id: string;
  planRef: string;
  domain: string;
  sectionId: PerformanceSectionId;
  currentCapacity: number;
  expectedCapacity: number;
  projectedGrowthPercent: number;
  remainingHeadroomPercent: number;
  recommendation: string;
  status: PerformanceHealthStatusId;
};

export type PerformanceOptimizationItem = {
  id: string;
  itemRef: string;
  categoryId: OptimizationCategoryId;
  sectionId: PerformanceSectionId;
  title: string;
  detail: string;
  impact: PerformanceImpactLevelId;
  status: "open" | "resolved";
  ownerEmail: string;
  openedAt: string;
  resolvedAt?: string;
};

export type PerformanceGrowthForecast = {
  id: string;
  forecastRef: string;
  periodLabel: string;
  memberCount: number;
  concurrentSessions: number;
  apiThroughput: number;
  storageGb: number;
  bandwidthTb: number;
  headroomPercent: number;
  status: PerformanceHealthStatusId;
};

export type PerformanceCenterSummary = {
  healthScore: number;
  healthStatus: PerformanceHealthStatusId;
  avgResponseMs: number;
  p95Ms: number;
  p99Ms: number;
  cacheHitPercent: number;
  workerUtilizationPercent: number;
  remainingHeadroomPercent: number;
  openOptimizations: number;
  highImpactOptimizations: number;
  scalingRecommendation: "scale-now" | "plan-ahead" | "stable";
};

export type PerformanceCenterBundle = {
  generatedAt: string;
  summary: PerformanceCenterSummary;
  metrics: PerformanceMetricSnapshot[];
  apiProfiles: PerformanceApiProfile[];
  databaseProfiles: PerformanceDatabaseProfile[];
  capacityPlans: PerformanceCapacityPlan[];
  optimizationItems: PerformanceOptimizationItem[];
  growthForecasts: PerformanceGrowthForecast[];
  scalingRecommendations: string[];
};

export type PerformanceAreaBundle = PerformanceCenterBundle & {
  sectionId: PerformanceSectionId;
};
