import {
  RELATIONSHIP_ANNIVERSARY_ARCHITECTURE_SEED,
  RELATIONSHIP_ANNIVERSARY_FUTURE_CAPABILITIES,
  RELATIONSHIP_AUTOMATIC_ANNIVERSARY_MILESTONES,
  type RelationshipAnniversaryTimelineEntry
} from "../constants/relationshipAnniversary";
import {
  assertRelationshipAnniversaryIntegrity,
  buildFoundationAnniversaryEntry,
  deriveAutomaticAnniversaryMilestones,
  mergeAnniversaryTimeline
} from "./relationshipAnniversaryLogic";

export function listAutomaticAnniversaryMilestones() {
  return RELATIONSHIP_AUTOMATIC_ANNIVERSARY_MILESTONES;
}

export function listAnniversaryFutureCapabilities() {
  return RELATIONSHIP_ANNIVERSARY_FUTURE_CAPABILITIES;
}

export function getRelationshipAnniversaryArchitectureTimeline(): RelationshipAnniversaryTimelineEntry[] {
  return RELATIONSHIP_ANNIVERSARY_ARCHITECTURE_SEED;
}

export function buildRelationshipAnniversaryTimeline(input: {
  metAt?: string;
  marriedAt: string;
  recordedAt?: string;
}): RelationshipAnniversaryTimelineEntry[] {
  const foundation: RelationshipAnniversaryTimelineEntry[] = [];
  if (input.metAt) {
    foundation.push(
      buildFoundationAnniversaryEntry("met", input.metAt, { recordedAt: input.recordedAt })
    );
  }
  foundation.push(
    buildFoundationAnniversaryEntry("married", input.marriedAt, { recordedAt: input.recordedAt })
  );
  const automatic = deriveAutomaticAnniversaryMilestones(
    input.marriedAt,
    input.recordedAt ?? new Date().toISOString()
  );
  return mergeAnniversaryTimeline(foundation, automatic);
}

export function projectAutomaticAnniversaryMilestones(marriedAt: string) {
  return deriveAutomaticAnniversaryMilestones(marriedAt);
}

export { assertRelationshipAnniversaryIntegrity };
