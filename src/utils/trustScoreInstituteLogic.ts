import type {
  PreparedLegacyTrustDefinition,
  PreparedLegacyTrustId,
  PreparedProfessionalTrustBadgeDefinition,
  PreparedProfessionalTrustBadgeId,
  PreparedTrustMilestoneDefinition,
  PreparedTrustMilestoneId,
  PreparedTrustScoreLevelDefinition,
  PreparedTrustScoreLevelId,
  TrustTimelineEntry
} from "../constants/trustScoreInstitute";
import {
  LEGACY_STATUS_LABEL,
  MILESTONES_LABEL,
  PREPARED_LEGACY_TRUST_PROFILES,
  PREPARED_PROFESSIONAL_TRUST_BADGES,
  PREPARED_TRUST_MILESTONES,
  PREPARED_TRUST_SCORE_LEVELS,
  PREPARED_TRUST_TIMELINE_ENTRIES,
  PROFESSIONAL_CONTRIBUTIONS_LABEL,
  TRUST_JOURNEY_LABEL,
  YEARS_ACTIVE_LABEL
} from "../constants/trustScoreInstitute";

export type TrustScoreLevelViewModel = {
  id: PreparedTrustScoreLevelId;
  title: string;
  description: string;
  trustJourney: string;
  yearsActive: string;
  milestonesLabel: string;
  contributions: string;
  legacyStatus: string;
  statusLabel: string;
};

export type ProfessionalTrustBadgeViewModel = {
  id: PreparedProfessionalTrustBadgeId;
  name: string;
  title: string;
  focus: string;
  levelTitle: string;
  yearsActive: string;
  contributions: string;
  statusLabel: string;
};

export type TrustTimelineCardViewModel = {
  levelId: PreparedTrustScoreLevelId;
  levelTitle: string;
  trustJourneyLabel: string;
  entries: TrustTimelineEntry[];
  statusLabel: string;
};

export type TrustMilestoneViewModel = {
  id: PreparedTrustMilestoneId;
  title: string;
  description: string;
  levelTitle: string;
  recordedAt: string;
  statusLabel: string;
};

export type LegacyTrustViewModel = {
  id: PreparedLegacyTrustId;
  title: string;
  statusSummary: string;
  levelTitle: string;
  journeyNote: string;
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
    trustJourney: level.trustJourneySummary,
    yearsActive: level.yearsActiveReserved,
    milestonesLabel: `${MILESTONES_LABEL} reserved`,
    contributions: level.contributionsSummary,
    legacyStatus: level.legacyStatusSummary,
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
    yearsActive: badge.yearsActiveReserved,
    contributions: badge.contributionsSummary,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildTrustTimelineCardViewModel(levelId: PreparedTrustScoreLevelId): TrustTimelineCardViewModel {
  const level = PREPARED_TRUST_SCORE_LEVELS.find((item) => item.id === levelId);
  return {
    levelId,
    levelTitle: level?.title ?? levelId,
    trustJourneyLabel: TRUST_JOURNEY_LABEL,
    entries: PREPARED_TRUST_TIMELINE_ENTRIES.filter((entry) => entry.levelId === levelId),
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildTrustMilestoneViewModel(
  milestone: PreparedTrustMilestoneDefinition
): TrustMilestoneViewModel {
  const level = PREPARED_TRUST_SCORE_LEVELS.find((item) => item.id === milestone.levelId);
  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    levelTitle: level?.title ?? milestone.levelId,
    recordedAt: milestone.recordedAt,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildLegacyTrustViewModel(profile: PreparedLegacyTrustDefinition): LegacyTrustViewModel {
  const level = PREPARED_TRUST_SCORE_LEVELS.find((item) => item.id === profile.levelId);
  return {
    id: profile.id,
    title: profile.title,
    statusSummary: profile.statusSummary,
    levelTitle: level?.title ?? profile.levelId,
    journeyNote: profile.journeyNote,
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

export function listArchitectureTrustMilestones(): TrustMilestoneViewModel[] {
  return [...PREPARED_TRUST_MILESTONES.map(buildTrustMilestoneViewModel)];
}

export function listArchitectureLegacyTrustProfiles(): LegacyTrustViewModel[] {
  return [...PREPARED_LEGACY_TRUST_PROFILES.map(buildLegacyTrustViewModel)];
}

export const TRUST_SCORE_DISPLAY_LABELS = {
  trustJourney: TRUST_JOURNEY_LABEL,
  yearsActive: YEARS_ACTIVE_LABEL,
  milestones: MILESTONES_LABEL,
  contributions: PROFESSIONAL_CONTRIBUTIONS_LABEL,
  legacyStatus: LEGACY_STATUS_LABEL
} as const;
