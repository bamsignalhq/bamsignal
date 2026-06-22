import type {
  CouncilResponsibilityDefinition,
  CouncilRoleDefinition,
  CouncilTimelineEntry,
  StewardshipCouncilPrincipleDefinition
} from "../constants/stewardshipCouncil";
import {
  COUNCIL_RESPONSIBILITIES,
  COUNCIL_ROLES,
  COUNCIL_TIMELINE_ENTRIES,
  COUNCIL_MEMBER_LABEL,
  COUNCIL_ROLE_LABEL,
  STEWARDSHIP_COUNCIL_PRINCIPLES,
  STEWARDSHIP_OATH_COPY,
  getCouncilRole
} from "../constants/stewardshipCouncil";
import type {
  CouncilMemberCardViewModel,
  CouncilResponsibilityCardViewModel,
  CouncilRoleCardViewModel,
  CouncilTimelineEntryViewModel,
  StewardshipOathCardViewModel
} from "../types/stewardshipCouncil";

const ARCHITECTURE_STATUS = "Architecture prepared — seat not assigned";

export function buildCouncilRoleCardViewModel(role: CouncilRoleDefinition): CouncilRoleCardViewModel {
  return {
    id: role.id,
    title: role.title,
    description: role.description,
    roleOrder: role.roleOrder,
    roleLabel: COUNCIL_ROLE_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildCouncilMemberCardViewModel(role: CouncilRoleDefinition): CouncilMemberCardViewModel {
  return {
    id: `stc_member_${role.id}`,
    roleId: role.id,
    roleTitle: role.title,
    seatLabel: `${COUNCIL_MEMBER_LABEL} reserved`,
    stewardshipNote: role.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildCouncilTimelineEntryViewModel(
  entry: CouncilTimelineEntry
): CouncilTimelineEntryViewModel {
  return { ...entry };
}

export function buildStewardshipOathCardViewModel(
  principles: StewardshipCouncilPrincipleDefinition[]
): StewardshipOathCardViewModel {
  return {
    oathCopy: STEWARDSHIP_OATH_COPY,
    principles: [...principles]
      .sort((left, right) => left.principleOrder - right.principleOrder)
      .map((principle) => ({
        id: principle.id,
        title: principle.title,
        description: principle.description,
        principleOrder: principle.principleOrder
      }))
  };
}

export function buildCouncilResponsibilityCardViewModel(
  responsibility: CouncilResponsibilityDefinition
): CouncilResponsibilityCardViewModel {
  const role = getCouncilRole(responsibility.roleId);
  return {
    id: responsibility.id,
    roleId: responsibility.roleId,
    roleTitle: role?.title ?? responsibility.roleId,
    title: responsibility.title,
    description: responsibility.description,
    responsibilityOrder: responsibility.responsibilityOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureCouncilRoles(): CouncilRoleCardViewModel[] {
  return [...COUNCIL_ROLES].sort((a, b) => a.roleOrder - b.roleOrder).map(buildCouncilRoleCardViewModel);
}

export function listArchitectureCouncilMembers(): CouncilMemberCardViewModel[] {
  return [...COUNCIL_ROLES].sort((a, b) => a.roleOrder - b.roleOrder).map(buildCouncilMemberCardViewModel);
}

export function listArchitectureCouncilTimeline(): CouncilTimelineEntryViewModel[] {
  return [...COUNCIL_TIMELINE_ENTRIES]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map(buildCouncilTimelineEntryViewModel);
}

export function listArchitectureCouncilResponsibilities(): CouncilResponsibilityCardViewModel[] {
  return [...COUNCIL_RESPONSIBILITIES]
    .sort((a, b) => a.responsibilityOrder - b.responsibilityOrder)
    .map(buildCouncilResponsibilityCardViewModel);
}

export function buildStewardshipOathViewModel(): StewardshipOathCardViewModel {
  return buildStewardshipOathCardViewModel(STEWARDSHIP_COUNCIL_PRINCIPLES);
}
