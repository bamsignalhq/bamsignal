import type {
  PreparedLegacyGardenPurposeDefinition,
  PreparedLegacyGardenPurposeId
} from "../constants/legacyGarden";
import {
  GARDEN_EXPERIENCE_LABEL,
  MEMORY_TREE_LABEL,
  PREPARED_LEGACY_GARDEN_PURPOSES
} from "../constants/legacyGarden";

export type GardenExperienceCardViewModel = {
  id: PreparedLegacyGardenPurposeId;
  title: string;
  description: string;
  experienceLabel: string;
  statusLabel: string;
};

export type MemoryTreeCardViewModel = {
  id: PreparedLegacyGardenPurposeId;
  title: string;
  description: string;
  treeLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildGardenExperienceCardViewModel(
  purpose: PreparedLegacyGardenPurposeDefinition
): GardenExperienceCardViewModel {
  return {
    id: purpose.id,
    title: purpose.title,
    description: purpose.description,
    experienceLabel: GARDEN_EXPERIENCE_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildMemoryTreeCardViewModel(
  purpose: PreparedLegacyGardenPurposeDefinition
): MemoryTreeCardViewModel {
  return {
    id: purpose.id,
    title: purpose.title,
    description: purpose.description,
    treeLabel: MEMORY_TREE_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureGardenExperiences(): GardenExperienceCardViewModel[] {
  return PREPARED_LEGACY_GARDEN_PURPOSES.filter((purpose) => purpose.kind === "garden-experience").map(
    buildGardenExperienceCardViewModel
  );
}

export function listArchitectureMemoryTrees(): MemoryTreeCardViewModel[] {
  return PREPARED_LEGACY_GARDEN_PURPOSES.filter((purpose) => purpose.kind === "memory-tree").map(
    buildMemoryTreeCardViewModel
  );
}
