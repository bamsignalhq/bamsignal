/** House Foundation™ — impact and scholarship programs at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const HOUSE_FOUNDATION_TITLE = "House Foundation™";
export const HOUSE_FOUNDATION_LABEL = "House Foundation";
export const SCHOLARSHIP_LABEL = "Scholarship";
export const IMPACT_LABEL = "Impact";

export const HOUSE_FOUNDATION_SUBCOPY =
  "House Foundation™ at The BamSignal House™ — Scholarships, Widows Support, Single Parents, Family Funds, and Community Programs reserved with dignity.";
export const HOUSE_FOUNDATION_PURPOSE_COPY =
  "Prepare House Foundation architecture — programs documented, not disbursements or applications yet.";
export const HOUSE_FOUNDATION_RESERVED_COPY =
  "Architecture prepared. House Foundation programs are not enabled yet.";

export {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
};

export type PreparedFoundationProgramId =
  | "scholarships"
  | "widows-support"
  | "single-parents"
  | "family-funds"
  | "community-programs";

export type PreparedFoundationProgramDefinition = {
  id: PreparedFoundationProgramId;
  title: string;
  description: string;
  programOrder: number;
};

export const PREPARED_SCHOLARSHIP_PROGRAMS: PreparedFoundationProgramDefinition[] = [
  {
    id: "scholarships",
    title: "Scholarships",
    description: "Scholarships — learning support architecture at The BamSignal House™.",
    programOrder: 1
  }
];

export const PREPARED_IMPACT_PROGRAMS: PreparedFoundationProgramDefinition[] = [
  {
    id: "widows-support",
    title: "Widows Support",
    description: "Widows Support — dignified care architecture, not charity spectacle.",
    programOrder: 2
  },
  {
    id: "single-parents",
    title: "Single Parents",
    description: "Single Parents — family stability support reserved at the House.",
    programOrder: 3
  },
  {
    id: "family-funds",
    title: "Family Funds",
    description: "Family Funds — multi-generational support architecture prepared.",
    programOrder: 4
  },
  {
    id: "community-programs",
    title: "Community Programs",
    description: "Community Programs — neighbourhood impact at the House, not donor theatre.",
    programOrder: 5
  }
];

export const PREPARED_HOUSE_FOUNDATION_PROGRAMS: PreparedFoundationProgramDefinition[] = [
  ...PREPARED_SCHOLARSHIP_PROGRAMS,
  ...PREPARED_IMPACT_PROGRAMS
].sort((a, b) => a.programOrder - b.programOrder);

export function getPreparedHouseFoundationProgram(
  programId: PreparedFoundationProgramId
): PreparedFoundationProgramDefinition | undefined {
  return PREPARED_HOUSE_FOUNDATION_PROGRAMS.find((program) => program.id === programId);
}
