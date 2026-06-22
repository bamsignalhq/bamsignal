import type {
  ExecutiveAreaId,
  ExecutiveHealthStatusId,
  ExecutiveMetricId,
  ExecutiveViewId
} from "../constants/executiveDashboard";

export type ExecutiveMetric = {
  id: ExecutiveMetricId;
  label: string;
  value: string;
  numericValue?: number;
  trend: string | null;
};

export type ExecutiveAreaInsight = {
  areaId: ExecutiveAreaId;
  title: string;
  summary: string;
  status: ExecutiveHealthStatusId;
};

export type InstitutionHealthSnapshot = {
  score: number;
  label: string;
  highlights: string[];
};

export type GrowthTrendPoint = {
  period: string;
  applications: number;
  consultations: number;
  revenueNgn: number;
};

export type LegacyGrowthSnapshot = {
  legacyFamilies: number;
  successStories: number;
  marriages: number;
  trend: string;
};

export type ResearchInsightSnapshot = {
  title: string;
  summary: string;
  reportRef: string;
};

export type CommunityOverviewSnapshot = {
  activeCities: number;
  corridors: number;
  diasporaReach: string;
};

export type ExecutiveDashboardBundle = {
  generatedAt: string;
  view: ExecutiveViewId;
  metrics: ExecutiveMetric[];
  areas: ExecutiveAreaInsight[];
  institutionHealth: InstitutionHealthSnapshot;
  growthTrend: GrowthTrendPoint[];
  legacyGrowth: LegacyGrowthSnapshot;
  researchInsight: ResearchInsightSnapshot;
  communityOverview: CommunityOverviewSnapshot;
  strategicFocus: string[];
};
