/** Family Milestones™ — permanent timeline architecture (reserved). Never deleted. */

export const FAMILY_MILESTONES_TITLE = "Family Milestones™";
export const FAMILY_MILESTONES_SUBCOPY =
  "Growing Together — family milestones preserved with warmth and dignity.";
export const LEGACY_FAMILY_LABEL = "Legacy Family";
export const GROWING_TOGETHER_LABEL = "Growing Together";
export const FAMILY_MILESTONES_LABEL = "Family Milestones";

export const FAMILY_MILESTONE_PERMANENCE_COPY =
  "Family milestones are never deleted. The timeline persists forever.";
export const FAMILY_MILESTONE_RESERVED_COPY =
  "Architecture prepared. Celebrations and legacy family services are not enabled yet.";

export type FamilyMilestoneEventId =
  | "child-born"
  | "relocation"
  | "new-country"
  | "wedding-anniversary"
  | "family-growth";

export type FamilyMilestoneEvent = {
  id: FamilyMilestoneEventId;
  label: string;
  description: string;
};

export const FAMILY_MILESTONE_EVENTS: FamilyMilestoneEvent[] = [
  {
    id: "child-born",
    label: "Child Born",
    description: "A new chapter in the Legacy Family journey."
  },
  {
    id: "relocation",
    label: "Relocation",
    description: "The family journey continues in a new place."
  },
  {
    id: "new-country",
    label: "New Country",
    description: "Roots planted abroad — diaspora legacy preserved."
  },
  {
    id: "wedding-anniversary",
    label: "Wedding Anniversary",
    description: "Celebrating years of commitment and Growing Together."
  },
  {
    id: "family-growth",
    label: "Family Growth",
    description: "Milestones of expansion, unity, and shared values."
  }
];

export const FAMILY_MILESTONE_EVENT_LABELS: Record<FamilyMilestoneEventId, string> =
  Object.fromEntries(FAMILY_MILESTONE_EVENTS.map((event) => [event.id, event.label])) as Record<
    FamilyMilestoneEventId,
    string
  >;

export type FamilyMilestoneFutureCapability =
  | "family-celebrations"
  | "children-milestones"
  | "legacy-families";

export const FAMILY_MILESTONE_FUTURE_CAPABILITIES: {
  id: FamilyMilestoneFutureCapability;
  label: string;
  description: string;
}[] = [
  {
    id: "family-celebrations",
    label: "Family celebrations",
    description: "Reserved — warm recognition of family milestones."
  },
  {
    id: "children-milestones",
    label: "Children milestones",
    description: "Reserved — children milestones without sensitive data."
  },
  {
    id: "legacy-families",
    label: "Legacy families",
    description: "Reserved — Legacy Family continuity across generations."
  }
];

/** Append-only timeline entry — never removed once recorded. */
export type FamilyMilestoneTimelineEntry = {
  id: string;
  eventId: FamilyMilestoneEventId;
  recordedAt: string;
  milestoneAt?: string;
  note?: string;
};

export const FAMILY_MILESTONE_ARCHITECTURE_SEED: FamilyMilestoneTimelineEntry[] = [
  {
    id: "fm_seed_1",
    eventId: "wedding-anniversary",
    recordedAt: "2028-06-01T00:00:00.000Z",
    milestoneAt: "2028-06-01T00:00:00.000Z",
    note: "First anniversary celebrated privately."
  },
  {
    id: "fm_seed_2",
    eventId: "child-born",
    recordedAt: "2029-03-15T00:00:00.000Z",
    milestoneAt: "2029-03-10T00:00:00.000Z"
  },
  {
    id: "fm_seed_3",
    eventId: "new-country",
    recordedAt: "2030-01-20T00:00:00.000Z",
    milestoneAt: "2030-01-01T00:00:00.000Z",
    note: "Legacy Family — current country updated."
  }
];

export function familyMilestoneEventLabel(eventId: FamilyMilestoneEventId): string {
  return FAMILY_MILESTONE_EVENT_LABELS[eventId];
}

export function getFamilyMilestoneEvent(eventId: FamilyMilestoneEventId): FamilyMilestoneEvent | undefined {
  return FAMILY_MILESTONE_EVENTS.find((event) => event.id === eventId);
}

/** Architecture guard — timeline entries cannot shrink. */
export function assertFamilyMilestoneTimelineIntegrity(
  previous: FamilyMilestoneTimelineEntry[],
  next: FamilyMilestoneTimelineEntry[]
): void {
  if (next.length < previous.length) {
    throw new Error("Family milestone timeline cannot shrink");
  }
  const previousIds = new Set(previous.map((entry) => entry.id));
  for (const id of previousIds) {
    if (!next.some((entry) => entry.id === id)) {
      throw new Error("Family milestones are never deleted");
    }
  }
}
