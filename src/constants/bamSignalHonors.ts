/** BamSignal Honors™ — celebrating people building families and communities architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const BAMSIGNAL_HONORS_TITLE = "BamSignal Honors™";
export const BAMSIGNAL_HONORS_LABEL = "BamSignal Honors";
export const HONOR_CATEGORY_LABEL = "Honor Category";
export const LEGACY_AWARD_LABEL = "Legacy Award";
export const RECOGNITION_TIMELINE_LABEL = "Recognition Timeline";
export const CELEBRATING_LEGACY_LABEL = "Celebrating Legacy";

export const BAMSIGNAL_HONORS_GOOD_COPY = ["Honors", "Recognition", "Celebrating Legacy"] as const;

export const BAMSIGNAL_HONORS_FORBIDDEN_COPY = [
  "Award Show",
  "Celebrity Awards",
  "Competition"
] as const;

export const BAMSIGNAL_HONORS_SUBCOPY =
  "Celebrate people building families and communities — Honors and Recognition with dignity, never award shows or competitions.";
export const BAMSIGNAL_HONORS_PURPOSE_COPY =
  "Prepare honors architecture — categories, legacy awards, and recognition timelines reserved, not ceremonies yet.";
export const BAMSIGNAL_HONORS_RESERVED_COPY =
  "Architecture prepared. Honor categories, legacy awards, and recognition timelines are not enabled yet.";
export const BAMSIGNAL_HONORS_FUTURE_READY_COPY =
  "Future-ready capabilities documented only — annual ceremonies, documentaries, and legacy books are not implemented.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type FutureReadyHonorsCapabilityId = "annual-ceremonies" | "documentaries" | "legacy-books";

export type FutureReadyHonorsCapabilityDefinition = {
  id: FutureReadyHonorsCapabilityId;
  title: string;
  description: string;
};

export const FUTURE_READY_HONORS_CAPABILITIES: FutureReadyHonorsCapabilityDefinition[] = [
  {
    id: "annual-ceremonies",
    title: "Annual ceremonies",
    description: "Annual ceremonies — architecture reserved, not implemented."
  },
  {
    id: "documentaries",
    title: "Documentaries",
    description: "Documentaries — architecture reserved, not implemented."
  },
  {
    id: "legacy-books",
    title: "Legacy books",
    description: "Legacy books — architecture reserved, not implemented."
  }
];

export type PreparedHonorCategoryId =
  | "legacy-couples"
  | "family-builders"
  | "community-ambassadors"
  | "lifetime-contributors"
  | "legacy-professionals"
  | "founders-families"
  | "relationship-researchers"
  | "faith-leaders"
  | "marriage-mentors"
  | "diaspora-champions";

export type PreparedHonorCategoryDefinition = {
  id: PreparedHonorCategoryId;
  title: string;
  description: string;
  awardId: string;
  timelineId: string;
};

export const PREPARED_HONOR_CATEGORIES: PreparedHonorCategoryDefinition[] = [
  {
    id: "legacy-couples",
    title: "Legacy Couples",
    description: "Legacy Couples — celebrating lasting partnerships with dignity.",
    awardId: "bshn_award_legacy_couples",
    timelineId: "bshn_timeline_legacy_couples"
  },
  {
    id: "family-builders",
    title: "Family Builders",
    description: "Family Builders — honouring households that strengthen communities.",
    awardId: "bshn_award_family_builders",
    timelineId: "bshn_timeline_family_builders"
  },
  {
    id: "community-ambassadors",
    title: "Community Ambassadors",
    description: "Community Ambassadors — recognition for local relationship stewardship.",
    awardId: "bshn_award_community_ambassadors",
    timelineId: "bshn_timeline_community_ambassadors"
  },
  {
    id: "lifetime-contributors",
    title: "Lifetime Contributors",
    description: "Lifetime Contributors — multi-decade impact celebrated with respect.",
    awardId: "bshn_award_lifetime_contributors",
    timelineId: "bshn_timeline_lifetime_contributors"
  },
  {
    id: "legacy-professionals",
    title: "Legacy Professionals",
    description: "Legacy Professionals — trusted advisors honoured, not employee awards.",
    awardId: "bshn_award_legacy_professionals",
    timelineId: "bshn_timeline_legacy_professionals"
  },
  {
    id: "founders-families",
    title: "Founders Families",
    description: "Founders Families — pioneering households that shaped BamSignal communities.",
    awardId: "bshn_award_founders_families",
    timelineId: "bshn_timeline_founders_families"
  },
  {
    id: "relationship-researchers",
    title: "Relationship Researchers",
    description: "Relationship Researchers — wisdom and insight honoured with recognition.",
    awardId: "bshn_award_relationship_researchers",
    timelineId: "bshn_timeline_relationship_researchers"
  },
  {
    id: "faith-leaders",
    title: "Faith Leaders",
    description: "Faith Leaders — dignified celebration of faith and family guidance.",
    awardId: "bshn_award_faith_leaders",
    timelineId: "bshn_timeline_faith_leaders"
  },
  {
    id: "marriage-mentors",
    title: "Marriage Mentors",
    description: "Marriage Mentors — lifetime guidance recognised with Celebrating Legacy.",
    awardId: "bshn_award_marriage_mentors",
    timelineId: "bshn_timeline_marriage_mentors"
  },
  {
    id: "diaspora-champions",
    title: "Diaspora Champions",
    description: "Diaspora Champions — cross-border family builders honoured.",
    awardId: "bshn_award_diaspora_champions",
    timelineId: "bshn_timeline_diaspora_champions"
  }
];

export type PreparedLegacyAwardId =
  | "bshn_award_legacy_couples"
  | "bshn_award_family_builders"
  | "bshn_award_community_ambassadors"
  | "bshn_award_lifetime_contributors"
  | "bshn_award_legacy_professionals"
  | "bshn_award_founders_families"
  | "bshn_award_relationship_researchers"
  | "bshn_award_faith_leaders"
  | "bshn_award_marriage_mentors"
  | "bshn_award_diaspora_champions";

export type PreparedLegacyAwardDefinition = {
  id: PreparedLegacyAwardId;
  title: string;
  description: string;
  categoryId: PreparedHonorCategoryId;
};

export const PREPARED_LEGACY_AWARDS: PreparedLegacyAwardDefinition[] = PREPARED_HONOR_CATEGORIES.map(
  (category) => ({
    id: category.awardId as PreparedLegacyAwardId,
    title: `${category.title} award`,
    description: `${category.title} — Legacy Award honour reserved, not a celebrity award.`,
    categoryId: category.id
  })
);

export type RecognitionTimelineEntry = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export type PreparedRecognitionTimelineId =
  | "bshn_timeline_legacy_couples"
  | "bshn_timeline_family_builders"
  | "bshn_timeline_community_ambassadors"
  | "bshn_timeline_lifetime_contributors"
  | "bshn_timeline_legacy_professionals"
  | "bshn_timeline_founders_families"
  | "bshn_timeline_relationship_researchers"
  | "bshn_timeline_faith_leaders"
  | "bshn_timeline_marriage_mentors"
  | "bshn_timeline_diaspora_champions";

export type PreparedRecognitionTimelineDefinition = {
  id: PreparedRecognitionTimelineId;
  title: string;
  summary: string;
  categoryId: PreparedHonorCategoryId;
  entries: RecognitionTimelineEntry[];
};

export const PREPARED_RECOGNITION_TIMELINES: PreparedRecognitionTimelineDefinition[] =
  PREPARED_HONOR_CATEGORIES.map((category, index) => ({
    id: category.timelineId as PreparedRecognitionTimelineId,
    title: `${RECOGNITION_TIMELINE_LABEL}: ${category.title}`,
    summary: `Recognition timeline for ${category.title.toLowerCase()} — architecture preview.`,
    categoryId: category.id,
    entries: [
      {
        id: `bshn_timeline_entry_${category.id}`,
        label: `${CELEBRATING_LEGACY_LABEL} milestone reserved`,
        recordedAt: new Date(Date.UTC(2026, 0, 1 + index, 12, 0, 0)).toISOString(),
        note: "Architecture preview — recognition timeline not live yet."
      }
    ]
  }));

export function getPreparedHonorCategory(
  categoryId: PreparedHonorCategoryId
): PreparedHonorCategoryDefinition | undefined {
  return PREPARED_HONOR_CATEGORIES.find((category) => category.id === categoryId);
}
