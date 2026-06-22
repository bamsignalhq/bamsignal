import type {
  PreparedFamilyTableDinnerDefinition,
  PreparedFamilyTableDinnerId
} from "../constants/familyTable";
import {
  DINNER_EXPERIENCE_LABEL,
  LEGACY_DINNER_LABEL,
  PREPARED_FAMILY_TABLE_DINNERS
} from "../constants/familyTable";

export type DinnerExperienceCardViewModel = {
  id: PreparedFamilyTableDinnerId;
  title: string;
  description: string;
  experienceLabel: string;
  statusLabel: string;
};

export type LegacyDinnerCardViewModel = {
  id: PreparedFamilyTableDinnerId;
  title: string;
  description: string;
  legacyLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildDinnerExperienceCardViewModel(
  dinner: PreparedFamilyTableDinnerDefinition
): DinnerExperienceCardViewModel {
  return {
    id: dinner.id,
    title: dinner.title,
    description: dinner.description,
    experienceLabel: DINNER_EXPERIENCE_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildLegacyDinnerCardViewModel(
  dinner: PreparedFamilyTableDinnerDefinition
): LegacyDinnerCardViewModel {
  return {
    id: dinner.id,
    title: dinner.title,
    description: dinner.description,
    legacyLabel: LEGACY_DINNER_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureDinnerExperiences(): DinnerExperienceCardViewModel[] {
  return PREPARED_FAMILY_TABLE_DINNERS.filter((dinner) => dinner.kind === "dinner-experience").map(
    buildDinnerExperienceCardViewModel
  );
}

export function listArchitectureLegacyDinners(): LegacyDinnerCardViewModel[] {
  return PREPARED_FAMILY_TABLE_DINNERS.filter((dinner) => dinner.kind === "legacy-dinner").map(
    buildLegacyDinnerCardViewModel
  );
}
