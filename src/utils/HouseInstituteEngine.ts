import { PREPARED_HOUSE_INSTITUTE_PROGRAMS } from "../constants/houseInstitute";
import {
  listArchitecturePublications,
  listArchitectureResearchPrograms,
  type PublicationCardViewModel,
  type ResearchCardViewModel
} from "./houseInstituteLogic";

export type HouseInstituteBundle = {
  researchPrograms: ResearchCardViewModel[];
  publications: PublicationCardViewModel[];
  programCount: number;
};

export function getHouseInstituteBundle(): HouseInstituteBundle {
  return {
    researchPrograms: listArchitectureResearchPrograms(),
    publications: listArchitecturePublications(),
    programCount: PREPARED_HOUSE_INSTITUTE_PROGRAMS.length
  };
}
