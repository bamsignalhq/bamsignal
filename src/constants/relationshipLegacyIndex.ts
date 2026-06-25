/** Relationship Legacy Index™ — permanent archive identity for successful journeys. */

export const RELATIONSHIP_LEGACY_INDEX_TITLE = "Relationship Legacy Index™";
export const LEGACY_FAMILIES_TITLE = "Legacy Families™";
export const LEGACY_STATUS_LABEL = "Legacy Status";
export const LEGACY_FAMILY_CHILDREN_LABEL = "Children";
export const LEGACY_FAMILY_CURRENT_COUNTRY_LABEL = "Current Country";
export const LEGACY_FAMILY_PRIVACY_COPY =
  "No names. No sensitive data. Just relationship milestones.";
export const CELEBRATING_YOUR_JOURNEY = "Celebrating Your Journey";
export const LEGACY_INDEX_SUBCOPY =
  "Permanent archive identity for successful journeys. Relationship history preserved indefinitely.";

export type LegacyStatusId =
  | "active-legacy"
  | "legacy-family"
  | "legacy-archive"
  | "anniversary-legacy"
  | "golden-legacy";

export type LegacyStatusDefinition = {
  id: LegacyStatusId;
  label: string;
  order: number;
};

export const LEGACY_STATUS_DEFINITIONS: LegacyStatusDefinition[] = [
  { id: "active-legacy", label: "Active Legacy", order: 10 },
  { id: "legacy-family", label: "Legacy Family", order: 20 },
  { id: "legacy-archive", label: "Legacy Archive", order: 30 },
  { id: "anniversary-legacy", label: "Anniversary Legacy", order: 40 },
  { id: "golden-legacy", label: "Golden Legacy", order: 50 }
];

export const LEGACY_STATUS_LABELS: Record<LegacyStatusId, string> = Object.fromEntries(
  LEGACY_STATUS_DEFINITIONS.map((item) => [item.id, item.label])
) as Record<LegacyStatusId, string>;

export type LegacyTimelinePhaseId =
  | "met"
  | "relationship"
  | "engagement"
  | "marriage"
  | "anniversaries"
  | "family-milestones"
  | "legacy-archive";

export type LegacyTimelinePhaseDefinition = {
  id: LegacyTimelinePhaseId;
  label: string;
  order: number;
};

export const LEGACY_TIMELINE_PHASES: LegacyTimelinePhaseDefinition[] = [
  { id: "met", label: "Met", order: 10 },
  { id: "relationship", label: "Relationship", order: 20 },
  { id: "engagement", label: "Engagement", order: 30 },
  { id: "marriage", label: "Marriage", order: 40 },
  { id: "anniversaries", label: "Anniversaries", order: 50 },
  { id: "family-milestones", label: "Family Milestones", order: 60 },
  { id: "legacy-archive", label: "Legacy Archive", order: 70 }
];

/** Anniversary milestones shown in legacy profile summary. */
export const LEGACY_ANNIVERSARY_MILESTONE_IDS = [
  "first-anniversary",
  "five-years-together",
  "ten-years-together",
  "twenty-years-together",
  "silver-anniversary",
  "golden-anniversary"
] as const;

/** Reserved — not implemented. */
export const LEGACY_FAMILY_FUTURE_KINDS = [
  { id: "family-events", label: "Family events" },
  { id: "legacy-celebrations", label: "Legacy celebrations" },
  { id: "child-milestones", label: "Child milestones" }
] as const;

export type LegacyFamilyFutureKind = (typeof LEGACY_FAMILY_FUTURE_KINDS)[number]["id"];

/** Reserved — not implemented. */
export const LEGACY_INDEX_FUTURE_KINDS = [
  { id: "silver-anniversaries", label: "Silver anniversaries" },
  { id: "golden-anniversaries", label: "Golden anniversaries" },
  { id: "legacy-events", label: "Legacy events" },
  { id: "couple-celebrations", label: "Couple celebrations" },
  { id: "family-milestones", label: "Family milestones" }
] as const;

export type LegacyIndexFutureKind = (typeof LEGACY_INDEX_FUTURE_KINDS)[number]["id"];

export const EMPTY_LEGACY_INDEX_FILTERS = {
  query: "",
  marriageYear: "",
  consultant: "",
  storyCategory: "all" as import("./journeyStoryCategories").JourneyStoryCategoryId | "all",
  legacyStatus: "all" as LegacyStatusId | "all",
  city: "",
  country: ""
};

export type LegacyIndexFilters = typeof EMPTY_LEGACY_INDEX_FILTERS;

export function getLegacyStatusDefinition(id: LegacyStatusId) {
  return LEGACY_STATUS_DEFINITIONS.find((item) => item.id === id) ?? null;
}
