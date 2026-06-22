/** Century Room™ — founding principles and legacy vision at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const CENTURY_ROOM_TITLE = "Century Room™";
export const CENTURY_ROOM_LABEL = "Century Room";
export const FOUNDING_PRINCIPLES_LABEL = "Founding Principles";
export const LEGACY_VISION_LABEL = "Legacy Vision";

export const CENTURY_ROOM_SUBCOPY =
  "Century Room™ at The BamSignal House™ — 100-Year Vision, Founding Values, Stewardship, Family, Faith, Trust, Community, and Legacy displayed with dignity.";
export const CENTURY_ROOM_PURPOSE_COPY =
  "Build Century Room architecture — principles and vision documented, not ceremonies or pledges yet.";
export const CENTURY_ROOM_RESERVED_COPY =
  "Architecture prepared. Century Room displays are not enabled yet.";

export {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
};

export type CenturyRoomDisplayId =
  | "100-year-vision"
  | "founding-values"
  | "stewardship"
  | "family"
  | "faith"
  | "trust"
  | "community"
  | "legacy";

export type CenturyRoomDisplayDefinition = {
  id: CenturyRoomDisplayId;
  title: string;
  description: string;
  displayOrder: number;
};

export const DISPLAY_LEGACY_VISION: CenturyRoomDisplayDefinition[] = [
  {
    id: "100-year-vision",
    title: "100-Year Vision",
    description: "100-Year Vision — century horizon architecture at The BamSignal House™.",
    displayOrder: 1
  },
  {
    id: "legacy",
    title: "Legacy",
    description: "Legacy — multi-generational stewardship vision reserved, not slogans.",
    displayOrder: 8
  }
];

export const DISPLAY_FOUNDING_PRINCIPLES: CenturyRoomDisplayDefinition[] = [
  {
    id: "founding-values",
    title: "Founding Values",
    description: "Founding Values — principles that anchor the Century Room.",
    displayOrder: 2
  },
  {
    id: "stewardship",
    title: "Stewardship",
    description: "Stewardship — caretaking architecture for the House and generations.",
    displayOrder: 3
  },
  {
    id: "family",
    title: "Family",
    description: "Family — honoured at the centre of the Century Room.",
    displayOrder: 4
  },
  {
    id: "faith",
    title: "Faith",
    description: "Faith — held with dignity in founding principles, not performance.",
    displayOrder: 5
  },
  {
    id: "trust",
    title: "Trust",
    description: "Trust — foundation of relationship wisdom at the House.",
    displayOrder: 6
  },
  {
    id: "community",
    title: "Community",
    description: "Community — neighbourhood and fellowship architecture prepared.",
    displayOrder: 7
  }
];

export const CENTURY_ROOM_DISPLAYS: CenturyRoomDisplayDefinition[] = [
  ...DISPLAY_LEGACY_VISION,
  ...DISPLAY_FOUNDING_PRINCIPLES
].sort((a, b) => a.displayOrder - b.displayOrder);

export function getCenturyRoomDisplay(
  displayId: CenturyRoomDisplayId
): CenturyRoomDisplayDefinition | undefined {
  return CENTURY_ROOM_DISPLAYS.find((display) => display.id === displayId);
}
