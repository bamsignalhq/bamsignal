import {
  FUTURE_READY_HOUSE_EXPERIENCE_CAPABILITIES,
  PREPARED_HOUSE_EXPERIENCE_ITEMS
} from "../constants/houseExperiences";
import {
  listArchitectureAllExperiences,
  listArchitectureCelebrations,
  listArchitectureExperiences,
  listArchitecturePrivateDining,
  type CelebrationViewModel,
  type ExperienceCardViewModel,
  type PrivateDiningViewModel
} from "./houseExperiencesLogic";

export type HouseExperiencesBundle = {
  experiences: ExperienceCardViewModel[];
  privateDining: PrivateDiningViewModel[];
  celebrations: CelebrationViewModel[];
  allExperiences: ExperienceCardViewModel[];
  experienceCount: number;
  futureReadyCapabilityCount: number;
};

export function getHouseExperiencesBundle(): HouseExperiencesBundle {
  return {
    experiences: listArchitectureExperiences(),
    privateDining: listArchitecturePrivateDining(),
    celebrations: listArchitectureCelebrations(),
    allExperiences: listArchitectureAllExperiences(),
    experienceCount: PREPARED_HOUSE_EXPERIENCE_ITEMS.length,
    futureReadyCapabilityCount: FUTURE_READY_HOUSE_EXPERIENCE_CAPABILITIES.length
  };
}

export function getHouseExperienceItem(itemId: string): ExperienceCardViewModel | null {
  return listArchitectureAllExperiences().find((item) => item.id === itemId) ?? null;
}
