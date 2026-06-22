import type {
  PreparedProfessionalTrustBadgeDefinition,
  PreparedProfessionalTrustBadgeId,
  PreparedTrustScoreLevelDefinition,
  PreparedTrustScoreLevelId,
  TrustTimelineEntry
} from "../constants/trustScoreInstitute";
import {
  PREPARED_PROFESSIONAL_TRUST_BADGES,
  PREPARED_TRUST_SCORE_LEVELS,
  PREPARED_TRUST_TIMELINE_ENTRIES
} from "../constants/trustScoreInstitute";

export type TrustScoreLevelViewModel = {
  id: PreparedTrustScoreLevelId;
  title: string;
  description: string;
  statusLabel: string;
};

export type ProfessionalTrustBadgeViewModel = {
  id: PreparedProfessionalTrustBadgeId;
  name: string;
  title: string;
  focus: string;
  levelTitle: string;
  statusLabel: string;
};

export type TrustTimelineCardViewModel = {
  levelId: PreparedTrustScoreLevelId;
  levelTitle: string;
  entries: TrustTimelineEntry[];
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildTrustScoreLevelViewModel(
  level: PreparedTrustScoreLevelDefinition
): TrustScoreLevelViewModel {
  return {
    id: level.id,
    title: level.title,
    description: level.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildProfessionalTrustBadgeViewModel(
  badge: PreparedProfessionalTrustBadgeDefinition
): ProfessionalTrustBadgeViewModel {
  const level = PREPARED_TRUST_SCORE_LEVELS.find((item) => item.id === badge.levelId);
  return {
    id: badge.id,
    name: badge.name,
    title: badge.title,
    focus: badge.focus,
    levelTitle: level?.title ?? badge.levelId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildTrustTimelineCardViewModel(levelId: PreparedTrustScoreLevelId): TrustTimelineCardViewModel {
  const level = PREPARED_TRUST_SCORE_LEVELS.find((item) => item.id === levelId);
  return {
    levelId,
    levelTitle: level?.title ?? levelId,
    entries: PREPARED_TRUST_TIMELINE_ENTRIES.filter((entry) => entry.levelId === levelId),
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureTrustScoreLevels(): TrustScoreLevelViewModel[] {
  return [...PREPARED_TRUST_SCORE_LEVELS.map(buildTrustScoreLevelViewModel)];
}

export function listArchitectureProfessionalTrustBadges(): ProfessionalTrustBadgeViewModel[] {
  return [...PREPARED_PROFESSIONAL_TRUST_BADGES.map(buildProfessionalTrustBadgeViewModel)];
}

export function listArchitectureTrustTimelineCards(): TrustTimelineCardViewModel[] {
  return PREPARED_TRUST_SCORE_LEVELS.map((level) => buildTrustTimelineCardViewModel(level.id));
}
