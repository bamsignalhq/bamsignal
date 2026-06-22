import { PREPARED_TRUST_SCORE_LEVELS } from "../constants/trustScoreInstitute";
import {
  listArchitectureProfessionalTrustBadges,
  listArchitectureTrustScoreLevels,
  listArchitectureTrustTimelineCards,
  type ProfessionalTrustBadgeViewModel,
  type TrustScoreLevelViewModel,
  type TrustTimelineCardViewModel
} from "./trustScoreInstituteLogic";

export type TrustScoreBundle = {
  levels: TrustScoreLevelViewModel[];
  badges: ProfessionalTrustBadgeViewModel[];
  timelines: TrustTimelineCardViewModel[];
  levelCount: number;
};

export function getTrustScoreBundle(): TrustScoreBundle {
  return {
    levels: listArchitectureTrustScoreLevels(),
    badges: listArchitectureProfessionalTrustBadges(),
    timelines: listArchitectureTrustTimelineCards(),
    levelCount: PREPARED_TRUST_SCORE_LEVELS.length
  };
}

export function getTrustScoreLevel(levelId: string): TrustScoreLevelViewModel | null {
  return listArchitectureTrustScoreLevels().find((level) => level.id === levelId) ?? null;
}
