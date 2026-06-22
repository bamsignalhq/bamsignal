/** Relationship Index™ — yearly relationship indicators architecture. */

import { INSIGHTS_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const RELATIONSHIP_INDEX_TITLE = "Relationship Index™";
export const RELATIONSHIP_INDEX_LABEL = "Relationship Index";
export const COMMUNITY_STRENGTH_LABEL = "Community Strength";
export const FAMILY_VALUES_LABEL = "Family Values";

export const RELATIONSHIP_INDEX_SUBCOPY =
  "Yearly relationship indicators — dignity-first understanding, never ratings or leaderboards.";
export const RELATIONSHIP_INDEX_PURPOSE_COPY =
  "Prepare yearly relationship indicators — insights first, never scores or popularity rankings.";
export const RELATIONSHIP_INDEX_RESERVED_COPY =
  "Architecture prepared. Yearly reports and country comparisons are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const RELATIONSHIP_INDEX_AVOID_COPY = ["Ratings", "Scores", "Leaderboard"] as const;

export { INSIGHTS_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedRelationshipIndexId =
  | "nigerian-relationship"
  | "diaspora-family"
  | "marriage-confidence"
  | "family-values"
  | "community-strength";

export type RelationshipIndexKind = "general" | "community";

export type PreparedRelationshipIndexDefinition = {
  id: PreparedRelationshipIndexId;
  title: string;
  description: string;
  kind: RelationshipIndexKind;
  indicatorYear: number;
};

export const PREPARED_RELATIONSHIP_INDICES: PreparedRelationshipIndexDefinition[] = [
  {
    id: "nigerian-relationship",
    title: "Nigerian Relationship Index",
    description: "Yearly Nigerian relationship indicators — never ratings or scores.",
    kind: "general",
    indicatorYear: 2027
  },
  {
    id: "diaspora-family",
    title: "Diaspora Family Index",
    description: "Diaspora family indicators — Journey Across Borders with dignity.",
    kind: "community",
    indicatorYear: 2027
  },
  {
    id: "marriage-confidence",
    title: "Marriage Confidence Index",
    description: "Marriage confidence indicators — human-first, never a leaderboard.",
    kind: "general",
    indicatorYear: 2027
  },
  {
    id: "family-values",
    title: "Family Values Index",
    description: "Family values indicators — consent-first yearly framing.",
    kind: "general",
    indicatorYear: 2027
  },
  {
    id: "community-strength",
    title: "Community Strength Index",
    description: "Community strength indicators — local dignity, never popularity scoring.",
    kind: "community",
    indicatorYear: 2027
  }
];

export type RelationshipIndexTimelineEntry = {
  id: string;
  indexId: PreparedRelationshipIndexId;
  label: string;
  recordedAt: string;
  note?: string;
};

export type RelationshipIndexFutureCapabilityId = "yearly-reports" | "country-comparisons";

export const RELATIONSHIP_INDEX_FUTURE_CAPABILITIES: {
  id: RelationshipIndexFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "yearly-reports",
    label: "Yearly reports",
    description: "Reserved — annual relationship index reports with dignity."
  },
  {
    id: "country-comparisons",
    label: "Country comparisons",
    description: "Reserved — country comparisons — never leaderboard framing."
  }
];

export function getPreparedRelationshipIndex(
  indexId: PreparedRelationshipIndexId
): PreparedRelationshipIndexDefinition | undefined {
  return PREPARED_RELATIONSHIP_INDICES.find((index) => index.id === indexId);
}
