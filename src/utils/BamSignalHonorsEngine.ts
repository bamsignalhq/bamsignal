import {
  FUTURE_READY_HONORS_CAPABILITIES,
  PREPARED_HONOR_CATEGORIES
} from "../constants/bamSignalHonors";
import {
  listArchitectureHonorCategories,
  listArchitectureLegacyAwards,
  listArchitectureRecognitionTimelines,
  type HonorCategoryViewModel,
  type LegacyAwardViewModel,
  type RecognitionTimelineViewModel
} from "./bamSignalHonorsLogic";

export type BamSignalHonorsBundle = {
  categories: HonorCategoryViewModel[];
  awards: LegacyAwardViewModel[];
  timelines: RecognitionTimelineViewModel[];
  categoryCount: number;
  futureReadyCapabilityCount: number;
};

export function getBamSignalHonorsBundle(): BamSignalHonorsBundle {
  return {
    categories: listArchitectureHonorCategories(),
    awards: listArchitectureLegacyAwards(),
    timelines: listArchitectureRecognitionTimelines(),
    categoryCount: PREPARED_HONOR_CATEGORIES.length,
    futureReadyCapabilityCount: FUTURE_READY_HONORS_CAPABILITIES.length
  };
}

export function getHonorCategory(categoryId: string): HonorCategoryViewModel | null {
  return listArchitectureHonorCategories().find((category) => category.id === categoryId) ?? null;
}
