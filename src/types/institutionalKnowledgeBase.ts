import type { KnowledgeArticleId, KnowledgeCategoryId } from "../constants/institutionalKnowledgeBase";

export type KnowledgeCategoryCardViewModel = {
  id: KnowledgeCategoryId;
  title: string;
  description: string;
  categoryOrder: number;
  categoryLabel: string;
  articleCount: number;
  statusLabel: string;
};

export type KnowledgeArticleCardViewModel = {
  id: KnowledgeArticleId;
  categoryId: KnowledgeCategoryId;
  categoryTitle: string;
  title: string;
  summary: string;
  articleOrder: number;
  articleLabel: string;
  statusLabel: string;
};

export type KnowledgeTimelineEntryViewModel = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export type InstitutionMemoryCardViewModel = {
  narrative: string;
  purposes: readonly string[];
};

export type InstitutionalKnowledgeBaseBundle = {
  categories: KnowledgeCategoryCardViewModel[];
  articles: KnowledgeArticleCardViewModel[];
  timeline: KnowledgeTimelineEntryViewModel[];
  institutionMemory: InstitutionMemoryCardViewModel;
  categoryCount: number;
};
