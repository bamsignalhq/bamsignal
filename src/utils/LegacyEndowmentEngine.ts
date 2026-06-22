import {
  FUTURE_READY_ENDOWMENT_CAPABILITIES,
  PREPARED_COMMUNITY_IMPACTS,
  PREPARED_ENDOWMENT_PROGRAMS,
  PREPARED_IMPACT_FUNDS
} from "../constants/legacyEndowment";
import {
  listArchitectureCommunityImpacts,
  listArchitectureEndowmentPrograms,
  listArchitectureImpactFunds,
  type CommunityImpactViewModel,
  type EndowmentProgramViewModel,
  type ImpactFundViewModel
} from "./legacyEndowmentLogic";

export type LegacyEndowmentBundle = {
  programs: EndowmentProgramViewModel[];
  funds: ImpactFundViewModel[];
  communityImpacts: CommunityImpactViewModel[];
  programCount: number;
  fundCount: number;
  communityImpactCount: number;
  futureReadyCapabilityCount: number;
};

export function getLegacyEndowmentBundle(): LegacyEndowmentBundle {
  return {
    programs: listArchitectureEndowmentPrograms(),
    funds: listArchitectureImpactFunds(),
    communityImpacts: listArchitectureCommunityImpacts(),
    programCount: PREPARED_ENDOWMENT_PROGRAMS.length,
    fundCount: PREPARED_IMPACT_FUNDS.length,
    communityImpactCount: PREPARED_COMMUNITY_IMPACTS.length,
    futureReadyCapabilityCount: FUTURE_READY_ENDOWMENT_CAPABILITIES.length
  };
}

export function getEndowmentProgram(programId: string): EndowmentProgramViewModel | null {
  return listArchitectureEndowmentPrograms().find((program) => program.id === programId) ?? null;
}
