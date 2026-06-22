import type {
  PreparedCommunityImpactDefinition,
  PreparedCommunityImpactId,
  PreparedEndowmentProgramDefinition,
  PreparedEndowmentProgramId,
  PreparedImpactFundDefinition,
  PreparedImpactFundId
} from "../constants/legacyEndowment";
import {
  COMMUNITY_IMPACT_LABEL,
  ENDOWMENT_PROGRAM_LABEL,
  IMPACT_FUND_LABEL,
  PREPARED_COMMUNITY_IMPACTS,
  PREPARED_ENDOWMENT_PROGRAMS,
  PREPARED_IMPACT_FUNDS
} from "../constants/legacyEndowment";

export type EndowmentProgramViewModel = {
  id: PreparedEndowmentProgramId;
  title: string;
  description: string;
  programLabel: string;
  statusLabel: string;
};

export type ImpactFundViewModel = {
  id: PreparedImpactFundId;
  title: string;
  description: string;
  programTitle: string;
  fundLabel: string;
  statusLabel: string;
};

export type CommunityImpactViewModel = {
  id: PreparedCommunityImpactId;
  title: string;
  description: string;
  programTitle: string;
  impactLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildEndowmentProgramViewModel(
  program: PreparedEndowmentProgramDefinition
): EndowmentProgramViewModel {
  return {
    id: program.id,
    title: program.title,
    description: program.description,
    programLabel: ENDOWMENT_PROGRAM_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildImpactFundViewModel(fund: PreparedImpactFundDefinition): ImpactFundViewModel {
  const program = PREPARED_ENDOWMENT_PROGRAMS.find((item) => item.id === fund.programId);
  return {
    id: fund.id,
    title: fund.title,
    description: fund.description,
    programTitle: program?.title ?? fund.programId,
    fundLabel: IMPACT_FUND_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildCommunityImpactViewModel(
  impact: PreparedCommunityImpactDefinition
): CommunityImpactViewModel {
  const program = PREPARED_ENDOWMENT_PROGRAMS.find((item) => item.id === impact.programId);
  return {
    id: impact.id,
    title: impact.title,
    description: impact.description,
    programTitle: program?.title ?? impact.programId,
    impactLabel: COMMUNITY_IMPACT_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureEndowmentPrograms(): EndowmentProgramViewModel[] {
  return [...PREPARED_ENDOWMENT_PROGRAMS.map(buildEndowmentProgramViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export function listArchitectureImpactFunds(): ImpactFundViewModel[] {
  return [...PREPARED_IMPACT_FUNDS.map(buildImpactFundViewModel)].sort((a, b) =>
    a.programTitle.localeCompare(b.programTitle)
  );
}

export function listArchitectureCommunityImpacts(): CommunityImpactViewModel[] {
  return [...PREPARED_COMMUNITY_IMPACTS.map(buildCommunityImpactViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}
