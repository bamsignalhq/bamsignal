import {
  RELATIONSHIP_ANNIVERSARY_FOUNDATION_LABELS,
  RELATIONSHIP_AUTOMATIC_ANNIVERSARY_MILESTONES,
  type RelationshipAnniversaryTimelineEntry,
  type RelationshipAutomaticAnniversaryId
} from "../constants/relationshipAnniversary";

export function addAnniversaryYears(isoDate: string, years: number): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid marriage date for anniversary projection");
  }
  const projected = new Date(date);
  projected.setUTCFullYear(projected.getUTCFullYear() + years);
  return projected.toISOString();
}

export function deriveAutomaticAnniversaryMilestones(
  marriedAt: string,
  recordedAt = new Date().toISOString()
): RelationshipAnniversaryTimelineEntry[] {
  return RELATIONSHIP_AUTOMATIC_ANNIVERSARY_MILESTONES.map((definition) => ({
    id: `ra_auto_${definition.id}`,
    milestoneId: definition.id,
    label: definition.displayLabel,
    milestoneAt: addAnniversaryYears(marriedAt, definition.yearsAfterMarriage),
    recordedAt,
    kind: "automatic" as const
  }));
}

export function mergeAnniversaryTimeline(
  foundation: RelationshipAnniversaryTimelineEntry[],
  automatic: RelationshipAnniversaryTimelineEntry[]
): RelationshipAnniversaryTimelineEntry[] {
  return [...foundation, ...automatic].sort(
    (a, b) => new Date(a.milestoneAt).getTime() - new Date(b.milestoneAt).getTime()
  );
}

export function buildFoundationAnniversaryEntry(
  milestoneId: "met" | "married",
  milestoneAt: string,
  input?: { recordedAt?: string; note?: string; id?: string }
): RelationshipAnniversaryTimelineEntry {
  return {
    id: input?.id ?? `ra_foundation_${milestoneId}`,
    milestoneId,
    label: RELATIONSHIP_ANNIVERSARY_FOUNDATION_LABELS[milestoneId],
    milestoneAt,
    recordedAt: input?.recordedAt ?? milestoneAt,
    note: input?.note,
    kind: "foundation"
  };
}

/** Architecture guard — anniversary timeline entries cannot shrink. */
export function assertRelationshipAnniversaryIntegrity(
  previous: RelationshipAnniversaryTimelineEntry[],
  next: RelationshipAnniversaryTimelineEntry[]
): void {
  if (next.length < previous.length) {
    throw new Error("Relationship anniversary timeline cannot shrink");
  }
  const previousIds = new Set(previous.map((entry) => entry.id));
  for (const id of previousIds) {
    if (!next.some((entry) => entry.id === id)) {
      throw new Error("Relationship anniversaries are never deleted");
    }
  }
}

export function isAutomaticAnniversaryId(
  milestoneId: string
): milestoneId is RelationshipAutomaticAnniversaryId {
  return RELATIONSHIP_AUTOMATIC_ANNIVERSARY_MILESTONES.some((item) => item.id === milestoneId);
}
