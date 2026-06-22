import type {
  PreparedFoundationProgramDefinition,
  PreparedFoundationProgramId
} from "../constants/houseFoundation";
import {
  IMPACT_LABEL,
  PREPARED_IMPACT_PROGRAMS,
  PREPARED_SCHOLARSHIP_PROGRAMS,
  SCHOLARSHIP_LABEL
} from "../constants/houseFoundation";

export type ScholarshipCardViewModel = {
  id: PreparedFoundationProgramId;
  title: string;
  description: string;
  scholarshipLabel: string;
  programOrder: number;
  statusLabel: string;
};

export type ImpactCardViewModel = {
  id: PreparedFoundationProgramId;
  title: string;
  description: string;
  impactLabel: string;
  programOrder: number;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildScholarshipCardViewModel(
  program: PreparedFoundationProgramDefinition
): ScholarshipCardViewModel {
  return {
    id: program.id,
    title: program.title,
    description: program.description,
    scholarshipLabel: SCHOLARSHIP_LABEL,
    programOrder: program.programOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildImpactCardViewModel(
  program: PreparedFoundationProgramDefinition
): ImpactCardViewModel {
  return {
    id: program.id,
    title: program.title,
    description: program.description,
    impactLabel: IMPACT_LABEL,
    programOrder: program.programOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureScholarships(): ScholarshipCardViewModel[] {
  return [...PREPARED_SCHOLARSHIP_PROGRAMS]
    .sort((a, b) => a.programOrder - b.programOrder)
    .map(buildScholarshipCardViewModel);
}

export function listArchitectureImpactPrograms(): ImpactCardViewModel[] {
  return [...PREPARED_IMPACT_PROGRAMS]
    .sort((a, b) => a.programOrder - b.programOrder)
    .map(buildImpactCardViewModel);
}
