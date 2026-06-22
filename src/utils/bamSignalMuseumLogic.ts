import type {
  PreparedFamilyStoryDefinition,
  PreparedFamilyStoryId,
  PreparedLegacyExhibitDefinition,
  PreparedLegacyExhibitId,
  PreparedRelationshipTimelineDefinition,
  PreparedRelationshipTimelineId
} from "../constants/bamSignalMuseum";
import {
  FAMILY_STORY_LABEL,
  LEGACY_EXHIBIT_LABEL,
  PREPARED_FAMILY_STORIES,
  PREPARED_LEGACY_EXHIBITS,
  PREPARED_MUSEUM_PRESERVATIONS,
  PREPARED_RELATIONSHIP_TIMELINES,
  PRESERVING_STORIES_LABEL,
  RELATIONSHIP_TIMELINE_LABEL
} from "../constants/bamSignalMuseum";

export type LegacyExhibitViewModel = {
  id: PreparedLegacyExhibitId;
  title: string;
  description: string;
  preservationTitle: string;
  exhibitLabel: string;
  statusLabel: string;
};

export type FamilyStoryViewModel = {
  id: PreparedFamilyStoryId;
  title: string;
  summary: string;
  preservationTitle: string;
  storyLabel: string;
  statusLabel: string;
};

export type RelationshipTimelineViewModel = {
  id: PreparedRelationshipTimelineId;
  title: string;
  summary: string;
  preservationTitle: string;
  timelineLabel: string;
  preservingStoriesLabel: string;
  entries: PreparedRelationshipTimelineDefinition["entries"];
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildLegacyExhibitViewModel(exhibit: PreparedLegacyExhibitDefinition): LegacyExhibitViewModel {
  const preservation = PREPARED_MUSEUM_PRESERVATIONS.find((item) => item.id === exhibit.preservationId);
  return {
    id: exhibit.id,
    title: exhibit.title,
    description: exhibit.description,
    preservationTitle: preservation?.title ?? exhibit.preservationId,
    exhibitLabel: LEGACY_EXHIBIT_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildFamilyStoryViewModel(story: PreparedFamilyStoryDefinition): FamilyStoryViewModel {
  const preservation = PREPARED_MUSEUM_PRESERVATIONS.find((item) => item.id === story.preservationId);
  return {
    id: story.id,
    title: story.title,
    summary: story.summary,
    preservationTitle: preservation?.title ?? story.preservationId,
    storyLabel: FAMILY_STORY_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildRelationshipTimelineViewModel(
  timeline: PreparedRelationshipTimelineDefinition
): RelationshipTimelineViewModel {
  const preservation = PREPARED_MUSEUM_PRESERVATIONS.find((item) => item.id === timeline.preservationId);
  return {
    id: timeline.id,
    title: timeline.title,
    summary: timeline.summary,
    preservationTitle: preservation?.title ?? timeline.preservationId,
    timelineLabel: RELATIONSHIP_TIMELINE_LABEL,
    preservingStoriesLabel: PRESERVING_STORIES_LABEL,
    entries: timeline.entries,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureLegacyExhibits(): LegacyExhibitViewModel[] {
  return [...PREPARED_LEGACY_EXHIBITS.map(buildLegacyExhibitViewModel)].sort((a, b) =>
    a.preservationTitle.localeCompare(b.preservationTitle)
  );
}

export function listArchitectureFamilyStories(): FamilyStoryViewModel[] {
  return [...PREPARED_FAMILY_STORIES.map(buildFamilyStoryViewModel)].sort((a, b) =>
    a.preservationTitle.localeCompare(b.preservationTitle)
  );
}

export function listArchitectureRelationshipTimelines(): RelationshipTimelineViewModel[] {
  return [...PREPARED_RELATIONSHIP_TIMELINES.map(buildRelationshipTimelineViewModel)].sort((a, b) =>
    a.preservationTitle.localeCompare(b.preservationTitle)
  );
}
