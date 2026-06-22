import {
  FUTURE_READY_MUSEUM_CAPABILITIES,
  PREPARED_MUSEUM_PRESERVATIONS
} from "../constants/bamSignalMuseum";
import {
  listArchitectureFamilyStories,
  listArchitectureLegacyExhibits,
  listArchitectureRelationshipTimelines,
  type FamilyStoryViewModel,
  type LegacyExhibitViewModel,
  type RelationshipTimelineViewModel
} from "./bamSignalMuseumLogic";

export type BamSignalMuseumBundle = {
  exhibits: LegacyExhibitViewModel[];
  stories: FamilyStoryViewModel[];
  timelines: RelationshipTimelineViewModel[];
  preservationCount: number;
  futureReadyCapabilityCount: number;
};

export function getBamSignalMuseumBundle(): BamSignalMuseumBundle {
  return {
    exhibits: listArchitectureLegacyExhibits(),
    stories: listArchitectureFamilyStories(),
    timelines: listArchitectureRelationshipTimelines(),
    preservationCount: PREPARED_MUSEUM_PRESERVATIONS.length,
    futureReadyCapabilityCount: FUTURE_READY_MUSEUM_CAPABILITIES.length
  };
}

export function getMuseumPreservation(preservationId: string): LegacyExhibitViewModel | null {
  const preservation = PREPARED_MUSEUM_PRESERVATIONS.find((item) => item.id === preservationId);
  if (!preservation) return null;
  return listArchitectureLegacyExhibits().find((exhibit) => exhibit.id === preservation.exhibitId) ?? null;
}
