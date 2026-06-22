/** Legacy Chair™ — future academic and institutional leadership architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const LEGACY_CHAIR_TITLE = "Legacy Chair™";
export const LEGACY_CHAIR_LABEL = "Legacy Chair";
export const CHAIR_CATEGORY_LABEL = "Chair Category";
export const RESEARCH_LEADERSHIP_LABEL = "Research Leadership";

export const LEGACY_CHAIR_SUBCOPY =
  "Prepare future academic and institutional leadership — endowed chairs reserved for relationship and family scholarship.";
export const LEGACY_CHAIR_PURPOSE_COPY =
  "Prepare academic and institutional leadership architecture — chair categories and research leadership reserved, not appointments yet.";
export const LEGACY_CHAIR_RESERVED_COPY =
  "Architecture prepared. Chair categories and research leadership roles are not enabled yet.";
export const LEGACY_CHAIR_FUTURE_READY_COPY =
  "Future-ready capabilities documented only — university partnerships, research institutes, and scholarships are not implemented.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type FutureReadyLegacyChairCapabilityId =
  | "university-partnerships"
  | "research-institutes"
  | "scholarships";

export type FutureReadyLegacyChairCapabilityDefinition = {
  id: FutureReadyLegacyChairCapabilityId;
  title: string;
  description: string;
};

export const FUTURE_READY_LEGACY_CHAIR_CAPABILITIES: FutureReadyLegacyChairCapabilityDefinition[] = [
  {
    id: "university-partnerships",
    title: "University partnerships",
    description: "University partnerships — architecture reserved, not implemented."
  },
  {
    id: "research-institutes",
    title: "Research institutes",
    description: "Research institutes — architecture reserved, not implemented."
  },
  {
    id: "scholarships",
    title: "Scholarships",
    description: "Scholarships — architecture reserved, not implemented."
  }
];

export type PreparedChairCategoryId =
  | "relationship-studies-chair"
  | "marriage-research-chair"
  | "african-family-studies-chair"
  | "diaspora-family-studies-chair"
  | "community-leadership-chair";

export type PreparedChairCategoryDefinition = {
  id: PreparedChairCategoryId;
  title: string;
  description: string;
  leadershipId: string;
};

export const PREPARED_CHAIR_CATEGORIES: PreparedChairCategoryDefinition[] = [
  {
    id: "relationship-studies-chair",
    title: "Relationship Studies Chair",
    description: "Relationship Studies Chair — academic leadership for understanding relationships.",
    leadershipId: "lgch_leadership_relationship_studies"
  },
  {
    id: "marriage-research-chair",
    title: "Marriage Research Chair",
    description: "Marriage Research Chair — institutional scholarship on lasting partnerships.",
    leadershipId: "lgch_leadership_marriage_research"
  },
  {
    id: "african-family-studies-chair",
    title: "African Family Studies Chair",
    description: "African Family Studies Chair — leadership for household and family scholarship.",
    leadershipId: "lgch_leadership_african_family"
  },
  {
    id: "diaspora-family-studies-chair",
    title: "Diaspora Family Studies Chair",
    description: "Diaspora Family Studies Chair — cross-border family research leadership.",
    leadershipId: "lgch_leadership_diaspora_family"
  },
  {
    id: "community-leadership-chair",
    title: "Community Leadership Chair",
    description: "Community Leadership Chair — institutional stewardship for community scholarship.",
    leadershipId: "lgch_leadership_community"
  }
];

export type PreparedResearchLeadershipId =
  | "lgch_leadership_relationship_studies"
  | "lgch_leadership_marriage_research"
  | "lgch_leadership_african_family"
  | "lgch_leadership_diaspora_family"
  | "lgch_leadership_community";

export type PreparedResearchLeadershipDefinition = {
  id: PreparedResearchLeadershipId;
  title: string;
  description: string;
  categoryId: PreparedChairCategoryId;
};

export const PREPARED_RESEARCH_LEADERSHIP: PreparedResearchLeadershipDefinition[] =
  PREPARED_CHAIR_CATEGORIES.map((category) => ({
    id: category.leadershipId as PreparedResearchLeadershipId,
    title: `${category.title} leadership`,
    description: `${category.title} — Research Leadership reserved, not appointed yet.`,
    categoryId: category.id
  }));

export function getPreparedChairCategory(
  categoryId: PreparedChairCategoryId
): PreparedChairCategoryDefinition | undefined {
  return PREPARED_CHAIR_CATEGORIES.find((category) => category.id === categoryId);
}
