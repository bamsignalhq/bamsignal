/** House Academy™ — learning programs at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const HOUSE_ACADEMY_TITLE = "House Academy™";
export const HOUSE_ACADEMY_LABEL = "House Academy";
export const MASTERCLASS_LABEL = "Masterclass";
export const WORKSHOP_LABEL = "Workshop";

export const HOUSE_ACADEMY_SUBCOPY =
  "House Academy™ at The BamSignal House™ — Relationship Courses, Marriage Workshops, Family Programs, and Diaspora Programs prepared with dignity.";
export const HOUSE_ACADEMY_PURPOSE_COPY =
  "Prepare House Academy architecture — masterclasses and workshops documented, not enrollment yet.";
export const HOUSE_ACADEMY_RESERVED_COPY =
  "Architecture prepared. House Academy programs are not enabled yet.";

export {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
};

export type PreparedAcademyProgramId =
  | "relationship-courses"
  | "marriage-workshops"
  | "family-programs"
  | "diaspora-programs";

export type PreparedAcademyProgramDefinition = {
  id: PreparedAcademyProgramId;
  title: string;
  description: string;
  programOrder: number;
};

export const PREPARED_MASTERCLASSES: PreparedAcademyProgramDefinition[] = [
  {
    id: "relationship-courses",
    title: "Relationship Courses",
    description: "Relationship Courses — masterclass architecture at The BamSignal House™.",
    programOrder: 1
  }
];

export const PREPARED_WORKSHOPS: PreparedAcademyProgramDefinition[] = [
  {
    id: "marriage-workshops",
    title: "Marriage Workshops",
    description: "Marriage Workshops — covenant learning reserved, not seminar theatre.",
    programOrder: 2
  },
  {
    id: "family-programs",
    title: "Family Programs",
    description: "Family Programs — multi-generational workshop architecture prepared.",
    programOrder: 3
  },
  {
    id: "diaspora-programs",
    title: "Diaspora Programs",
    description: "Diaspora Programs — corridor learning at the House, not relocation advice.",
    programOrder: 4
  }
];

export const PREPARED_HOUSE_ACADEMY_PROGRAMS: PreparedAcademyProgramDefinition[] = [
  ...PREPARED_MASTERCLASSES,
  ...PREPARED_WORKSHOPS
].sort((a, b) => a.programOrder - b.programOrder);

export function getPreparedHouseAcademyProgram(
  programId: PreparedAcademyProgramId
): PreparedAcademyProgramDefinition | undefined {
  return PREPARED_HOUSE_ACADEMY_PROGRAMS.find((program) => program.id === programId);
}
