import type {
  KnowledgeArticleDefinition,
  KnowledgeCategoryDefinition,
  KnowledgeTimelineEntry
} from "../constants/institutionalKnowledgeBase";
import {
  INSTITUTION_MEMORY_NARRATIVE,
  INSTITUTIONAL_MEMORY_PURPOSES,
  KNOWLEDGE_ARTICLE_LABEL,
  KNOWLEDGE_ARTICLES,
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_CATEGORY_LABEL,
  KNOWLEDGE_TIMELINE_ENTRIES,
  getKnowledgeCategory
} from "../constants/institutionalKnowledgeBase";
import type {
  InstitutionMemoryCardViewModel,
  KnowledgeArticleCardViewModel,
  KnowledgeCategoryCardViewModel,
  KnowledgeTimelineEntryViewModel
} from "../types/institutionalKnowledgeBase";

const ARCHITECTURE_STATUS = "Architecture prepared — not published yet";

function articleCountForCategory(categoryId: KnowledgeCategoryDefinition["id"]): number {
  return KNOWLEDGE_ARTICLES.filter((article) => article.categoryId === categoryId).length;
}

export function buildKnowledgeCategoryCardViewModel(
  category: KnowledgeCategoryDefinition
): KnowledgeCategoryCardViewModel {
  return {
    id: category.id,
    title: category.title,
    description: category.description,
    categoryOrder: category.categoryOrder,
    categoryLabel: KNOWLEDGE_CATEGORY_LABEL,
    articleCount: articleCountForCategory(category.id),
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildKnowledgeArticleCardViewModel(
  article: KnowledgeArticleDefinition
): KnowledgeArticleCardViewModel {
  const category = getKnowledgeCategory(article.categoryId);
  return {
    id: article.id,
    categoryId: article.categoryId,
    categoryTitle: category?.title ?? article.categoryId,
    title: article.title,
    summary: article.summary,
    articleOrder: article.articleOrder,
    articleLabel: KNOWLEDGE_ARTICLE_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildKnowledgeTimelineEntryViewModel(
  entry: KnowledgeTimelineEntry
): KnowledgeTimelineEntryViewModel {
  return { ...entry };
}

export function buildInstitutionMemoryCardViewModel(): InstitutionMemoryCardViewModel {
  return {
    narrative: INSTITUTION_MEMORY_NARRATIVE,
    purposes: INSTITUTIONAL_MEMORY_PURPOSES
  };
}

export function listArchitectureKnowledgeCategories(): KnowledgeCategoryCardViewModel[] {
  return [...KNOWLEDGE_CATEGORIES]
    .sort((left, right) => left.categoryOrder - right.categoryOrder)
    .map(buildKnowledgeCategoryCardViewModel);
}

export function listArchitectureKnowledgeArticles(): KnowledgeArticleCardViewModel[] {
  return [...KNOWLEDGE_ARTICLES]
    .sort((left, right) => left.articleOrder - right.articleOrder)
    .map(buildKnowledgeArticleCardViewModel);
}

export function listArchitectureKnowledgeTimeline(): KnowledgeTimelineEntryViewModel[] {
  return [...KNOWLEDGE_TIMELINE_ENTRIES]
    .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime())
    .map(buildKnowledgeTimelineEntryViewModel);
}
