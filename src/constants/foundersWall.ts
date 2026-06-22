/** Founders Wall™ — honoring the earliest Signal Concierge couples. */

import type { JourneyStoryCategoryId } from "./journeyStoryCategories";
import type { LegacyStatusId } from "./relationshipLegacyIndex";

export const FOUNDERS_WALL_TITLE = "Founders Wall™";
export const FOUNDERS_WALL_SUBCOPY =
  "Celebrating The First Stories — honoring the earliest Signal Concierge couples.";
export const LEGACY_COUPLES_LABEL = "Legacy Couples";
export const CELEBRATING_FIRST_STORIES_LABEL = "Celebrating The First Stories";
export const FOUNDERS_WALL_PURPOSE_COPY =
  "Honoring the earliest Signal Concierge couples.";

/** Reserved — never use in member-facing copy. */
export const FOUNDERS_WALL_AVOID_COPY = ["Leaderboard", "Top Customers"] as const;

export const FOUNDERS_WALL_RESERVED_COPY =
  "Architecture prepared. Public recognition and founder celebrations are not enabled yet.";

export type FoundersWallDisplayId =
  | "journey-id"
  | "year-met"
  | "marriage-year"
  | "story-categories"
  | "legacy-status";

export type FoundersWallDisplayField = {
  id: FoundersWallDisplayId;
  label: string;
};

export const FOUNDERS_WALL_DISPLAY_FIELDS: FoundersWallDisplayField[] = [
  { id: "journey-id", label: "Journey ID" },
  { id: "year-met", label: "Year Met" },
  { id: "marriage-year", label: "Marriage Year" },
  { id: "story-categories", label: "Story Categories" },
  { id: "legacy-status", label: "Legacy Status" }
];

export type FoundersCoupleSeed = {
  journeyId: string;
  founderOrder: number;
  yearMet?: string;
  marriageYear?: string;
  storyCategoryIds: JourneyStoryCategoryId[];
  legacyStatus: LegacyStatusId;
  honoredAt: string;
};
