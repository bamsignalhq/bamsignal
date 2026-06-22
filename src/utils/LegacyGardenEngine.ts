import { PREPARED_LEGACY_GARDEN_PURPOSES } from "../constants/legacyGarden";
import {
  listArchitectureGardenExperiences,
  listArchitectureMemoryTrees,
  type GardenExperienceCardViewModel,
  type MemoryTreeCardViewModel
} from "./legacyGardenLogic";

export type LegacyGardenBundle = {
  gardenExperiences: GardenExperienceCardViewModel[];
  memoryTrees: MemoryTreeCardViewModel[];
  purposeCount: number;
};

export function getLegacyGardenBundle(): LegacyGardenBundle {
  return {
    gardenExperiences: listArchitectureGardenExperiences(),
    memoryTrees: listArchitectureMemoryTrees(),
    purposeCount: PREPARED_LEGACY_GARDEN_PURPOSES.length
  };
}
