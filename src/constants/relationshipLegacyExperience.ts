/** Relationship Legacy Experience™ — dignified legacy journeys. */

import type { LegacyStatusId } from "./relationshipLegacyIndex";

export const RELATIONSHIP_LEGACY_EXPERIENCE_TITLE = "Relationship Legacy Experience™";
export const RELATIONSHIP_LEGACY_EXPERIENCE_SUBCOPY =
  "Celebrating Your Story — legacy, journey, and family preserved with warmth.";
export const LEGACY_LABEL = "Legacy";
export const JOURNEY_LABEL = "Journey";
export const FAMILY_LABEL = "Family";
export const CELEBRATING_YOUR_STORY_LABEL = "Celebrating Your Story";

export const LEGACY_EXPERIENCE_STATUSES: LegacyStatusId[] = [
  "active-legacy",
  "legacy-family",
  "anniversary-legacy",
  "golden-legacy"
];

export type LegacyExperienceDisplayId =
  | "journey-id"
  | "met"
  | "relationship"
  | "engaged"
  | "married"
  | "anniversaries"
  | "family-milestones"
  | "legacy-quotes";

export type LegacyExperienceDisplayField = {
  id: LegacyExperienceDisplayId;
  label: string;
};

export const LEGACY_EXPERIENCE_DISPLAY_FIELDS: LegacyExperienceDisplayField[] = [
  { id: "journey-id", label: "Journey ID" },
  { id: "met", label: "Met" },
  { id: "relationship", label: "Relationship" },
  { id: "engaged", label: "Engaged" },
  { id: "married", label: "Married" },
  { id: "anniversaries", label: "Anniversaries" },
  { id: "family-milestones", label: "Family Milestones" },
  { id: "legacy-quotes", label: "Legacy Quotes" }
];

export function isLegacyExperienceStatus(status: LegacyStatusId): boolean {
  return LEGACY_EXPERIENCE_STATUSES.includes(status);
}
