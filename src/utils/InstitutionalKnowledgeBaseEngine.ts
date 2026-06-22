import { KNOWLEDGE_CATEGORIES } from "../constants/institutionalKnowledgeBase";
import type { InstitutionalKnowledgeBaseBundle } from "../types/institutionalKnowledgeBase";
import {
  buildInstitutionMemoryCardViewModel,
  listArchitectureKnowledgeArticles,
  listArchitectureKnowledgeCategories,
  listArchitectureKnowledgeTimeline
} from "./institutionalKnowledgeBaseLogic";

export function getInstitutionalKnowledgeBaseBundle(): InstitutionalKnowledgeBaseBundle {
  return {
    categories: listArchitectureKnowledgeCategories(),
    articles: listArchitectureKnowledgeArticles(),
    timeline: listArchitectureKnowledgeTimeline(),
    institutionMemory: buildInstitutionMemoryCardViewModel(),
    categoryCount: KNOWLEDGE_CATEGORIES.length
  };
}
