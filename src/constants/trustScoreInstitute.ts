/** Trust Score™ — long-term reputation and trust architecture. */

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
export const TRUST_MILESTONE_LABEL = "Trust Milestone";
export const LEGACY_TRUST_LABEL = "Legacy Trust";

export const TRUST_JOURNEY_LABEL = "Trust Journey";
export const YEARS_ACTIVE_LABEL = "Years Active";
export const MILESTONES_LABEL = "Milestones";
export const PROFESSIONAL_CONTRIBUTIONS_LABEL = "Professional Contributions";
export const LEGACY_STATUS_LABEL = "Legacy Status";

export const TRUST_SCORE_GOOD_COPY = [
  "Trust Journey",
  "Trusted",
  "Premier",
  "Legacy Trusted"
] as const;

export const TRUST_SCORE_FORBIDDEN_COPY = ["Rating", "Stars", "Leaderboard", "Popularity"] as const;

export const TRUST_SCORE_NO_STARS_COPY = "No stars — trust is expressed through levels, not ratings.";
export const TRUST_SCORE_NO_LEADERBOARD_COPY = "No leaderboard — dignity over competition.";
export const TRUST_SCORE_NO_FIVE_STAR_COPY = "No 5-star ratings — earned standing, not review scores.";
export const TRUST_SCORE_NO_POPULARITY_COPY = "No popularity — reputation over visibility.";

export const TRUST_SCORE_SUBCOPY =
  "Long-term professional reputation — earned standing with dignity, never stars, ratings, leaderboards, or popularity.";
export const TRUST_SCORE_PURPOSE_COPY =
  "Prepare long-term reputation and trust system — levels, journeys, and milestones reserved, not scoring yet.";
export const TRUST_SCORE_RESERVED_COPY =
  "Architecture prepared. Trust journeys, milestones, contributions, and legacy status are not enabled yet.";
export const TRUST_SCORE_FUTURE_READY_COPY =
  "Future-ready capabilities documented only — licensing, certifications, peer recognition, and legacy awards are not implemented.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type FutureReadyTrustCapabilityId =
  | "licensing"
  | "certifications"
  | "peer-recognition"
  | "legacy-awards";

export type FutureReadyTrustCapabilityDefinition = {
  id: FutureReadyTrustCapabilityId;
  title: string;
  description: string;
};

export const FUTURE_READY_TRUST_CAPABILITIES: FutureReadyTrustCapabilityDefinition[] = [
  {
    id: "licensing",
    title: "Licensing",
    description: "Professional licensing verification — architecture reserved, not implemented."
  },
  {
    id: "certifications",
    title: "Certifications",
    description: "Certification records — architecture reserved, not implemented."
  },
  {
    id: "peer-recognition",
    title: "Peer recognition",
    description: "Peer recognition signals — architecture reserved, not implemented."
  },
  {
    id: "legacy-awards",
    title: "Legacy awards",
    description: "Legacy awards and honours — architecture reserved, not implemented."
  }
];

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
  milestoneId: string;
  legacyId: string;
  trustJourneySummary: string;
  yearsActiveReserved: string;
  contributionsSummary: string;
  legacyStatusSummary: string;
};

export const PREPARED_TRUST_SCORE_LEVELS: PreparedTrustScoreLevelDefinition[] = [
  {
    id: "emerging",
    title: "Emerging",
    description: "Emerging — professionals building earned trust with care.",
    badgeId: "tscr_badge_emerging",
    milestoneId: "tscr_milestone_emerging",
    legacyId: "tscr_legacy_emerging",
    trustJourneySummary: "Trust Journey begins — standing earned over time.",
    yearsActiveReserved: "Years Active reserved",
    contributionsSummary: "Professional Contributions building",
    legacyStatusSummary: "Legacy Status not yet reached"
  },
  {
    id: "established",
    title: "Established",
    description: "Established — consistent stewardship recognised over time.",
    badgeId: "tscr_badge_established",
    milestoneId: "tscr_milestone_established",
    legacyId: "tscr_legacy_established",
    trustJourneySummary: "Trust Journey progressing — dependable presence.",
    yearsActiveReserved: "Years Active reserved",
    contributionsSummary: "Professional Contributions recognised",
    legacyStatusSummary: "Legacy Status forming"
  },
  {
    id: "trusted",
    title: "Trusted",
    description: "Trusted — dependable guidance with community confidence.",
    badgeId: "tscr_badge_trusted",
    milestoneId: "tscr_milestone_trusted",
    legacyId: "tscr_legacy_trusted",
    trustJourneySummary: "Trusted standing on the Trust Journey.",
    yearsActiveReserved: "Years Active reserved",
    contributionsSummary: "Professional Contributions valued",
    legacyStatusSummary: "Legacy Status growing"
  },
  {
    id: "premier",
    title: "Premier",
    description: "Premier — distinguished standing without competitive ranking.",
    badgeId: "tscr_badge_premier",
    milestoneId: "tscr_milestone_premier",
    legacyId: "tscr_legacy_premier",
    trustJourneySummary: "Premier chapter of the Trust Journey.",
    yearsActiveReserved: "Years Active reserved",
    contributionsSummary: "Professional Contributions distinguished",
    legacyStatusSummary: "Legacy Status approaching"
  },
  {
    id: "legacy-trusted",
    title: "Legacy Trusted",
    description: "Legacy Trusted — lasting impact across generations.",
    badgeId: "tscr_badge_legacy",
    milestoneId: "tscr_milestone_legacy",
    legacyId: "tscr_legacy_legacy",
    trustJourneySummary: "Legacy Trusted culmination of the Trust Journey.",
    yearsActiveReserved: "Years Active reserved",
    contributionsSummary: "Professional Contributions across generations",
    legacyStatusSummary: "Legacy Status honoured"
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
  yearsActiveReserved: string;
  contributionsSummary: string;
};

export const PREPARED_PROFESSIONAL_TRUST_BADGES: PreparedProfessionalTrustBadgeDefinition[] =
  PREPARED_TRUST_SCORE_LEVELS.map((level) => ({
    id: level.badgeId as PreparedProfessionalTrustBadgeId,
    name: "Reserved professional",
    title: `${level.title} badge`,
    focus: level.description,
    levelId: level.id,
    yearsActiveReserved: level.yearsActiveReserved,
    contributionsSummary: level.contributionsSummary
  }));

export type PreparedTrustMilestoneId =
  | "tscr_milestone_emerging"
  | "tscr_milestone_established"
  | "tscr_milestone_trusted"
  | "tscr_milestone_premier"
  | "tscr_milestone_legacy";

export type PreparedTrustMilestoneDefinition = {
  id: PreparedTrustMilestoneId;
  title: string;
  description: string;
  levelId: PreparedTrustScoreLevelId;
  recordedAt: string;
};

export const PREPARED_TRUST_MILESTONES: PreparedTrustMilestoneDefinition[] =
  PREPARED_TRUST_SCORE_LEVELS.map((level, index) => ({
    id: level.milestoneId as PreparedTrustMilestoneId,
    title: `${level.title} milestone`,
    description: `${MILESTONES_LABEL} reserved — ${level.trustJourneySummary}`,
    levelId: level.id,
    recordedAt: new Date(Date.UTC(2026, 0, 1 + index, 12, 0, 0)).toISOString()
  }));

export type PreparedLegacyTrustId =
  | "tscr_legacy_emerging"
  | "tscr_legacy_established"
  | "tscr_legacy_trusted"
  | "tscr_legacy_premier"
  | "tscr_legacy_legacy";

export type PreparedLegacyTrustDefinition = {
  id: PreparedLegacyTrustId;
  title: string;
  statusSummary: string;
  levelId: PreparedTrustScoreLevelId;
  journeyNote: string;
};

export const PREPARED_LEGACY_TRUST_PROFILES: PreparedLegacyTrustDefinition[] =
  PREPARED_TRUST_SCORE_LEVELS.map((level) => ({
    id: level.legacyId as PreparedLegacyTrustId,
    title: `${level.title} legacy profile`,
    statusSummary: level.legacyStatusSummary,
    levelId: level.id,
    journeyNote: level.trustJourneySummary
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
    label: `${TRUST_JOURNEY_LABEL}: ${level.title}`,
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
