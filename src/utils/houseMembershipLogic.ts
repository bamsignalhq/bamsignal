import type {
  PreparedHousePrivilegeDefinition,
  PreparedMembershipLevelDefinition,
  PreparedMembershipLevelId
} from "../constants/houseMembership";
import {
  HOUSE_PRIVILEGES_LABEL,
  MEMBERSHIP_TIER_LABEL,
  PREPARED_HOUSE_PRIVILEGES,
  PREPARED_MEMBERSHIP_LEVELS
} from "../constants/houseMembership";

export type MembershipTierCardViewModel = {
  id: PreparedMembershipLevelId;
  title: string;
  description: string;
  tierLabel: string;
  tierOrder: number;
  statusLabel: string;
};

export type HousePrivilegesCardViewModel = {
  id: PreparedMembershipLevelId;
  title: string;
  description: string;
  levelTitle: string;
  privilegesLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildMembershipTierCardViewModel(
  level: PreparedMembershipLevelDefinition
): MembershipTierCardViewModel {
  return {
    id: level.id,
    title: level.title,
    description: level.description,
    tierLabel: MEMBERSHIP_TIER_LABEL,
    tierOrder: level.tierOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildHousePrivilegesCardViewModel(
  privilege: PreparedHousePrivilegeDefinition
): HousePrivilegesCardViewModel {
  return {
    id: privilege.id,
    title: privilege.title,
    description: privilege.description,
    levelTitle: privilege.levelTitle,
    privilegesLabel: HOUSE_PRIVILEGES_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureMembershipTiers(): MembershipTierCardViewModel[] {
  return [...PREPARED_MEMBERSHIP_LEVELS]
    .sort((a, b) => a.tierOrder - b.tierOrder)
    .map(buildMembershipTierCardViewModel);
}

export function listArchitectureHousePrivileges(): HousePrivilegesCardViewModel[] {
  return PREPARED_HOUSE_PRIVILEGES.map(buildHousePrivilegesCardViewModel);
}
