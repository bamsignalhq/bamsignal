/** Anniversary Celebration Experience™ — milestone celebrations (reserved fulfillment). */

import type { RelationshipAutomaticAnniversaryId } from "./relationshipAnniversary";
import { RELATIONSHIP_AUTOMATIC_ANNIVERSARY_MILESTONES } from "./relationshipAnniversary";

export const ANNIVERSARY_CELEBRATION_EXPERIENCE_TITLE = "Anniversary Celebration Experience™";
export const ANNIVERSARY_CELEBRATION_EXPERIENCE_SUBCOPY =
  "Thoughtful anniversary celebrations — warm, private, and never marketing-first.";
export const CELEBRATIONS_LABEL = "Celebrations";
export const THOUGHTFUL_MOMENTS_LABEL = "Thoughtful Moments";
export const JOURNEY_MEMORIES_LABEL = "Journey Memories";

export const ANNIVERSARY_CELEBRATION_RESERVED_COPY =
  "Architecture prepared. Flowers, dinner invitations, couple retreats, and legacy events are not enabled yet.";
export const ANNIVERSARY_CELEBRATION_FULFILLMENT_COPY =
  "Celebration moments are reserved — fulfillment is not enabled yet.";

export type AnniversaryCelebrationId = RelationshipAutomaticAnniversaryId;

export type AnniversaryCelebrationDefinition = {
  id: AnniversaryCelebrationId;
  label: string;
  displayLabel: string;
  yearsAfterMarriage: number;
  description: string;
};

export const ANNIVERSARY_CELEBRATION_DEFINITIONS: AnniversaryCelebrationDefinition[] =
  RELATIONSHIP_AUTOMATIC_ANNIVERSARY_MILESTONES.map((milestone) => ({
    id: milestone.id,
    label: milestone.label,
    displayLabel: milestone.displayLabel,
    yearsAfterMarriage: milestone.yearsAfterMarriage,
    description: `Reserved — thoughtful recognition for ${milestone.label.toLowerCase()}.`
  }));

export const ANNIVERSARY_CELEBRATION_LABELS: Record<AnniversaryCelebrationId, string> =
  Object.fromEntries(
    ANNIVERSARY_CELEBRATION_DEFINITIONS.map((item) => [item.id, item.label])
  ) as Record<AnniversaryCelebrationId, string>;

export type AnniversaryCelebrationFutureCapability =
  | "flowers"
  | "dinner-invitations"
  | "couple-retreats"
  | "legacy-events";

export const ANNIVERSARY_CELEBRATION_FUTURE_CAPABILITIES: {
  id: AnniversaryCelebrationFutureCapability;
  label: string;
  description: string;
}[] = [
  {
    id: "flowers",
    label: "Flowers",
    description: "Reserved — flowers delivered with care for anniversary milestones."
  },
  {
    id: "dinner-invitations",
    label: "Dinner invitations",
    description: "Reserved — couple dinner invitations tied to celebration moments."
  },
  {
    id: "couple-retreats",
    label: "Couple retreats",
    description: "Reserved — intimate retreats for enduring legacy couples."
  },
  {
    id: "legacy-events",
    label: "Legacy events",
    description: "Reserved — legacy celebration events with dignity and consent."
  }
];

export type AnniversaryCelebrationTimelineEntry = {
  id: string;
  celebrationId: AnniversaryCelebrationId;
  label: string;
  milestoneAt: string;
  note?: string;
  /** Reserved — no fulfillment yet. */
  status: "reserved";
};

export const ANNIVERSARY_CELEBRATION_ARCHITECTURE_SEED: AnniversaryCelebrationTimelineEntry[] = [
  {
    id: "ace_seed_one_year",
    celebrationId: "one-year",
    label: "1 Year",
    milestoneAt: "2031-04-18T00:00:00.000Z",
    note: "First anniversary — thoughtful moment reserved.",
    status: "reserved"
  },
  {
    id: "ace_seed_five_years",
    celebrationId: "five-years",
    label: "5 Years",
    milestoneAt: "2035-04-18T00:00:00.000Z",
    note: "Five years together — Journey Memories preserved.",
    status: "reserved"
  },
  {
    id: "ace_seed_ten_years",
    celebrationId: "ten-years",
    label: "10 Years",
    milestoneAt: "2040-04-18T00:00:00.000Z",
    status: "reserved"
  },
  {
    id: "ace_seed_silver",
    celebrationId: "silver-anniversary",
    label: "Silver Anniversary",
    milestoneAt: "2055-04-18T00:00:00.000Z",
    status: "reserved"
  },
  {
    id: "ace_seed_golden",
    celebrationId: "golden-anniversary",
    label: "Golden Anniversary",
    milestoneAt: "2080-04-18T00:00:00.000Z",
    note: "Golden legacy — celebration reserved with warmth.",
    status: "reserved"
  }
];

export function getAnniversaryCelebrationDefinition(
  celebrationId: AnniversaryCelebrationId
): AnniversaryCelebrationDefinition | undefined {
  return ANNIVERSARY_CELEBRATION_DEFINITIONS.find((item) => item.id === celebrationId);
}

export function anniversaryCelebrationYear(isoDate: string): string {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return "";
  return String(new Date(parsed).getUTCFullYear());
}
