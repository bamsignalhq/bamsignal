import type {
  PreparedAcademyProgramDefinition,
  PreparedAcademyProgramId
} from "../constants/houseAcademy";
import {
  MASTERCLASS_LABEL,
  PREPARED_MASTERCLASSES,
  PREPARED_WORKSHOPS,
  WORKSHOP_LABEL
} from "../constants/houseAcademy";

export type MasterclassCardViewModel = {
  id: PreparedAcademyProgramId;
  title: string;
  description: string;
  masterclassLabel: string;
  programOrder: number;
  statusLabel: string;
};

export type WorkshopCardViewModel = {
  id: PreparedAcademyProgramId;
  title: string;
  description: string;
  workshopLabel: string;
  programOrder: number;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildMasterclassCardViewModel(
  program: PreparedAcademyProgramDefinition
): MasterclassCardViewModel {
  return {
    id: program.id,
    title: program.title,
    description: program.description,
    masterclassLabel: MASTERCLASS_LABEL,
    programOrder: program.programOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildWorkshopCardViewModel(
  program: PreparedAcademyProgramDefinition
): WorkshopCardViewModel {
  return {
    id: program.id,
    title: program.title,
    description: program.description,
    workshopLabel: WORKSHOP_LABEL,
    programOrder: program.programOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureMasterclasses(): MasterclassCardViewModel[] {
  return [...PREPARED_MASTERCLASSES]
    .sort((a, b) => a.programOrder - b.programOrder)
    .map(buildMasterclassCardViewModel);
}

export function listArchitectureWorkshops(): WorkshopCardViewModel[] {
  return [...PREPARED_WORKSHOPS]
    .sort((a, b) => a.programOrder - b.programOrder)
    .map(buildWorkshopCardViewModel);
}
