import type {
  LearningPathDefinition,
  LearningPathId,
  PreparedAcademyProgramDefinition,
  PreparedAcademyProgramId
} from "../constants/bamSignalAcademy";
import { LEARNING_PATHS, PREPARED_ACADEMY_PROGRAMS, getPreparedAcademyProgram } from "../constants/bamSignalAcademy";

export type AcademyProgramViewModel = {
  id: PreparedAcademyProgramId;
  title: string;
  description: string;
  statusLabel: string;
};

export type LearningPathViewModel = {
  id: LearningPathId;
  title: string;
  description: string;
  programLabels: string[];
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildAcademyProgramViewModel(
  program: PreparedAcademyProgramDefinition
): AcademyProgramViewModel {
  return {
    id: program.id,
    title: program.title,
    description: program.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildLearningPathViewModel(path: LearningPathDefinition): LearningPathViewModel {
  const programLabels = path.programIds.map((programId) => {
    const program = getPreparedAcademyProgram(programId);
    return program?.title ?? programId;
  });
  return {
    id: path.id,
    title: path.title,
    description: path.description,
    programLabels,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function sortPrograms(programs: AcademyProgramViewModel[]): AcademyProgramViewModel[] {
  return [...programs].sort((a, b) => a.title.localeCompare(b.title));
}

export function listArchitectureAcademyPrograms(): AcademyProgramViewModel[] {
  return sortPrograms(PREPARED_ACADEMY_PROGRAMS.map(buildAcademyProgramViewModel));
}

export function listLearningPaths(): LearningPathViewModel[] {
  return LEARNING_PATHS.map(buildLearningPathViewModel);
}
