import type {
  GovernancePillarDefinition,
  GovernanceTimelineEntry,
  InstitutionCommitmentDefinition,
  StewardshipPrincipleDefinition
} from "../constants/governanceFramework";
import {
  GOVERNANCE_PILLARS,
  GOVERNANCE_TIMELINE_ENTRIES,
  INSTITUTION_COMMITMENTS,
  INSTITUTION_COMMITMENT_LABEL,
  STEWARDSHIP_LABEL,
  STEWARDSHIP_PRINCIPLES
} from "../constants/governanceFramework";
import type {
  GovernancePillarCardViewModel,
  GovernanceTimelineEntryViewModel,
  InstitutionCommitmentCardViewModel,
  StewardshipPrincipleCardViewModel
} from "../types/governanceFramework";

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildGovernancePillarCardViewModel(
  pillar: GovernancePillarDefinition
): GovernancePillarCardViewModel {
  return {
    id: pillar.id,
    title: pillar.title,
    description: pillar.description,
    pillarOrder: pillar.pillarOrder,
    stewardshipLabel: STEWARDSHIP_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildStewardshipPrincipleCardViewModel(
  principle: StewardshipPrincipleDefinition
): StewardshipPrincipleCardViewModel {
  return {
    id: principle.id,
    title: principle.title,
    description: principle.description,
    principleOrder: principle.principleOrder,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildGovernanceTimelineEntryViewModel(
  entry: GovernanceTimelineEntry
): GovernanceTimelineEntryViewModel {
  return { ...entry };
}

export function buildInstitutionCommitmentCardViewModel(
  commitment: InstitutionCommitmentDefinition
): InstitutionCommitmentCardViewModel {
  return {
    id: commitment.id,
    title: commitment.title,
    description: commitment.description,
    commitmentOrder: commitment.commitmentOrder,
    commitmentLabel: INSTITUTION_COMMITMENT_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureGovernancePillars(): GovernancePillarCardViewModel[] {
  return [...GOVERNANCE_PILLARS]
    .sort((a, b) => a.pillarOrder - b.pillarOrder)
    .map(buildGovernancePillarCardViewModel);
}

export function listArchitectureStewardshipPrinciples(): StewardshipPrincipleCardViewModel[] {
  return [...STEWARDSHIP_PRINCIPLES]
    .sort((a, b) => a.principleOrder - b.principleOrder)
    .map(buildStewardshipPrincipleCardViewModel);
}

export function listArchitectureGovernanceTimeline(): GovernanceTimelineEntryViewModel[] {
  return [...GOVERNANCE_TIMELINE_ENTRIES]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map(buildGovernanceTimelineEntryViewModel);
}

export function listArchitectureInstitutionCommitments(): InstitutionCommitmentCardViewModel[] {
  return [...INSTITUTION_COMMITMENTS]
    .sort((a, b) => a.commitmentOrder - b.commitmentOrder)
    .map(buildInstitutionCommitmentCardViewModel);
}
