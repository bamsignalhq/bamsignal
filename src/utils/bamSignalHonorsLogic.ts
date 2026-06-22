import type {
  PreparedHonorCategoryDefinition,
  PreparedHonorCategoryId,
  PreparedLegacyAwardDefinition,
  PreparedLegacyAwardId,
  PreparedRecognitionTimelineDefinition,
  PreparedRecognitionTimelineId
} from "../constants/bamSignalHonors";
import {
  CELEBRATING_LEGACY_LABEL,
  HONOR_CATEGORY_LABEL,
  LEGACY_AWARD_LABEL,
  PREPARED_HONOR_CATEGORIES,
  PREPARED_LEGACY_AWARDS,
  PREPARED_RECOGNITION_TIMELINES,
  RECOGNITION_TIMELINE_LABEL
} from "../constants/bamSignalHonors";

export type HonorCategoryViewModel = {
  id: PreparedHonorCategoryId;
  title: string;
  description: string;
  categoryLabel: string;
  statusLabel: string;
};

export type LegacyAwardViewModel = {
  id: PreparedLegacyAwardId;
  title: string;
  description: string;
  categoryTitle: string;
  awardLabel: string;
  statusLabel: string;
};

export type RecognitionTimelineViewModel = {
  id: PreparedRecognitionTimelineId;
  title: string;
  summary: string;
  categoryTitle: string;
  timelineLabel: string;
  celebratingLegacyLabel: string;
  entries: PreparedRecognitionTimelineDefinition["entries"];
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildHonorCategoryViewModel(category: PreparedHonorCategoryDefinition): HonorCategoryViewModel {
  return {
    id: category.id,
    title: category.title,
    description: category.description,
    categoryLabel: HONOR_CATEGORY_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildLegacyAwardViewModel(award: PreparedLegacyAwardDefinition): LegacyAwardViewModel {
  const category = PREPARED_HONOR_CATEGORIES.find((item) => item.id === award.categoryId);
  return {
    id: award.id,
    title: award.title,
    description: award.description,
    categoryTitle: category?.title ?? award.categoryId,
    awardLabel: LEGACY_AWARD_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildRecognitionTimelineViewModel(
  timeline: PreparedRecognitionTimelineDefinition
): RecognitionTimelineViewModel {
  const category = PREPARED_HONOR_CATEGORIES.find((item) => item.id === timeline.categoryId);
  return {
    id: timeline.id,
    title: timeline.title,
    summary: timeline.summary,
    categoryTitle: category?.title ?? timeline.categoryId,
    timelineLabel: RECOGNITION_TIMELINE_LABEL,
    celebratingLegacyLabel: CELEBRATING_LEGACY_LABEL,
    entries: timeline.entries,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureHonorCategories(): HonorCategoryViewModel[] {
  return [...PREPARED_HONOR_CATEGORIES.map(buildHonorCategoryViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export function listArchitectureLegacyAwards(): LegacyAwardViewModel[] {
  return [...PREPARED_LEGACY_AWARDS.map(buildLegacyAwardViewModel)].sort((a, b) =>
    a.categoryTitle.localeCompare(b.categoryTitle)
  );
}

export function listArchitectureRecognitionTimelines(): RecognitionTimelineViewModel[] {
  return [...PREPARED_RECOGNITION_TIMELINES.map(buildRecognitionTimelineViewModel)].sort((a, b) =>
    a.categoryTitle.localeCompare(b.categoryTitle)
  );
}
