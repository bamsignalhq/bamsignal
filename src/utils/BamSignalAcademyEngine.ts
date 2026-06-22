import { ACADEMY_ARCHITECTURE_TIMELINE, PREPARED_ACADEMY_PROGRAMS } from "../constants/bamSignalAcademy";
import {
  listArchitectureAcademyPrograms,
  listLearningPaths,
  type AcademyProgramViewModel,
  type LearningPathViewModel
} from "./bamSignalAcademyLogic";

export type BamSignalAcademyBundle = {
  programs: AcademyProgramViewModel[];
  learningPaths: LearningPathViewModel[];
  timeline: typeof ACADEMY_ARCHITECTURE_TIMELINE;
  programCount: number;
};

export function getBamSignalAcademyBundle(): BamSignalAcademyBundle {
  return {
    programs: listArchitectureAcademyPrograms(),
    learningPaths: listLearningPaths(),
    timeline: ACADEMY_ARCHITECTURE_TIMELINE,
    programCount: PREPARED_ACADEMY_PROGRAMS.length
  };
}
