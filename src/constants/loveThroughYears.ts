/** Love Through The Years™ — journey memories preserved with warmth. */

import type { JourneyMilestoneId } from "./journeyMilestones";

export const LOVE_THROUGH_YEARS_TITLE = "Love Through The Years™";
export const LOVE_THROUGH_YEARS_SUBCOPY =
  "Journey Memories — celebrating your story across every chapter of your relationship.";
export const JOURNEY_MEMORIES_LABEL = "Journey Memories";
export const CELEBRATING_YOUR_STORY_LABEL = "Celebrating Your Story";

/** Reserved — never use in member-facing copy. */
export const LOVE_THROUGH_YEARS_AVOID_COPY = ["History", "Timeline Log"] as const;

export const LOVE_THROUGH_YEARS_RESERVED_COPY =
  "Architecture prepared. Photo books, anniversary books, documentaries, and family albums are not enabled yet.";
export const LOVE_THROUGH_YEARS_PHOTO_RESERVED_COPY =
  "Milestone photos are reserved — slots prepared without uploads or sensitive data.";

export type LoveThroughYearsPhaseId =
  | "met"
  | "relationship"
  | "engaged"
  | "married"
  | "first-anniversary"
  | "five-years"
  | "ten-years"
  | "twenty-years"
  | "golden-anniversary";

export type LoveThroughYearsPhaseDefinition = {
  id: LoveThroughYearsPhaseId;
  label: string;
  milestoneId: JourneyMilestoneId;
  order: number;
};

export const LOVE_THROUGH_YEARS_PHASES: LoveThroughYearsPhaseDefinition[] = [
  { id: "met", label: "Met", milestoneId: "met", order: 10 },
  { id: "relationship", label: "Relationship", milestoneId: "relationship-formed", order: 20 },
  { id: "engaged", label: "Engaged", milestoneId: "engaged", order: 30 },
  { id: "married", label: "Married", milestoneId: "married", order: 40 },
  { id: "first-anniversary", label: "1st Anniversary", milestoneId: "first-anniversary", order: 50 },
  { id: "five-years", label: "5 Years", milestoneId: "five-years-together", order: 60 },
  { id: "ten-years", label: "10 Years", milestoneId: "ten-years-together", order: 70 },
  { id: "twenty-years", label: "20 Years", milestoneId: "twenty-years-together", order: 80 },
  { id: "golden-anniversary", label: "Golden Anniversary", milestoneId: "golden-anniversary", order: 90 }
];

export const LOVE_THROUGH_YEARS_PHASE_LABELS: Record<LoveThroughYearsPhaseId, string> =
  Object.fromEntries(LOVE_THROUGH_YEARS_PHASES.map((phase) => [phase.id, phase.label])) as Record<
    LoveThroughYearsPhaseId,
    string
  >;

export type LoveThroughYearsFutureCapability =
  | "photo-books"
  | "anniversary-books"
  | "documentaries"
  | "family-albums";

export const LOVE_THROUGH_YEARS_FUTURE_CAPABILITIES: {
  id: LoveThroughYearsFutureCapability;
  label: string;
  description: string;
}[] = [
  {
    id: "photo-books",
    label: "Photo books",
    description: "Reserved — curated milestone photo books with consent."
  },
  {
    id: "anniversary-books",
    label: "Anniversary books",
    description: "Reserved — anniversary keepsakes celebrating your story."
  },
  {
    id: "documentaries",
    label: "Documentaries",
    description: "Reserved — long-form journey documentaries with dual consent."
  },
  {
    id: "family-albums",
    label: "Family albums",
    description: "Reserved — family albums without sensitive child data."
  }
];

export type LoveThroughYearsPhotoSlot = {
  id: string;
  phaseId: LoveThroughYearsPhaseId;
  label: string;
  status: "reserved";
};

export function loveThroughYearsPhaseLabel(phaseId: LoveThroughYearsPhaseId): string {
  return LOVE_THROUGH_YEARS_PHASE_LABELS[phaseId];
}

export function getLoveThroughYearsPhaseDefinition(
  phaseId: LoveThroughYearsPhaseId
): LoveThroughYearsPhaseDefinition | undefined {
  return LOVE_THROUGH_YEARS_PHASES.find((phase) => phase.id === phaseId);
}
