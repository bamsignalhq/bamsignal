/** Premarital Journey™ — foundation-building architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const PREMARITAL_JOURNEY_TITLE = "Premarital Journey™";
export const PREMARITAL_JOURNEY_LABEL = "Premarital Journey";
export const PREMARITAL_MODULE_LABEL = "Module";

export const PREMARITAL_JOURNEY_HERO_COPY = "Preparing For Forever";
export const PREMARITAL_JOURNEY_FOUNDATION_COPY = "Building A Strong Foundation";

export const PREMARITAL_JOURNEY_SUBCOPY =
  "Preparing for forever — building a strong foundation with dignity, not marriage training.";
export const PREMARITAL_JOURNEY_PURPOSE_COPY =
  "Prepare premarital journey modules — relationship wisdom for couples, not lessons or training catalogs.";
export const PREMARITAL_JOURNEY_RESERVED_COPY =
  "Architecture prepared. Certificates and mentors are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedPremaritalModuleId =
  | "purpose"
  | "communication"
  | "conflict"
  | "finances"
  | "faith"
  | "family-expectations"
  | "children"
  | "relocation"
  | "intimacy"
  | "long-term-vision";

export type PreparedPremaritalModuleDefinition = {
  id: PreparedPremaritalModuleId;
  title: string;
  description: string;
  order: number;
};

export const PREPARED_PREMARITAL_MODULES: PreparedPremaritalModuleDefinition[] = [
  {
    id: "purpose",
    title: "Purpose",
    description: "Shared purpose — preparing for forever with intention.",
    order: 1
  },
  {
    id: "communication",
    title: "Communication",
    description: "Communication foundations — building a strong foundation together.",
    order: 2
  },
  {
    id: "conflict",
    title: "Conflict",
    description: "Healthy conflict — relationship wisdom before the wedding day.",
    order: 3
  },
  {
    id: "finances",
    title: "Finances",
    description: "Finances and partnership — practical preparation, not training.",
    order: 4
  },
  {
    id: "faith",
    title: "Faith",
    description: "Faith and values — respectful premarital framing.",
    order: 5
  },
  {
    id: "family-expectations",
    title: "Family Expectations",
    description: "Family expectations — growing together across households.",
    order: 6
  },
  {
    id: "children",
    title: "Children",
    description: "Children and family vision — preparing for forever as a team.",
    order: 7
  },
  {
    id: "relocation",
    title: "Relocation",
    description: "Relocation and diaspora life — Journey Across Borders preparation.",
    order: 8
  },
  {
    id: "intimacy",
    title: "Intimacy",
    description: "Intimacy and connection — dignity-first foundation building.",
    order: 9
  },
  {
    id: "long-term-vision",
    title: "Long-Term Vision",
    description: "Long-term vision — building a strong foundation for life together.",
    order: 10
  }
];

export type JourneyMilestoneEntry = {
  id: string;
  moduleId: PreparedPremaritalModuleId;
  label: string;
  recordedAt: string;
  note?: string;
};

export type PremaritalJourneyFutureCapabilityId = "certificates" | "mentors";

export const PREMARITAL_JOURNEY_FUTURE_CAPABILITIES: {
  id: PremaritalJourneyFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "certificates",
    label: "Certificates",
    description: "Reserved — journey completion certificates with dignity."
  },
  {
    id: "mentors",
    label: "Mentors",
    description: "Reserved — mentor pairing — never surveillance or training framing."
  }
];

export function getPreparedPremaritalModule(
  moduleId: PreparedPremaritalModuleId
): PreparedPremaritalModuleDefinition | undefined {
  return PREPARED_PREMARITAL_MODULES.find((module) => module.id === moduleId);
}
