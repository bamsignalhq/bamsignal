import { RESEARCH_AREAS } from "../constants/bamSignalInstitute";
import {
  listArchitectureResearchAreas,
  listArchitectureResearchReports,
  type ResearchAreaViewModel,
  type ResearchReportViewModel
} from "./bamSignalInstituteLogic";

export type BamSignalInstituteBundle = {
  areas: ResearchAreaViewModel[];
  reports: ResearchReportViewModel[];
  areaCount: number;
};

export function getBamSignalInstituteBundle(): BamSignalInstituteBundle {
  const areas = listArchitectureResearchAreas();
  return {
    areas,
    reports: listArchitectureResearchReports(),
    areaCount: RESEARCH_AREAS.length
  };
}
