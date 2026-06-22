import { PREPARED_HOUSE_FOUNDATION_PROGRAMS } from "../constants/houseFoundation";
import {
  listArchitectureImpactPrograms,
  listArchitectureScholarships,
  type ImpactCardViewModel,
  type ScholarshipCardViewModel
} from "./houseFoundationLogic";

export type HouseFoundationBundle = {
  scholarships: ScholarshipCardViewModel[];
  impactPrograms: ImpactCardViewModel[];
  programCount: number;
};

export function getHouseFoundationBundle(): HouseFoundationBundle {
  return {
    scholarships: listArchitectureScholarships(),
    impactPrograms: listArchitectureImpactPrograms(),
    programCount: PREPARED_HOUSE_FOUNDATION_PROGRAMS.length
  };
}
