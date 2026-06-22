import type {
  PreparedInstituteProgramDefinition,
  PreparedInstituteProgramId
} from "../constants/houseInstitute";
import {
  PREPARED_PUBLICATIONS,
  PREPARED_RESEARCH_PROGRAMS,
  PUBLICATION_LABEL,
  RESEARCH_LABEL
} from "../constants/houseInstitute";

export type ResearchCardViewModel = {
  id: PreparedInstituteProgramId;
  title: string;
  description: string;
  researchLabel: string;
  programOrder: number;
  statusLabel: string;
};

export type PublicationCardViewModel = {
  id: PreparedInstituteProgramId;
  title: string;
  description: string;
  publicationLabel: string;
  programOrder: number;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildResearchCardViewModel(
  program: PreparedInstituteProgramDefinition
): ResearchCardViewModel {
  return {
    id: program.id,
    title: program.title,
    description: program.description,
    researchLabel: RESEARCH_LABEL,
    programOrder: program.programOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildPublicationCardViewModel(
  program: PreparedInstituteProgramDefinition
): PublicationCardViewModel {
  return {
    id: program.id,
    title: program.title,
    description: program.description,
    publicationLabel: PUBLICATION_LABEL,
    programOrder: program.programOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureResearchPrograms(): ResearchCardViewModel[] {
  return [...PREPARED_RESEARCH_PROGRAMS]
    .sort((a, b) => a.programOrder - b.programOrder)
    .map(buildResearchCardViewModel);
}

export function listArchitecturePublications(): PublicationCardViewModel[] {
  return [...PREPARED_PUBLICATIONS]
    .sort((a, b) => a.programOrder - b.programOrder)
    .map(buildPublicationCardViewModel);
}
