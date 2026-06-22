import { PRESERVED_LEGACY_CATEGORIES } from "../constants/hallOfLegacy";
import {
  listArchitectureLegacyJourneys,
  listDiasporaStoryJourneys,
  listFoundersCoupleJourneys,
  listGoldenAnniversaryJourneys,
  listLegacyCoupleJourneys,
  type LegacyJourneyViewModel
} from "./hallOfLegacyLogic";

export type HallOfLegacyBundle = {
  categories: typeof PRESERVED_LEGACY_CATEGORIES;
  legacyCouples: LegacyJourneyViewModel[];
  goldenAnniversaries: LegacyJourneyViewModel[];
  foundersCouples: LegacyJourneyViewModel[];
  diasporaStories: LegacyJourneyViewModel[];
  allJourneys: LegacyJourneyViewModel[];
  categoryCount: number;
};

export function getHallOfLegacyBundle(): HallOfLegacyBundle {
  return {
    categories: PRESERVED_LEGACY_CATEGORIES,
    legacyCouples: listLegacyCoupleJourneys(),
    goldenAnniversaries: listGoldenAnniversaryJourneys(),
    foundersCouples: listFoundersCoupleJourneys(),
    diasporaStories: listDiasporaStoryJourneys(),
    allJourneys: listArchitectureLegacyJourneys(),
    categoryCount: PRESERVED_LEGACY_CATEGORIES.length
  };
}
