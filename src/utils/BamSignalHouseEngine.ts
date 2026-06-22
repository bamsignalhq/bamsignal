import { PREPARED_FOUNDING_HOUSES } from "../constants/bamSignalHouse";
import {
  listArchitectureHouseExperiences,
  listArchitectureHouseLocations,
  listArchitectureHousePrinciples,
  listArchitectureHouseTimelines,
  type HouseExperienceViewModel,
  type HouseLocationViewModel,
  type HousePrincipleViewModel,
  type HouseTimelineViewModel
} from "./bamSignalHouseLogic";

export type BamSignalHouseBundle = {
  locations: HouseLocationViewModel[];
  experiences: HouseExperienceViewModel[];
  timelines: HouseTimelineViewModel[];
  principles: HousePrincipleViewModel[];
  foundingHouseCount: number;
};

export function getBamSignalHouseBundle(): BamSignalHouseBundle {
  return {
    locations: listArchitectureHouseLocations(),
    experiences: listArchitectureHouseExperiences(),
    timelines: listArchitectureHouseTimelines(),
    principles: listArchitectureHousePrinciples(),
    foundingHouseCount: PREPARED_FOUNDING_HOUSES.length
  };
}

export function getFoundingHouse(houseId: string): HouseLocationViewModel | null {
  return listArchitectureHouseLocations().find((house) => house.id === houseId) ?? null;
}
