/** House Membership™ — membership levels at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const HOUSE_MEMBERSHIP_TITLE = "House Membership™";
export const HOUSE_MEMBERSHIP_LABEL = "House Membership";
export const MEMBERSHIP_TIER_LABEL = "Membership Tier";
export const HOUSE_PRIVILEGES_LABEL = "House Privileges";

export const HOUSE_MEMBERSHIP_SUBCOPY =
  "House Membership™ at The BamSignal House™ — Community, Premium, Circle, Legacy, and Founders Circle reserved with dignity.";
export const HOUSE_MEMBERSHIP_PURPOSE_COPY =
  "Prepare House Membership architecture — tiers and privileges documented, not billing or enrollment yet.";
export const HOUSE_MEMBERSHIP_RESERVED_COPY =
  "Architecture prepared. House Membership tiers and privileges are not enabled yet.";

export { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL, GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedMembershipLevelId =
  | "community"
  | "premium"
  | "circle"
  | "legacy"
  | "founders-circle";

export type PreparedMembershipLevelDefinition = {
  id: PreparedMembershipLevelId;
  title: string;
  description: string;
  tierOrder: number;
};

export const PREPARED_MEMBERSHIP_LEVELS: PreparedMembershipLevelDefinition[] = [
  {
    id: "community",
    title: "Community",
    description: "Community — entry House Membership with Gather access architecture.",
    tierOrder: 1
  },
  {
    id: "premium",
    title: "Premium",
    description: "Premium — enhanced House access and experiences reserved.",
    tierOrder: 2
  },
  {
    id: "circle",
    title: "Circle",
    description: "Circle — inner-circle membership at The BamSignal House™.",
    tierOrder: 3
  },
  {
    id: "legacy",
    title: "Legacy",
    description: "Legacy — multi-generational House privileges architecture.",
    tierOrder: 4
  },
  {
    id: "founders-circle",
    title: "Founders Circle",
    description: "Founders Circle — pioneering households honoured, not headquarters clubs.",
    tierOrder: 5
  }
];

export type PreparedHousePrivilegeDefinition = {
  id: PreparedMembershipLevelId;
  title: string;
  description: string;
  levelTitle: string;
};

export const PREPARED_HOUSE_PRIVILEGES: PreparedHousePrivilegeDefinition[] =
  PREPARED_MEMBERSHIP_LEVELS.map((level) => ({
    id: level.id,
    title: `${level.title} privileges`,
    levelTitle: level.title,
    description: `${level.title} privileges — House access architecture reserved, not activated yet.`
  }));

export function getPreparedMembershipLevel(
  levelId: PreparedMembershipLevelId
): PreparedMembershipLevelDefinition | undefined {
  return PREPARED_MEMBERSHIP_LEVELS.find((level) => level.id === levelId);
}

export function getPreparedHousePrivilege(
  levelId: PreparedMembershipLevelId
): PreparedHousePrivilegeDefinition | undefined {
  return PREPARED_HOUSE_PRIVILEGES.find((privilege) => privilege.id === levelId);
}
