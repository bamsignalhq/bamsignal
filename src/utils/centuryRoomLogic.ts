import type { CenturyRoomDisplayDefinition, CenturyRoomDisplayId } from "../constants/centuryRoom";
import {
  DISPLAY_FOUNDING_PRINCIPLES,
  DISPLAY_LEGACY_VISION,
  FOUNDING_PRINCIPLES_LABEL,
  LEGACY_VISION_LABEL
} from "../constants/centuryRoom";

export type FoundingPrinciplesCardViewModel = {
  id: CenturyRoomDisplayId;
  title: string;
  description: string;
  principlesLabel: string;
  displayOrder: number;
  statusLabel: string;
};

export type LegacyVisionCardViewModel = {
  id: CenturyRoomDisplayId;
  title: string;
  description: string;
  visionLabel: string;
  displayOrder: number;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildFoundingPrinciplesCardViewModel(
  display: CenturyRoomDisplayDefinition
): FoundingPrinciplesCardViewModel {
  return {
    id: display.id,
    title: display.title,
    description: display.description,
    principlesLabel: FOUNDING_PRINCIPLES_LABEL,
    displayOrder: display.displayOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildLegacyVisionCardViewModel(
  display: CenturyRoomDisplayDefinition
): LegacyVisionCardViewModel {
  return {
    id: display.id,
    title: display.title,
    description: display.description,
    visionLabel: LEGACY_VISION_LABEL,
    displayOrder: display.displayOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureFoundingPrinciples(): FoundingPrinciplesCardViewModel[] {
  return [...DISPLAY_FOUNDING_PRINCIPLES]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(buildFoundingPrinciplesCardViewModel);
}

export function listArchitectureLegacyVision(): LegacyVisionCardViewModel[] {
  return [...DISPLAY_LEGACY_VISION]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(buildLegacyVisionCardViewModel);
}
