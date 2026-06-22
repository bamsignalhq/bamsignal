/** House Institute™ — research and publications at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const HOUSE_INSTITUTE_TITLE = "House Institute™";
export const HOUSE_INSTITUTE_LABEL = "House Institute";
export const RESEARCH_LABEL = "Research";
export const PUBLICATION_LABEL = "Publication";

export const HOUSE_INSTITUTE_SUBCOPY =
  "House Institute™ at The BamSignal House™ — Research, Reports, Observatory, and Relationship Index prepared with dignity.";
export const HOUSE_INSTITUTE_PURPOSE_COPY =
  "Prepare House Institute architecture — research and publications documented, not live outputs yet.";
export const HOUSE_INSTITUTE_RESERVED_COPY =
  "Architecture prepared. House Institute research and publications are not enabled yet.";

export {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
};

export type PreparedInstituteProgramId =
  | "research"
  | "reports"
  | "observatory"
  | "relationship-index";

export type PreparedInstituteProgramDefinition = {
  id: PreparedInstituteProgramId;
  title: string;
  description: string;
  programOrder: number;
};

export const PREPARED_RESEARCH_PROGRAMS: PreparedInstituteProgramDefinition[] = [
  {
    id: "research",
    title: "Research",
    description: "Research — relationship inquiry architecture at The BamSignal House™.",
    programOrder: 1
  },
  {
    id: "observatory",
    title: "Observatory",
    description: "Observatory — longitudinal relationship observation reserved, not dashboards.",
    programOrder: 3
  },
  {
    id: "relationship-index",
    title: "Relationship Index",
    description: "Relationship Index — index architecture prepared, not rankings theatre.",
    programOrder: 4
  }
];

export const PREPARED_PUBLICATIONS: PreparedInstituteProgramDefinition[] = [
  {
    id: "reports",
    title: "Reports",
    description: "Reports — published findings architecture at the House, not press releases.",
    programOrder: 2
  }
];

export const PREPARED_HOUSE_INSTITUTE_PROGRAMS: PreparedInstituteProgramDefinition[] = [
  ...PREPARED_RESEARCH_PROGRAMS,
  ...PREPARED_PUBLICATIONS
].sort((a, b) => a.programOrder - b.programOrder);

export function getPreparedHouseInstituteProgram(
  programId: PreparedInstituteProgramId
): PreparedInstituteProgramDefinition | undefined {
  return PREPARED_HOUSE_INSTITUTE_PROGRAMS.find((program) => program.id === programId);
}
