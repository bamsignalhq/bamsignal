/** Legacy Hall™ — honouring enduring stories at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const LEGACY_HALL_TITLE = "Legacy Hall™";
export const LEGACY_HALL_LABEL = "Legacy Hall";
export const LEGACY_COUPLE_CARD_LABEL = "Legacy Couple";
export const GOLDEN_ANNIVERSARY_CARD_LABEL = "Golden Anniversary";
export const FOUNDERS_FAMILY_CARD_LABEL = "Founders Family";

export const LEGACY_HALL_SUBCOPY =
  "Legacy Hall™ at The BamSignal House™ — Preserve Legacy Couples, Founders Families, Golden Anniversaries, and Diaspora Stories.";
export const LEGACY_HALL_PURPOSE_COPY =
  "Prepare Legacy Hall architecture — honoured stories reserved, not headquarters archives or branch displays.";
export const LEGACY_HALL_RESERVED_COPY =
  "Architecture prepared. Legacy Hall honours are not enabled yet.";
export const LEGACY_HALL_PRESERVE_COPY =
  "Stories preserved in architecture — Legacy Couples, Founders Families, Golden Anniversaries, and Diaspora Stories.";

export { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL, GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedLegacyHallHonourKind = "legacy-couple" | "golden-anniversary" | "founders-family";

export type PreparedLegacyHallHonourId =
  | "legacy-couples"
  | "founders-families"
  | "golden-anniversaries"
  | "diaspora-stories";

export type PreparedLegacyHallHonourDefinition = {
  id: PreparedLegacyHallHonourId;
  title: string;
  description: string;
  kind: PreparedLegacyHallHonourKind;
};

export const PREPARED_LEGACY_HALL_HONOURS: PreparedLegacyHallHonourDefinition[] = [
  {
    id: "legacy-couples",
    title: "Legacy Couples",
    description: "Legacy Couples — enduring partnerships honoured with dignity at the Hall.",
    kind: "legacy-couple"
  },
  {
    id: "founders-families",
    title: "Founders Families",
    description: "Founders Families — pioneering households preserved for future generations.",
    kind: "founders-family"
  },
  {
    id: "golden-anniversaries",
    title: "Golden Anniversaries",
    description: "Golden Anniversaries — milestone unions celebrated in timeless fashion.",
    kind: "golden-anniversary"
  },
  {
    id: "diaspora-stories",
    title: "Diaspora Stories",
    description: "Diaspora Stories — cross-border Legacy narratives honoured at the Hall.",
    kind: "founders-family"
  }
];

export function getPreparedLegacyHallHonour(
  honourId: PreparedLegacyHallHonourId
): PreparedLegacyHallHonourDefinition | undefined {
  return PREPARED_LEGACY_HALL_HONOURS.find((honour) => honour.id === honourId);
}
