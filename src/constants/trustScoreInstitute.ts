/** Trust Score™ — professional trust level architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const TRUST_SCORE_TITLE = "Trust Score™";
export const TRUST_SCORE_LABEL = "Trust Score";
export const TRUST_LEVEL_LABEL = "Trust Level";
export const PROFESSIONAL_TRUST_BADGE_LABEL = "Professional Trust Badge";

export const TRUST_SCORE_NO_STARS_COPY = "No stars — trust is expressed through levels, not ratings.";
export const TRUST_SCORE_NO_LEADERBOARD_COPY = "No leaderboard — dignity over competition.";
export const TRUST_SCORE_NO_FIVE_STAR_COPY = "No 5-star ratings — earned standing, not review scores.";

export const TRUST_SCORE_SUBCOPY =
  "Professional trust levels — earned standing with dignity, never stars, ratings, or leaderboards.";
export const TRUST_SCORE_PURPOSE_COPY =
  "Prepare trust score architecture — levels and badges reserved, not scoring or ranking yet.";
export const TRUST_SCORE_RESERVED_COPY =
  "Architecture prepared. Trust levels, professional badges, and timelines are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedTrustScoreLevelId =
  | "emerging"
  | "established"
  | "trusted"
  | "premier"
  | "legacy-trusted";

export type PreparedTrustScoreLevelDefinition = {
  id: PreparedTrustScoreLevelId;
  title: string;
  description: string;
  badgeId: string;
};

export const PREPARED_TRUST_SCORE_LEVELS: PreparedTrustScoreLevelDefinition[] = [
  {
    id: "emerging",
    title: "Emerging",
    description: "Emerging — professionals building earned trust with care.",
    badgeId: "tscr_badge_emerging"
  },
  {
    id: "established",
    title: "Established",
    description: "Established — consistent stewardship recognised over time.",
    badgeId: "tscr_badge_established"
  },
  {
    id: "trusted",
    title: "Trusted",
    description: "Trusted — dependable guidance with community confidence.",
    badgeId: "tscr_badge_trusted"
  },
  {
    id: "premier",
    title: "Premier",
    description: "Premier — distinguished standing without competitive ranking.",
    badgeId: "tscr_badge_premier"
  },
  {
    id: "legacy-trusted",
    title: "Legacy Trusted",
    description: "Legacy Trusted — lasting impact across generations.",
    badgeId: "tscr_badge_legacy"
  }
];

export type PreparedProfessionalTrustBadgeId =
  | "tscr_badge_emerging"
  | "tscr_badge_established"
  | "tscr_badge_trusted"
  | "tscr_badge_premier"
  | "tscr_badge_legacy";

export type PreparedProfessionalTrustBadgeDefinition = {
  id: PreparedProfessionalTrustBadgeId;
  name: string;
  title: string;
  focus: string;
  levelId: PreparedTrustScoreLevelId;
};

export const PREPARED_PROFESSIONAL_TRUST_BADGES: PreparedProfessionalTrustBadgeDefinition[] =
  PREPARED_TRUST_SCORE_LEVELS.map((level) => ({
    id: level.badgeId as PreparedProfessionalTrustBadgeId,
    name: "Reserved professional",
    title: `${level.title} badge`,
    focus: level.description,
    levelId: level.id
  }));

export type TrustTimelineEntry = {
  id: string;
  levelId: PreparedTrustScoreLevelId;
  label: string;
  recordedAt: string;
  note?: string;
};

export const PREPARED_TRUST_TIMELINE_ENTRIES: TrustTimelineEntry[] = PREPARED_TRUST_SCORE_LEVELS.map(
  (level, index) => ({
    id: `tscr_timeline_${level.id}`,
    levelId: level.id,
    label: `${level.title} milestone reserved`,
    recordedAt: new Date(Date.UTC(2026, 0, 1 + index, 12, 0, 0)).toISOString(),
    note: "Architecture preview — not a live trust event yet."
  })
);

export function getPreparedTrustScoreLevel(
  levelId: PreparedTrustScoreLevelId
): PreparedTrustScoreLevelDefinition | undefined {
  return PREPARED_TRUST_SCORE_LEVELS.find((level) => level.id === levelId);
}

export function getTrustTimelineEntriesForLevel(levelId: PreparedTrustScoreLevelId): TrustTimelineEntry[] {
  return PREPARED_TRUST_TIMELINE_ENTRIES.filter((entry) => entry.levelId === levelId);
}
