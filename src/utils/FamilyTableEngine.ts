import { PREPARED_FAMILY_TABLE_DINNERS } from "../constants/familyTable";
import {
  listArchitectureDinnerExperiences,
  listArchitectureLegacyDinners,
  type DinnerExperienceCardViewModel,
  type LegacyDinnerCardViewModel
} from "./familyTableLogic";

export type FamilyTableBundle = {
  dinnerExperiences: DinnerExperienceCardViewModel[];
  legacyDinners: LegacyDinnerCardViewModel[];
  dinnerCount: number;
};

export function getFamilyTableBundle(): FamilyTableBundle {
  return {
    dinnerExperiences: listArchitectureDinnerExperiences(),
    legacyDinners: listArchitectureLegacyDinners(),
    dinnerCount: PREPARED_FAMILY_TABLE_DINNERS.length
  };
}
