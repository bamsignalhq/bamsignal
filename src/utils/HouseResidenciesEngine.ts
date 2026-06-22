import { PREPARED_HOUSE_RESIDENCIES } from "../constants/houseResidencies";
import {
  listArchitectureFamilyResidences,
  listArchitectureResidencies,
  type FamilyResidenceCardViewModel,
  type ResidencyCardViewModel
} from "./houseResidenciesLogic";

export type HouseResidenciesBundle = {
  residencies: ResidencyCardViewModel[];
  familyResidences: FamilyResidenceCardViewModel[];
  programCount: number;
};

export function getHouseResidenciesBundle(): HouseResidenciesBundle {
  return {
    residencies: listArchitectureResidencies(),
    familyResidences: listArchitectureFamilyResidences(),
    programCount: PREPARED_HOUSE_RESIDENCIES.length
  };
}
