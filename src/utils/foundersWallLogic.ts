import type { JourneyStoryCategoryId } from "../constants/journeyStoryCategories";
import { JOURNEY_STORY_CATEGORY_LABELS } from "../constants/journeyStoryCategories";
import {
  FOUNDERS_WALL_DISPLAY_FIELDS,
  type FoundersWallDisplayId
} from "../constants/foundersWall";
import { LEGACY_STATUS_LABELS, type LegacyStatusId } from "../constants/relationshipLegacyIndex";

export type FoundersCoupleViewModel = {
  journeyId: string;
  founderOrder: number;
  yearMet?: string;
  marriageYear?: string;
  storyCategoryIds: JourneyStoryCategoryId[];
  storyCategoryLabels: string[];
  legacyStatus: LegacyStatusId;
  legacyStatusLabel: string;
  honoredAt: string;
};

export type FoundersWallDisplayRow = {
  id: FoundersWallDisplayId;
  label: string;
  value?: string;
  reached: boolean;
};

export function buildFoundersCoupleViewModel(input: {
  journeyId: string;
  founderOrder: number;
  yearMet?: string;
  marriageYear?: string;
  storyCategoryIds: JourneyStoryCategoryId[];
  legacyStatus: LegacyStatusId;
  honoredAt: string;
}): FoundersCoupleViewModel {
  const storyCategoryLabels = input.storyCategoryIds.map(
    (id) => JOURNEY_STORY_CATEGORY_LABELS[id] ?? id
  );

  return {
    journeyId: input.journeyId,
    founderOrder: input.founderOrder,
    yearMet: input.yearMet,
    marriageYear: input.marriageYear,
    storyCategoryIds: input.storyCategoryIds,
    storyCategoryLabels,
    legacyStatus: input.legacyStatus,
    legacyStatusLabel: LEGACY_STATUS_LABELS[input.legacyStatus],
    honoredAt: input.honoredAt
  };
}

export function buildFoundersWallDisplayRows(
  couple: FoundersCoupleViewModel
): FoundersWallDisplayRow[] {
  const categoriesSummary = couple.storyCategoryLabels.length
    ? couple.storyCategoryLabels.join(" · ")
    : undefined;

  const values: Partial<Record<FoundersWallDisplayId, string>> = {
    "journey-id": couple.journeyId,
    "year-met": couple.yearMet,
    "marriage-year": couple.marriageYear,
    "story-categories": categoriesSummary,
    "legacy-status": couple.legacyStatusLabel
  };

  return FOUNDERS_WALL_DISPLAY_FIELDS.map((field) => ({
    id: field.id,
    label: field.label,
    value: values[field.id],
    reached: Boolean(values[field.id])
  }));
}

export function sortFoundersCouples(couples: FoundersCoupleViewModel[]): FoundersCoupleViewModel[] {
  return [...couples].sort((a, b) => {
    if (a.founderOrder !== b.founderOrder) return a.founderOrder - b.founderOrder;
    const yearA = Number(a.yearMet ?? 0);
    const yearB = Number(b.yearMet ?? 0);
    if (yearA !== yearB) return yearA - yearB;
    return a.journeyId.localeCompare(b.journeyId);
  });
}
