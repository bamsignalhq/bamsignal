import { INSIGHT_CONTENT_PILLARS } from "../constants/bamSignalInsights";
import {
  listArchitectureExperts,
  listArchitectureInsightArticles,
  listArchitectureInterviews,
  listArchitecturePodcasts,
  type ExpertViewModel,
  type InsightArticleViewModel,
  type InterviewViewModel,
  type PodcastViewModel
} from "./bamSignalInsightsLogic";

export type BamSignalInsightsBundle = {
  pillars: typeof INSIGHT_CONTENT_PILLARS;
  articles: InsightArticleViewModel[];
  podcasts: PodcastViewModel[];
  interviews: InterviewViewModel[];
  experts: ExpertViewModel[];
};

export function getBamSignalInsightsBundle(): BamSignalInsightsBundle {
  return {
    pillars: INSIGHT_CONTENT_PILLARS,
    articles: listArchitectureInsightArticles(),
    podcasts: listArchitecturePodcasts(),
    interviews: listArchitectureInterviews(),
    experts: listArchitectureExperts()
  };
}
