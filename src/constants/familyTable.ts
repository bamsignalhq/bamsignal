/** Family Table™ — shared meals at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const FAMILY_TABLE_TITLE = "Family Table™";
export const FAMILY_TABLE_LABEL = "Family Table";
export const DINNER_EXPERIENCE_LABEL = "Dinner Experience";
export const LEGACY_DINNER_LABEL = "Legacy Dinner";

export const FAMILY_TABLE_SUBCOPY =
  "The Family Table™ at The BamSignal House™ — Gather for Family Dinners, Celebrations, and Legacy meals with dignity.";
export const FAMILY_TABLE_PURPOSE_COPY =
  "Prepare Family Table architecture — shared meals reserved, not restaurant bookings or headquarters cafeterias.";
export const FAMILY_TABLE_RESERVED_COPY =
  "Architecture prepared. Family Table dinners and legacy meals are not enabled yet.";

export { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL, GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedFamilyTableDinnerKind = "dinner-experience" | "legacy-dinner";

export type PreparedFamilyTableDinnerId =
  | "family-dinners"
  | "anniversary-meals"
  | "celebration-nights"
  | "founders-families-dinner"
  | "legacy-couples-dinner";

export type PreparedFamilyTableDinnerDefinition = {
  id: PreparedFamilyTableDinnerId;
  title: string;
  description: string;
  kind: PreparedFamilyTableDinnerKind;
};

export const PREPARED_FAMILY_TABLE_DINNERS: PreparedFamilyTableDinnerDefinition[] = [
  {
    id: "family-dinners",
    title: "Family Dinners",
    description: "Family Dinners — households Gather at the Table with warmth and respect.",
    kind: "dinner-experience"
  },
  {
    id: "anniversary-meals",
    title: "Anniversary Meals",
    description: "Anniversary Meals — milestones celebrated over shared plates at the House.",
    kind: "dinner-experience"
  },
  {
    id: "celebration-nights",
    title: "Celebration Nights",
    description: "Celebration Nights — Community joy around the Family Table, not branch events.",
    kind: "dinner-experience"
  },
  {
    id: "founders-families-dinner",
    title: "Founders Families Dinner",
    description: "Founders Families Dinner — pioneering households honoured at the Table.",
    kind: "legacy-dinner"
  },
  {
    id: "legacy-couples-dinner",
    title: "Legacy Couples Dinner",
    description: "Legacy Couples Dinner — enduring partnerships celebrated with dignity.",
    kind: "legacy-dinner"
  }
];

export function getPreparedFamilyTableDinner(
  dinnerId: PreparedFamilyTableDinnerId
): PreparedFamilyTableDinnerDefinition | undefined {
  return PREPARED_FAMILY_TABLE_DINNERS.find((dinner) => dinner.id === dinnerId);
}
