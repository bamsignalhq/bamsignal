/** Learning Paths™ — guided relationship journeys architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const LEARNING_PATHS_TITLE = "Learning Paths™";
export const LEARNING_PATHS_LABEL = "Learning Paths";

export const LEARNING_PATHS_SUBCOPY =
  "Guided relationship journeys — learning and growing together, architecture prepared.";
export const LEARNING_PATHS_PURPOSE_COPY =
  "Prepare guided learning paths — relationship wisdom for every stage, not progress tracking yet.";
export const LEARNING_PATHS_RESERVED_COPY =
  "Architecture prepared. Certificates and progress tracking are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedLearningPathId =
  | "single-intentional"
  | "dating-with-purpose"
  | "preparing-for-marriage"
  | "building-strong-communication"
  | "faith-family"
  | "parenting"
  | "diaspora-couples"
  | "marriage-enrichment"
  | "second-chance-relationships";

export type PreparedLearningPathDefinition = {
  id: PreparedLearningPathId;
  title: string;
  description: string;
};

export const PREPARED_LEARNING_PATHS: PreparedLearningPathDefinition[] = [
  {
    id: "single-intentional",
    title: "Single & Intentional",
    description: "Single and intentional — relationship wisdom for purposeful living."
  },
  {
    id: "dating-with-purpose",
    title: "Dating With Purpose",
    description: "Dating with purpose — growing together with dignity."
  },
  {
    id: "preparing-for-marriage",
    title: "Preparing For Marriage",
    description: "Preparing for marriage — guided learning, not lessons."
  },
  {
    id: "building-strong-communication",
    title: "Building Strong Communication",
    description: "Building strong communication — foundation for every path."
  },
  {
    id: "faith-family",
    title: "Faith & Family",
    description: "Faith and family — respectful learning pathways."
  },
  {
    id: "parenting",
    title: "Parenting",
    description: "Parenting path — growing together as a family."
  },
  {
    id: "diaspora-couples",
    title: "Diaspora Couples",
    description: "Diaspora couples — Journey Across Borders with learning dignity."
  },
  {
    id: "marriage-enrichment",
    title: "Marriage Enrichment",
    description: "Marriage enrichment — relationship wisdom for couples."
  },
  {
    id: "second-chance-relationships",
    title: "Second-Chance Relationships",
    description: "Second-chance relationships — dignity-first guided path."
  }
];

export type PathMilestoneEntry = {
  id: string;
  pathId: PreparedLearningPathId;
  label: string;
  recordedAt: string;
  note?: string;
};

export type LearningPathsFutureCapabilityId = "certificates" | "progress-tracking";

export const LEARNING_PATHS_FUTURE_CAPABILITIES: {
  id: LearningPathsFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "certificates",
    label: "Certificates",
    description: "Reserved — path completion certificates with dignity."
  },
  {
    id: "progress-tracking",
    label: "Progress tracking",
    description: "Reserved — progress tracking — never surveillance framing."
  }
];

export function getPreparedLearningPath(
  pathId: PreparedLearningPathId
): PreparedLearningPathDefinition | undefined {
  return PREPARED_LEARNING_PATHS.find((path) => path.id === pathId);
}
