import { HOUSE_SYSTEMS } from "../constants/houseOperatingSystem";
import type { HouseOperatingSystemBundle } from "../types/houseOperatingSystem";
import {
  buildCenturyVisionCardViewModel,
  listArchitectureHouseSystems,
  listArchitectureInstitutionMapNodes,
  listArchitectureOperatingPrinciples
} from "./houseOperatingSystemLogic";

export function getHouseOperatingSystemBundle(): HouseOperatingSystemBundle {
  return {
    systems: listArchitectureHouseSystems(),
    mapNodes: listArchitectureInstitutionMapNodes(),
    principles: listArchitectureOperatingPrinciples(),
    centuryVision: buildCenturyVisionCardViewModel(),
    systemCount: HOUSE_SYSTEMS.length
  };
}
