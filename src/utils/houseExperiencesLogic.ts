import type {
  PreparedHouseExperienceItemDefinition,
  PreparedHouseExperienceItemId,
  PreparedHouseExperienceKind
} from "../constants/houseExperiences";
import {
  CELEBRATION_EXPERIENCE_LABEL,
  EXPERIENCE_CARD_LABEL,
  PREPARED_HOUSE_EXPERIENCE_ITEMS,
  PRIVATE_DINING_LABEL
} from "../constants/houseExperiences";

export type ExperienceCardViewModel = {
  id: PreparedHouseExperienceItemId;
  title: string;
  description: string;
  experienceLabel: string;
  statusLabel: string;
};

export type PrivateDiningViewModel = {
  id: PreparedHouseExperienceItemId;
  title: string;
  description: string;
  diningLabel: string;
  statusLabel: string;
};

export type CelebrationViewModel = {
  id: PreparedHouseExperienceItemId;
  title: string;
  description: string;
  celebrationLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

function labelForKind(kind: PreparedHouseExperienceKind): string {
  if (kind === "private-dining") return PRIVATE_DINING_LABEL;
  if (kind === "celebration") return CELEBRATION_EXPERIENCE_LABEL;
  return EXPERIENCE_CARD_LABEL;
}

export function buildExperienceCardViewModel(
  item: PreparedHouseExperienceItemDefinition
): ExperienceCardViewModel {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    experienceLabel: labelForKind(item.kind),
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildPrivateDiningViewModel(
  item: PreparedHouseExperienceItemDefinition
): PrivateDiningViewModel {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    diningLabel: PRIVATE_DINING_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildCelebrationViewModel(item: PreparedHouseExperienceItemDefinition): CelebrationViewModel {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    celebrationLabel: CELEBRATION_EXPERIENCE_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureExperiences(): ExperienceCardViewModel[] {
  return PREPARED_HOUSE_EXPERIENCE_ITEMS.filter((item) => item.kind === "experience").map(
    buildExperienceCardViewModel
  );
}

export function listArchitecturePrivateDining(): PrivateDiningViewModel[] {
  return PREPARED_HOUSE_EXPERIENCE_ITEMS.filter((item) => item.kind === "private-dining").map(
    buildPrivateDiningViewModel
  );
}

export function listArchitectureCelebrations(): CelebrationViewModel[] {
  return PREPARED_HOUSE_EXPERIENCE_ITEMS.filter((item) => item.kind === "celebration").map(
    buildCelebrationViewModel
  );
}

export function listArchitectureAllExperiences(): ExperienceCardViewModel[] {
  return [...PREPARED_HOUSE_EXPERIENCE_ITEMS.map(buildExperienceCardViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}
