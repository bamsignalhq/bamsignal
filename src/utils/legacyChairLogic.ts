import type {
  PreparedChairCategoryDefinition,
  PreparedChairCategoryId,
  PreparedResearchLeadershipDefinition,
  PreparedResearchLeadershipId
} from "../constants/legacyChair";
import {
  CHAIR_CATEGORY_LABEL,
  PREPARED_CHAIR_CATEGORIES,
  PREPARED_RESEARCH_LEADERSHIP,
  RESEARCH_LEADERSHIP_LABEL
} from "../constants/legacyChair";

export type ChairCategoryViewModel = {
  id: PreparedChairCategoryId;
  title: string;
  description: string;
  categoryLabel: string;
  statusLabel: string;
};

export type ResearchLeadershipViewModel = {
  id: PreparedResearchLeadershipId;
  title: string;
  description: string;
  categoryTitle: string;
  leadershipLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildChairCategoryViewModel(category: PreparedChairCategoryDefinition): ChairCategoryViewModel {
  return {
    id: category.id,
    title: category.title,
    description: category.description,
    categoryLabel: CHAIR_CATEGORY_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildResearchLeadershipViewModel(
  leadership: PreparedResearchLeadershipDefinition
): ResearchLeadershipViewModel {
  const category = PREPARED_CHAIR_CATEGORIES.find((item) => item.id === leadership.categoryId);
  return {
    id: leadership.id,
    title: leadership.title,
    description: leadership.description,
    categoryTitle: category?.title ?? leadership.categoryId,
    leadershipLabel: RESEARCH_LEADERSHIP_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureChairCategories(): ChairCategoryViewModel[] {
  return [...PREPARED_CHAIR_CATEGORIES.map(buildChairCategoryViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export function listArchitectureResearchLeadership(): ResearchLeadershipViewModel[] {
  return [...PREPARED_RESEARCH_LEADERSHIP.map(buildResearchLeadershipViewModel)].sort((a, b) =>
    a.categoryTitle.localeCompare(b.categoryTitle)
  );
}
