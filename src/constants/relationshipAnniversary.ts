/** Relationship Anniversary Engine™ — permanent Legacy Archive milestones. */

export const RELATIONSHIP_ANNIVERSARY_ENGINE_TITLE = "Relationship Anniversary Engine™";
export const RELATIONSHIP_ANNIVERSARY_SUBCOPY =
  "Permanent relationship anniversaries — honored as part of the Legacy Archive.";
export const RELATIONSHIP_ANNIVERSARY_PERMANENCE_COPY =
  "Permanent. Never deleted. Part of Legacy Archive.";
export const RELATIONSHIP_ANNIVERSARY_RESERVED_COPY =
  "Architecture prepared. Celebrations, events, and legacy recognition are not enabled yet.";

export type RelationshipAutomaticAnniversaryId =
  | "one-year"
  | "five-years"
  | "ten-years"
  | "silver-anniversary"
  | "golden-anniversary";

export type RelationshipAnniversaryFoundationId = "met" | "married";

export type RelationshipAnniversaryMilestoneId =
  | RelationshipAnniversaryFoundationId
  | RelationshipAutomaticAnniversaryId;

export type RelationshipAutomaticAnniversaryDefinition = {
  id: RelationshipAutomaticAnniversaryId;
  /** Catalog label — automatic milestone trigger. */
  label: string;
  /** Display label shown on the anniversary timeline. */
  displayLabel: string;
  yearsAfterMarriage: number;
};

export const RELATIONSHIP_AUTOMATIC_ANNIVERSARY_MILESTONES: RelationshipAutomaticAnniversaryDefinition[] =
  [
    {
      id: "one-year",
      label: "1 Year",
      displayLabel: "1st Anniversary",
      yearsAfterMarriage: 1
    },
    {
      id: "five-years",
      label: "5 Years",
      displayLabel: "5 Years Together",
      yearsAfterMarriage: 5
    },
    {
      id: "ten-years",
      label: "10 Years",
      displayLabel: "10 Years Together",
      yearsAfterMarriage: 10
    },
    {
      id: "silver-anniversary",
      label: "Silver Anniversary",
      displayLabel: "Silver Anniversary",
      yearsAfterMarriage: 25
    },
    {
      id: "golden-anniversary",
      label: "Golden Anniversary",
      displayLabel: "Golden Anniversary",
      yearsAfterMarriage: 50
    }
  ];

export const RELATIONSHIP_ANNIVERSARY_FOUNDATION_LABELS: Record<
  RelationshipAnniversaryFoundationId,
  string
> = {
  met: "Met",
  married: "Married"
};

export const RELATIONSHIP_AUTOMATIC_ANNIVERSARY_LABELS: Record<
  RelationshipAutomaticAnniversaryId,
  string
> = Object.fromEntries(
  RELATIONSHIP_AUTOMATIC_ANNIVERSARY_MILESTONES.map((item) => [item.id, item.label])
) as Record<RelationshipAutomaticAnniversaryId, string>;

export type RelationshipAnniversaryFutureCapability =
  | "celebrations"
  | "events"
  | "legacy-recognition";

export const RELATIONSHIP_ANNIVERSARY_FUTURE_CAPABILITIES: {
  id: RelationshipAnniversaryFutureCapability;
  label: string;
  description: string;
}[] = [
  {
    id: "celebrations",
    label: "Celebrations",
    description: "Reserved — warm anniversary celebrations for Legacy Archive couples."
  },
  {
    id: "events",
    label: "Events",
    description: "Reserved — couple events tied to anniversary milestones."
  },
  {
    id: "legacy-recognition",
    label: "Legacy recognition",
    description: "Reserved — Legacy Archive recognition for enduring journeys."
  }
];

export type RelationshipAnniversaryTimelineEntry = {
  id: string;
  milestoneId: RelationshipAnniversaryMilestoneId;
  label: string;
  milestoneAt: string;
  recordedAt?: string;
  note?: string;
  /** Foundation anchors (Met, Married) vs automatic anniversary milestones. */
  kind: "foundation" | "automatic";
};

/** Architecture preview — matches Legacy Archive display seed. */
export const RELATIONSHIP_ANNIVERSARY_ARCHITECTURE_SEED: RelationshipAnniversaryTimelineEntry[] = [
  {
    id: "ra_seed_met",
    milestoneId: "met",
    label: "Met",
    milestoneAt: "2028-05-20T00:00:00.000Z",
    recordedAt: "2028-05-20T10:00:00.000Z",
    kind: "foundation"
  },
  {
    id: "ra_seed_married",
    milestoneId: "married",
    label: "Married",
    milestoneAt: "2030-04-18T00:00:00.000Z",
    recordedAt: "2030-04-18T00:00:00.000Z",
    kind: "foundation"
  },
  {
    id: "ra_seed_one_year",
    milestoneId: "one-year",
    label: "1st Anniversary",
    milestoneAt: "2031-04-18T00:00:00.000Z",
    recordedAt: "2031-04-18T00:00:00.000Z",
    kind: "automatic"
  },
  {
    id: "ra_seed_five_years",
    milestoneId: "five-years",
    label: "5 Years Together",
    milestoneAt: "2035-04-18T00:00:00.000Z",
    recordedAt: "2035-04-18T00:00:00.000Z",
    kind: "automatic"
  },
  {
    id: "ra_seed_ten_years",
    milestoneId: "ten-years",
    label: "10 Years Together",
    milestoneAt: "2040-04-18T00:00:00.000Z",
    recordedAt: "2040-04-18T00:00:00.000Z",
    kind: "automatic"
  }
];

export function relationshipAnniversaryYear(isoDate: string): string {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return "";
  return String(new Date(parsed).getUTCFullYear());
}

export function getAutomaticAnniversaryDefinition(
  milestoneId: RelationshipAutomaticAnniversaryId
): RelationshipAutomaticAnniversaryDefinition | undefined {
  return RELATIONSHIP_AUTOMATIC_ANNIVERSARY_MILESTONES.find((item) => item.id === milestoneId);
}
