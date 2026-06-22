/** House Residencies™ — residency programs at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const HOUSE_RESIDENCIES_TITLE = "House Residencies™";
export const HOUSE_RESIDENCIES_LABEL = "House Residencies";
export const RESIDENCY_LABEL = "Residency";
export const FAMILY_RESIDENCE_LABEL = "Family Residence";

export const HOUSE_RESIDENCIES_SUBCOPY =
  "House Residencies™ at The BamSignal House™ — Visiting Scholars, Relationship Fellows, Writers, Researchers, Artists, and Family Mentors reserved with dignity.";
export const HOUSE_RESIDENCIES_PURPOSE_COPY =
  "Prepare House Residencies architecture — programs documented, not applications or placements yet.";
export const HOUSE_RESIDENCIES_RESERVED_COPY =
  "Architecture prepared. House Residencies programs are not enabled yet.";

export {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
};

export type PreparedResidencyId =
  | "visiting-scholars"
  | "relationship-fellows"
  | "writers"
  | "researchers"
  | "artists"
  | "family-mentors";

export type PreparedResidencyDefinition = {
  id: PreparedResidencyId;
  title: string;
  description: string;
  programOrder: number;
};

export const PREPARED_RESIDENCY_PROGRAMS: PreparedResidencyDefinition[] = [
  {
    id: "visiting-scholars",
    title: "Visiting Scholars",
    description: "Visiting Scholars — academic residence architecture at The BamSignal House™.",
    programOrder: 1
  },
  {
    id: "writers",
    title: "Writers",
    description: "Writers — narrative and reflection residency reserved, not a retreat centre.",
    programOrder: 2
  },
  {
    id: "researchers",
    title: "Researchers",
    description: "Researchers — relationship research residence architecture prepared.",
    programOrder: 3
  },
  {
    id: "artists",
    title: "Artists",
    description: "Artists — creative residence at the House, not exhibition halls.",
    programOrder: 4
  }
];

export const PREPARED_FAMILY_RESIDENCES: PreparedResidencyDefinition[] = [
  {
    id: "relationship-fellows",
    title: "Relationship Fellows",
    description: "Relationship Fellows — fellowship residence for relationship wisdom at the House.",
    programOrder: 5
  },
  {
    id: "family-mentors",
    title: "Family Mentors",
    description: "Family Mentors — multi-generational mentor residence architecture reserved.",
    programOrder: 6
  }
];

export const PREPARED_HOUSE_RESIDENCIES: PreparedResidencyDefinition[] = [
  ...PREPARED_RESIDENCY_PROGRAMS,
  ...PREPARED_FAMILY_RESIDENCES
].sort((a, b) => a.programOrder - b.programOrder);

export function getPreparedHouseResidency(
  residencyId: PreparedResidencyId
): PreparedResidencyDefinition | undefined {
  return PREPARED_HOUSE_RESIDENCIES.find((residency) => residency.id === residencyId);
}
