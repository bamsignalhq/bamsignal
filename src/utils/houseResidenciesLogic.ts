import type { PreparedResidencyDefinition, PreparedResidencyId } from "../constants/houseResidencies";
import {
  FAMILY_RESIDENCE_LABEL,
  PREPARED_FAMILY_RESIDENCES,
  PREPARED_RESIDENCY_PROGRAMS,
  RESIDENCY_LABEL
} from "../constants/houseResidencies";

export type ResidencyCardViewModel = {
  id: PreparedResidencyId;
  title: string;
  description: string;
  residencyLabel: string;
  programOrder: number;
  statusLabel: string;
};

export type FamilyResidenceCardViewModel = {
  id: PreparedResidencyId;
  title: string;
  description: string;
  familyResidenceLabel: string;
  programOrder: number;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildResidencyCardViewModel(
  residency: PreparedResidencyDefinition
): ResidencyCardViewModel {
  return {
    id: residency.id,
    title: residency.title,
    description: residency.description,
    residencyLabel: RESIDENCY_LABEL,
    programOrder: residency.programOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildFamilyResidenceCardViewModel(
  residence: PreparedResidencyDefinition
): FamilyResidenceCardViewModel {
  return {
    id: residence.id,
    title: residence.title,
    description: residence.description,
    familyResidenceLabel: FAMILY_RESIDENCE_LABEL,
    programOrder: residence.programOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureResidencies(): ResidencyCardViewModel[] {
  return [...PREPARED_RESIDENCY_PROGRAMS]
    .sort((a, b) => a.programOrder - b.programOrder)
    .map(buildResidencyCardViewModel);
}

export function listArchitectureFamilyResidences(): FamilyResidenceCardViewModel[] {
  return [...PREPARED_FAMILY_RESIDENCES]
    .sort((a, b) => a.programOrder - b.programOrder)
    .map(buildFamilyResidenceCardViewModel);
}
