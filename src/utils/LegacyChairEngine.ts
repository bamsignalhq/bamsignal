import {
  FUTURE_READY_LEGACY_CHAIR_CAPABILITIES,
  PREPARED_CHAIR_CATEGORIES
} from "../constants/legacyChair";
import {
  listArchitectureChairCategories,
  listArchitectureResearchLeadership,
  type ChairCategoryViewModel,
  type ResearchLeadershipViewModel
} from "./legacyChairLogic";

export type LegacyChairBundle = {
  categories: ChairCategoryViewModel[];
  leadership: ResearchLeadershipViewModel[];
  categoryCount: number;
  futureReadyCapabilityCount: number;
};

export function getLegacyChairBundle(): LegacyChairBundle {
  return {
    categories: listArchitectureChairCategories(),
    leadership: listArchitectureResearchLeadership(),
    categoryCount: PREPARED_CHAIR_CATEGORIES.length,
    futureReadyCapabilityCount: FUTURE_READY_LEGACY_CHAIR_CAPABILITIES.length
  };
}

export function getChairCategory(categoryId: string): ChairCategoryViewModel | null {
  return listArchitectureChairCategories().find((category) => category.id === categoryId) ?? null;
}
