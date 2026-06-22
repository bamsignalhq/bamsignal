/** Faith Network™ — respectful faith community architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const FAITH_NETWORK_TITLE = "Faith Network™";
export const FAITH_NETWORK_LABEL = "Faith Network";
export const FAITH_LEADER_LABEL = "Faith Leader";
export const FAITH_CATEGORY_LABEL = "Faith Category";

export const FAITH_NETWORK_DIVERSITY_COPY = "Respect diversity — no denominational superiority.";
export const FAITH_NETWORK_RESPECT_COPY = "Every tradition welcomed with dignity and care.";

export const FAITH_NETWORK_SUBCOPY =
  "Faith leaders and ministries — respectful counsel across traditions, never denominational ranking.";
export const FAITH_NETWORK_PURPOSE_COPY =
  "Prepare faith network architecture — diverse leaders reserved, not profiles or booking yet.";
export const FAITH_NETWORK_RESERVED_COPY =
  "Architecture prepared. Leader profiles and ministry connections are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedFaithCategoryId =
  | "christian-leaders"
  | "muslim-leaders"
  | "marriage-ministers"
  | "counselors"
  | "family-ministries";

export type PreparedFaithCategoryDefinition = {
  id: PreparedFaithCategoryId;
  title: string;
  description: string;
  leaderId: string;
};

export const PREPARED_FAITH_CATEGORIES: PreparedFaithCategoryDefinition[] = [
  {
    id: "christian-leaders",
    title: "Christian Leaders",
    description: "Christian leaders — respectful counsel with dignity, equal standing in the network.",
    leaderId: "fnw_leader_christian"
  },
  {
    id: "muslim-leaders",
    title: "Muslim Leaders",
    description: "Muslim leaders — community wisdom welcomed with equal respect.",
    leaderId: "fnw_leader_muslim"
  },
  {
    id: "marriage-ministers",
    title: "Marriage Ministers",
    description: "Marriage ministers — faith-informed guidance across traditions.",
    leaderId: "fnw_leader_marriage"
  },
  {
    id: "counselors",
    title: "Counselors",
    description: "Faith counselors — support with care, no tradition ranked above another.",
    leaderId: "fnw_leader_counselors"
  },
  {
    id: "family-ministries",
    title: "Family Ministries",
    description: "Family ministries — household faith support with respectful diversity.",
    leaderId: "fnw_leader_family"
  }
];

export type PreparedFaithLeaderId =
  | "fnw_leader_christian"
  | "fnw_leader_muslim"
  | "fnw_leader_marriage"
  | "fnw_leader_counselors"
  | "fnw_leader_family";

export type PreparedFaithLeaderDefinition = {
  id: PreparedFaithLeaderId;
  name: string;
  title: string;
  focus: string;
  categoryId: PreparedFaithCategoryId;
};

export const PREPARED_FAITH_LEADERS: PreparedFaithLeaderDefinition[] =
  PREPARED_FAITH_CATEGORIES.map((category) => ({
    id: category.leaderId as PreparedFaithLeaderId,
    name: "Reserved leader",
    title: `${category.title} profile`,
    focus: category.description,
    categoryId: category.id
  }));

export function getPreparedFaithCategory(
  categoryId: PreparedFaithCategoryId
): PreparedFaithCategoryDefinition | undefined {
  return PREPARED_FAITH_CATEGORIES.find((category) => category.id === categoryId);
}
