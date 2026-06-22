import type {
  PreparedLegacyContributionDefinition,
  PreparedLegacyContributionId,
  PreparedLegacyProfessionalBadgeDefinition,
  PreparedLegacyProfessionalBadgeId,
  PreparedLegacyProfessionalDefinition,
  PreparedLegacyProfessionalId,
  PreparedLegacyRoleDefinition,
  PreparedLegacyRoleId,
  PreparedProfessionalJourneyDefinition,
  PreparedProfessionalJourneyId
} from "../constants/legacyProfessionals";
import {
  PREPARED_LEGACY_CONTRIBUTIONS,
  PREPARED_LEGACY_PROFESSIONAL_BADGES,
  PREPARED_LEGACY_PROFESSIONALS,
  PREPARED_LEGACY_ROLES,
  PREPARED_PROFESSIONAL_JOURNEYS,
  PROFESSIONAL_JOURNEY_LABEL
} from "../constants/legacyProfessionals";

export type LegacyRoleViewModel = {
  id: PreparedLegacyRoleId;
  title: string;
  description: string;
  statusLabel: string;
};

export type LegacyProfessionalViewModel = {
  id: PreparedLegacyProfessionalId;
  name: string;
  title: string;
  focus: string;
  roleTitle: string;
  stewardLabel: string;
  statusLabel: string;
};

export type ProfessionalJourneyViewModel = {
  id: PreparedProfessionalJourneyId;
  title: string;
  summary: string;
  roleTitle: string;
  journeyLabel: string;
  entries: PreparedProfessionalJourneyDefinition["entries"];
  statusLabel: string;
};

export type LegacyProfessionalBadgeViewModel = {
  id: PreparedLegacyProfessionalBadgeId;
  title: string;
  description: string;
  roleTitle: string;
  honorLabel: string;
  statusLabel: string;
};

export type LegacyContributionViewModel = {
  id: PreparedLegacyContributionId;
  title: string;
  summary: string;
  roleTitle: string;
  stewardLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildLegacyRoleViewModel(role: PreparedLegacyRoleDefinition): LegacyRoleViewModel {
  return {
    id: role.id,
    title: role.title,
    description: role.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildLegacyProfessionalViewModel(
  professional: PreparedLegacyProfessionalDefinition
): LegacyProfessionalViewModel {
  const role = PREPARED_LEGACY_ROLES.find((item) => item.id === professional.roleId);
  return {
    id: professional.id,
    name: professional.name,
    title: professional.title,
    focus: professional.focus,
    roleTitle: role?.title ?? professional.roleId,
    stewardLabel: professional.stewardLabel,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildProfessionalJourneyViewModel(
  journey: PreparedProfessionalJourneyDefinition
): ProfessionalJourneyViewModel {
  const role = PREPARED_LEGACY_ROLES.find((item) => item.id === journey.roleId);
  return {
    id: journey.id,
    title: journey.title,
    summary: journey.summary,
    roleTitle: role?.title ?? journey.roleId,
    journeyLabel: PROFESSIONAL_JOURNEY_LABEL,
    entries: journey.entries,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildLegacyProfessionalBadgeViewModel(
  badge: PreparedLegacyProfessionalBadgeDefinition
): LegacyProfessionalBadgeViewModel {
  const role = PREPARED_LEGACY_ROLES.find((item) => item.id === badge.roleId);
  return {
    id: badge.id,
    title: badge.title,
    description: badge.description,
    roleTitle: role?.title ?? badge.roleId,
    honorLabel: badge.honorLabel,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildLegacyContributionViewModel(
  contribution: PreparedLegacyContributionDefinition
): LegacyContributionViewModel {
  const role = PREPARED_LEGACY_ROLES.find((item) => item.id === contribution.roleId);
  return {
    id: contribution.id,
    title: contribution.title,
    summary: contribution.summary,
    roleTitle: role?.title ?? contribution.roleId,
    stewardLabel: contribution.stewardLabel,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureLegacyRoles(): LegacyRoleViewModel[] {
  return [...PREPARED_LEGACY_ROLES.map(buildLegacyRoleViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export function listArchitectureLegacyProfessionals(): LegacyProfessionalViewModel[] {
  return [...PREPARED_LEGACY_PROFESSIONALS.map(buildLegacyProfessionalViewModel)].sort((a, b) =>
    a.roleTitle.localeCompare(b.roleTitle)
  );
}

export function listArchitectureProfessionalJourneys(): ProfessionalJourneyViewModel[] {
  return [...PREPARED_PROFESSIONAL_JOURNEYS.map(buildProfessionalJourneyViewModel)].sort((a, b) =>
    a.roleTitle.localeCompare(b.roleTitle)
  );
}

export function listArchitectureLegacyProfessionalBadges(): LegacyProfessionalBadgeViewModel[] {
  return [...PREPARED_LEGACY_PROFESSIONAL_BADGES.map(buildLegacyProfessionalBadgeViewModel)].sort((a, b) =>
    a.roleTitle.localeCompare(b.roleTitle)
  );
}

export function listArchitectureLegacyContributions(): LegacyContributionViewModel[] {
  return [...PREPARED_LEGACY_CONTRIBUTIONS.map(buildLegacyContributionViewModel)].sort((a, b) =>
    a.roleTitle.localeCompare(b.roleTitle)
  );
}
