/** BamSignal Academy™ — education arm architecture. */

import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const BAMSIGNAL_ACADEMY_TITLE = "BamSignal Academy™";
export const BAMSIGNAL_ACADEMY_LABEL = "BamSignal Academy";
export const LEARNING_LABEL = "Learning";
export const GROWING_TOGETHER_LABEL = "Growing Together";
export const RELATIONSHIP_WISDOM_LABEL = "Relationship Wisdom";
export const BUILDING_STRONG_FAMILIES_LABEL = "Building Strong Families";

export const BAMSIGNAL_ACADEMY_SUBCOPY =
  "The education arm — learning and growing together, never training or course catalogs.";
export const BAMSIGNAL_ACADEMY_PURPOSE_COPY =
  "Prepare the education arm — relationship wisdom and building strong families with dignity.";
export const BAMSIGNAL_ACADEMY_RESERVED_COPY =
  "Architecture prepared. Video courses, certificates, and workshops are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const BAMSIGNAL_ACADEMY_AVOID_COPY = ["Training", "Lessons", "Course Catalog"] as const;

export { UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedAcademyProgramId =
  | "dating-intentionally"
  | "communication-skills"
  | "conflict-resolution"
  | "faith-relationships"
  | "marriage-preparation"
  | "emotional-intelligence"
  | "family-building"
  | "parenting"
  | "diaspora-relationships"
  | "financial-compatibility";

export type PreparedAcademyProgramDefinition = {
  id: PreparedAcademyProgramId;
  title: string;
  description: string;
};

export const PREPARED_ACADEMY_PROGRAMS: PreparedAcademyProgramDefinition[] = [
  {
    id: "dating-intentionally",
    title: "Dating Intentionally",
    description: "Intentional dating — relationship wisdom, not lessons or training."
  },
  {
    id: "communication-skills",
    title: "Communication Skills",
    description: "Communication for growing together — dignity-first learning."
  },
  {
    id: "conflict-resolution",
    title: "Conflict Resolution",
    description: "Conflict resolution — building strong families with care."
  },
  {
    id: "faith-relationships",
    title: "Faith & Relationships",
    description: "Faith and relationships — respectful learning pathways."
  },
  {
    id: "marriage-preparation",
    title: "Marriage Preparation",
    description: "Marriage preparation — relationship wisdom for couples."
  },
  {
    id: "emotional-intelligence",
    title: "Emotional Intelligence",
    description: "Emotional intelligence — learning without surveillance."
  },
  {
    id: "family-building",
    title: "Family Building",
    description: "Family building — building strong families for generations."
  },
  {
    id: "parenting",
    title: "Parenting",
    description: "Parenting pathways — growing together as a family."
  },
  {
    id: "diaspora-relationships",
    title: "Diaspora Relationships",
    description: "Diaspora relationships — Journey Across Borders with learning dignity."
  },
  {
    id: "financial-compatibility",
    title: "Financial Compatibility",
    description: "Financial compatibility — practical wisdom, never a course catalog."
  }
];

export type LearningPathId = "foundation" | "marriage" | "family" | "faith-diaspora";

export type LearningPathDefinition = {
  id: LearningPathId;
  title: string;
  description: string;
  programIds: PreparedAcademyProgramId[];
};

export const LEARNING_PATHS: LearningPathDefinition[] = [
  {
    id: "foundation",
    title: "Foundation path",
    description: "Dating, communication, and emotional intelligence — learning first.",
    programIds: ["dating-intentionally", "communication-skills", "emotional-intelligence"]
  },
  {
    id: "marriage",
    title: "Marriage path",
    description: "Marriage preparation, conflict, and financial compatibility.",
    programIds: ["marriage-preparation", "conflict-resolution", "financial-compatibility"]
  },
  {
    id: "family",
    title: "Family path",
    description: "Family building and parenting — building strong families.",
    programIds: ["family-building", "parenting"]
  },
  {
    id: "faith-diaspora",
    title: "Faith & diaspora path",
    description: "Faith and diaspora relationships — relationship wisdom.",
    programIds: ["faith-relationships", "diaspora-relationships"]
  }
];

export type AcademyTimelineEntry = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export const ACADEMY_ARCHITECTURE_TIMELINE: AcademyTimelineEntry[] = [
  {
    id: "bsa_timeline_0",
    label: "Academy architecture prepared",
    recordedAt: "2026-05-01T00:00:00.000Z",
    note: "Education arm — not enabled yet."
  },
  {
    id: "bsa_timeline_1",
    label: "Programs and learning paths defined",
    recordedAt: "2026-06-01T00:00:00.000Z",
    note: "Ten programs — never a course catalog."
  },
  {
    id: "bsa_timeline_2",
    label: "Learning pathway reserved",
    recordedAt: "2026-07-01T00:00:00.000Z",
    note: "Growing together — no training framing."
  }
];

export type BamSignalAcademyFutureCapabilityId = "video-courses" | "certificates" | "workshops";

export const BAMSIGNAL_ACADEMY_FUTURE_CAPABILITIES: {
  id: BamSignalAcademyFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "video-courses",
    label: "Video courses",
    description: "Reserved — video learning with dignity-first design."
  },
  {
    id: "certificates",
    label: "Certificates",
    description: "Reserved — certificates for relationship wisdom pathways."
  },
  {
    id: "workshops",
    label: "Workshops",
    description: "Reserved — workshops — never training or lessons framing."
  }
];

export function getPreparedAcademyProgram(
  programId: PreparedAcademyProgramId
): PreparedAcademyProgramDefinition | undefined {
  return PREPARED_ACADEMY_PROGRAMS.find((program) => program.id === programId);
}
