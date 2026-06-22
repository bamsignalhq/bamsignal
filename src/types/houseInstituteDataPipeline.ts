import type {
  HousePipelineDataSourceId,
  HousePipelineTrendCategoryId
} from "../constants/houseInstituteDataPipeline";

export type HousePipelineDataSource = {
  id: HousePipelineDataSourceId;
  label: string;
  count: number;
  hint: string;
};

export type HousePipelineTrendRow = {
  id: string;
  label: string;
  count: number;
  hint?: string;
};

export type HousePipelineTrendCategory = {
  id: HousePipelineTrendCategoryId;
  title: string;
  description: string;
  rows: HousePipelineTrendRow[];
  totalCount: number;
};

export type HousePipelineInstitutionInsight = {
  id: string;
  title: string;
  summary: string;
  metricLabel?: string;
  metricCount?: number;
};

export type HousePipelineLegacyResearch = {
  legacyFamilies: number;
  successStories: number;
  marriages: number;
  rows: HousePipelineTrendRow[];
  narrative: string;
};

export type HousePipelineObservatoryFeedItem = {
  id: string;
  categoryId: HousePipelineTrendCategoryId;
  headline: string;
  summary: string;
  count?: number;
  observedAt: string;
};

export type HouseInstituteDataPipelineBundle = {
  dataSources: HousePipelineDataSource[];
  trendCategories: HousePipelineTrendCategory[];
  institutionInsights: HousePipelineInstitutionInsight[];
  legacyResearch: HousePipelineLegacyResearch;
  observatoryFeed: HousePipelineObservatoryFeedItem[];
  bridgeSummary: string;
  updatedAt: string;
};
