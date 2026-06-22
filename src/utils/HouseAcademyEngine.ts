import { PREPARED_HOUSE_ACADEMY_PROGRAMS } from "../constants/houseAcademy";
import {
  listArchitectureMasterclasses,
  listArchitectureWorkshops,
  type MasterclassCardViewModel,
  type WorkshopCardViewModel
} from "./houseAcademyLogic";

export type HouseAcademyBundle = {
  masterclasses: MasterclassCardViewModel[];
  workshops: WorkshopCardViewModel[];
  programCount: number;
};

export function getHouseAcademyBundle(): HouseAcademyBundle {
  return {
    masterclasses: listArchitectureMasterclasses(),
    workshops: listArchitectureWorkshops(),
    programCount: PREPARED_HOUSE_ACADEMY_PROGRAMS.length
  };
}
