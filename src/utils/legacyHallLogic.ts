import type {
  PreparedLegacyHallHonourDefinition,
  PreparedLegacyHallHonourId
} from "../constants/legacyHall";
import {
  FOUNDERS_FAMILY_CARD_LABEL,
  GOLDEN_ANNIVERSARY_CARD_LABEL,
  LEGACY_COUPLE_CARD_LABEL,
  PREPARED_LEGACY_HALL_HONOURS
} from "../constants/legacyHall";

export type LegacyCoupleCardViewModel = {
  id: PreparedLegacyHallHonourId;
  title: string;
  description: string;
  honourLabel: string;
  statusLabel: string;
};

export type GoldenAnniversaryCardViewModel = {
  id: PreparedLegacyHallHonourId;
  title: string;
  description: string;
  honourLabel: string;
  statusLabel: string;
};

export type FoundersFamilyCardViewModel = {
  id: PreparedLegacyHallHonourId;
  title: string;
  description: string;
  honourLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildLegacyCoupleCardViewModel(
  honour: PreparedLegacyHallHonourDefinition
): LegacyCoupleCardViewModel {
  return {
    id: honour.id,
    title: honour.title,
    description: honour.description,
    honourLabel: LEGACY_COUPLE_CARD_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildGoldenAnniversaryCardViewModel(
  honour: PreparedLegacyHallHonourDefinition
): GoldenAnniversaryCardViewModel {
  return {
    id: honour.id,
    title: honour.title,
    description: honour.description,
    honourLabel: GOLDEN_ANNIVERSARY_CARD_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildFoundersFamilyCardViewModel(
  honour: PreparedLegacyHallHonourDefinition
): FoundersFamilyCardViewModel {
  return {
    id: honour.id,
    title: honour.title,
    description: honour.description,
    honourLabel: FOUNDERS_FAMILY_CARD_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureLegacyCouples(): LegacyCoupleCardViewModel[] {
  return PREPARED_LEGACY_HALL_HONOURS.filter((honour) => honour.kind === "legacy-couple").map(
    buildLegacyCoupleCardViewModel
  );
}

export function listArchitectureGoldenAnniversaries(): GoldenAnniversaryCardViewModel[] {
  return PREPARED_LEGACY_HALL_HONOURS.filter((honour) => honour.kind === "golden-anniversary").map(
    buildGoldenAnniversaryCardViewModel
  );
}

export function listArchitectureFoundersFamilies(): FoundersFamilyCardViewModel[] {
  return PREPARED_LEGACY_HALL_HONOURS.filter((honour) => honour.kind === "founders-family").map(
    buildFoundersFamilyCardViewModel
  );
}
