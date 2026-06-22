import { FUTURE_READY_TRUST_CAPABILITIES, PREPARED_TRUST_SCORE_LEVELS } from "../constants/trustScoreInstitute";
import {
  listArchitectureLegacyTrustProfiles,
  listArchitectureProfessionalTrustBadges,
  listArchitectureTrustMilestones,
  listArchitectureTrustScoreLevels,
  listArchitectureTrustTimelineCards,
  type LegacyTrustViewModel,
  type ProfessionalTrustBadgeViewModel,
  type TrustMilestoneViewModel,
  type TrustScoreLevelViewModel,
  type TrustTimelineCardViewModel
} from "./trustScoreInstituteLogic";

export type TrustScoreBundle = {
  levels: TrustScoreLevelViewModel[];
  badges: ProfessionalTrustBadgeViewModel[];
  timelines: TrustTimelineCardViewModel[];
  milestones: TrustMilestoneViewModel[];
  legacyProfiles: LegacyTrustViewModel[];
  levelCount: number;
  futureReadyCapabilityCount: number;
};

export function getTrustScoreBundle(): TrustScoreBundle {
  return {
    levels: listArchitectureTrustScoreLevels(),
    badges: listArchitectureProfessionalTrustBadges(),
    timelines: listArchitectureTrustTimelineCards(),
    milestones: listArchitectureTrustMilestones(),
    legacyProfiles: listArchitectureLegacyTrustProfiles(),
    levelCount: PREPARED_TRUST_SCORE_LEVELS.length,
    futureReadyCapabilityCount: FUTURE_READY_TRUST_CAPABILITIES.length
  };
}

export function getTrustScoreLevel(levelId: string): TrustScoreLevelViewModel | null {
  return listArchitectureTrustScoreLevels().find((level) => level.id === levelId) ?? null;
}
