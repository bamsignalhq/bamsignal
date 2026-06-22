/** Relationship Lab™ — specialized research divisions architecture. */

import { INSIGHTS_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const RELATIONSHIP_LAB_TITLE = "Relationship Lab™";
export const RELATIONSHIP_LAB_SUBCOPY =
  "Research Lab — specialized divisions for understanding relationships with dignity.";
export const RESEARCH_LAB_LABEL = "Research Lab";

export const RELATIONSHIP_LAB_PURPOSE_COPY =
  "Prepare specialized research divisions — insights first, never testing or experiments on members.";
export const RELATIONSHIP_LAB_RESERVED_COPY =
  "Architecture prepared. Academic partnerships and research projects are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const RELATIONSHIP_LAB_AVOID_COPY = ["Testing", "Experiment"] as const;

export { INSIGHTS_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedResearchLabId =
  | "compatibility"
  | "communication"
  | "family-values"
  | "diaspora"
  | "marriage-success"
  | "faith-culture";

export type LabCategoryId =
  | "compatibility"
  | "communication"
  | "values"
  | "diaspora"
  | "marriage"
  | "faith-culture";

export type LabCategoryDefinition = {
  id: LabCategoryId;
  label: string;
  description: string;
};

export const LAB_CATEGORIES: LabCategoryDefinition[] = [
  {
    id: "compatibility",
    label: "Compatibility",
    description: "Compatibility insights — dignity-first, never a test."
  },
  {
    id: "communication",
    label: "Communication",
    description: "Communication research — understanding without surveillance."
  },
  {
    id: "values",
    label: "Family values",
    description: "Family values lab — consent-first research framing."
  },
  {
    id: "diaspora",
    label: "Diaspora",
    description: "Diaspora research — Journey Across Borders with care."
  },
  {
    id: "marriage",
    label: "Marriage success",
    description: "Marriage success pathways — human-first insights."
  },
  {
    id: "faith-culture",
    label: "Faith & culture",
    description: "Faith and culture — respectful research divisions."
  }
];

export type PreparedResearchLabDefinition = {
  id: PreparedResearchLabId;
  title: string;
  description: string;
  categoryId: LabCategoryId;
};

export const PREPARED_RESEARCH_LABS: PreparedResearchLabDefinition[] = [
  {
    id: "compatibility",
    title: "Compatibility Lab",
    description: "Compatibility insights — never a member testing experiment.",
    categoryId: "compatibility"
  },
  {
    id: "communication",
    title: "Communication Lab",
    description: "Communication patterns — understanding relationships with care.",
    categoryId: "communication"
  },
  {
    id: "family-values",
    title: "Family Values Lab",
    description: "Family values research — dignity and consent first.",
    categoryId: "values"
  },
  {
    id: "diaspora",
    title: "Diaspora Lab",
    description: "Diaspora families and corridors — specialized research division.",
    categoryId: "diaspora"
  },
  {
    id: "marriage-success",
    title: "Marriage Success Lab",
    description: "Marriage success insights — never popularity scoring.",
    categoryId: "marriage"
  },
  {
    id: "faith-culture",
    title: "Faith & Culture Lab",
    description: "Faith and culture — respectful specialized research.",
    categoryId: "faith-culture"
  }
];

export type LabTimelineEntry = {
  id: string;
  labId: PreparedResearchLabId;
  label: string;
  recordedAt: string;
  note?: string;
};

export type RelationshipLabFutureCapabilityId = "academic-partnerships" | "research-projects";

export const RELATIONSHIP_LAB_FUTURE_CAPABILITIES: {
  id: RelationshipLabFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "academic-partnerships",
    label: "Academic partnerships",
    description: "Reserved — university and academic research partnerships."
  },
  {
    id: "research-projects",
    label: "Research projects",
    description: "Reserved — formal research projects with consent and dignity."
  }
];

export function getLabCategory(categoryId: LabCategoryId): LabCategoryDefinition | undefined {
  return LAB_CATEGORIES.find((category) => category.id === categoryId);
}
