import type {
  PreparedExpertDefinition,
  PreparedInsightArticleDefinition,
  PreparedInterviewDefinition,
  PreparedPodcastDefinition
} from "../constants/bamSignalInsights";
import {
  INSIGHT_CONTENT_PILLARS,
  PREPARED_EXPERTS,
  PREPARED_INSIGHT_ARTICLES,
  PREPARED_INTERVIEWS,
  PREPARED_PODCASTS,
  getInsightArticleCategoryLabel
} from "../constants/bamSignalInsights";

export type InsightArticleViewModel = {
  id: string;
  title: string;
  summary: string;
  categoryLabel: string;
  statusLabel: string;
  recordedAt: string;
};

export type PodcastViewModel = {
  id: string;
  title: string;
  summary: string;
  episodeLabel: string;
  statusLabel: string;
  recordedAt: string;
};

export type InterviewViewModel = {
  id: string;
  title: string;
  summary: string;
  guestLabel: string;
  statusLabel: string;
  recordedAt: string;
};

export type ExpertViewModel = {
  id: string;
  name: string;
  title: string;
  focus: string;
  statusLabel: string;
  recordedAt: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not published yet";

function buildInsightArticleViewModel(article: PreparedInsightArticleDefinition): InsightArticleViewModel {
  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    categoryLabel: getInsightArticleCategoryLabel(article.categoryId),
    statusLabel: ARCHITECTURE_STATUS,
    recordedAt: article.recordedAt
  };
}

function buildPodcastViewModel(podcast: PreparedPodcastDefinition): PodcastViewModel {
  return {
    id: podcast.id,
    title: podcast.title,
    summary: podcast.summary,
    episodeLabel:
      podcast.episodeCount > 0 ? `${podcast.episodeCount} episodes` : "Episodes reserved",
    statusLabel: ARCHITECTURE_STATUS,
    recordedAt: podcast.recordedAt
  };
}

function buildInterviewViewModel(interview: PreparedInterviewDefinition): InterviewViewModel {
  return {
    id: interview.id,
    title: interview.title,
    summary: interview.summary,
    guestLabel: interview.guestLabel,
    statusLabel: ARCHITECTURE_STATUS,
    recordedAt: interview.recordedAt
  };
}

function buildExpertViewModel(expert: PreparedExpertDefinition): ExpertViewModel {
  return {
    id: expert.id,
    name: expert.name,
    title: expert.title,
    focus: expert.focus,
    statusLabel: ARCHITECTURE_STATUS,
    recordedAt: expert.recordedAt
  };
}

function sortByTitle<T extends { title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.title.localeCompare(b.title));
}

function sortExpertsByName(experts: ExpertViewModel[]): ExpertViewModel[] {
  return [...experts].sort((a, b) => a.name.localeCompare(b.name));
}

export function listArchitectureInsightArticles(): InsightArticleViewModel[] {
  return sortByTitle(PREPARED_INSIGHT_ARTICLES.map(buildInsightArticleViewModel));
}

export function listArchitecturePodcasts(): PodcastViewModel[] {
  return sortByTitle(PREPARED_PODCASTS.map(buildPodcastViewModel));
}

export function listArchitectureInterviews(): InterviewViewModel[] {
  return sortByTitle(PREPARED_INTERVIEWS.map(buildInterviewViewModel));
}

export function listArchitectureExperts(): ExpertViewModel[] {
  return sortExpertsByName(PREPARED_EXPERTS.map(buildExpertViewModel));
}

export function listInsightContentPillars() {
  return INSIGHT_CONTENT_PILLARS;
}
