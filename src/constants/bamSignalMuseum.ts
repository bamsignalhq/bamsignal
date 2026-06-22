/** BamSignal Museum™ — relationship and family history preservation architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const BAMSIGNAL_MUSEUM_TITLE = "BamSignal Museum™";
export const BAMSIGNAL_MUSEUM_LABEL = "BamSignal Museum";
export const LEGACY_EXHIBIT_LABEL = "Legacy Exhibit";
export const FAMILY_STORY_LABEL = "Family Story";
export const RELATIONSHIP_TIMELINE_LABEL = "Relationship Timeline";
export const PRESERVING_STORIES_LABEL = "Preserving Stories";
export const ARCHIVE_LABEL = "Archive";

export const BAMSIGNAL_MUSEUM_GOOD_COPY = ["Museum", "Archive", "Preserving Stories"] as const;

export const BAMSIGNAL_MUSEUM_FORBIDDEN_COPY = ["Storage", "Database"] as const;

export const BAMSIGNAL_MUSEUM_SUBCOPY =
  "Preserve relationship and family history — Museum and Archive with dignity, never cold storage or databases.";
export const BAMSIGNAL_MUSEUM_PURPOSE_COPY =
  "Prepare museum architecture — exhibits, family stories, and timelines reserved, not physical collections yet.";
export const BAMSIGNAL_MUSEUM_RESERVED_COPY =
  "Architecture prepared. Legacy exhibits, family stories, and relationship timelines are not enabled yet.";
export const BAMSIGNAL_MUSEUM_FUTURE_READY_COPY =
  "Future-ready capabilities documented only — physical museum, books, films, and audio archives are not implemented.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type FutureReadyMuseumCapabilityId = "physical-museum" | "books" | "films" | "audio-archives";

export type FutureReadyMuseumCapabilityDefinition = {
  id: FutureReadyMuseumCapabilityId;
  title: string;
  description: string;
};

export const FUTURE_READY_MUSEUM_CAPABILITIES: FutureReadyMuseumCapabilityDefinition[] = [
  {
    id: "physical-museum",
    title: "Physical museum",
    description: "Physical museum — architecture reserved, not implemented."
  },
  {
    id: "books",
    title: "Books",
    description: "Books — architecture reserved, not implemented."
  },
  {
    id: "films",
    title: "Films",
    description: "Films — architecture reserved, not implemented."
  },
  {
    id: "audio-archives",
    title: "Audio archives",
    description: "Audio archives — architecture reserved, not implemented."
  }
];

export type PreparedMuseumPreservationId =
  | "love-stories"
  | "wedding-traditions"
  | "diaspora-journeys"
  | "family-milestones"
  | "golden-anniversary-stories"
  | "founders-couples"
  | "community-histories";

export type PreparedMuseumPreservationDefinition = {
  id: PreparedMuseumPreservationId;
  title: string;
  description: string;
  exhibitId: string;
  storyId: string;
  timelineId: string;
};

export const PREPARED_MUSEUM_PRESERVATIONS: PreparedMuseumPreservationDefinition[] = [
  {
    id: "love-stories",
    title: "Love Stories",
    description: "Love Stories — preserving stories with warmth, not database entries.",
    exhibitId: "bsmu_exhibit_love_stories",
    storyId: "bsmu_story_love_stories",
    timelineId: "bsmu_timeline_love_stories"
  },
  {
    id: "wedding-traditions",
    title: "Wedding Traditions",
    description: "Wedding Traditions — cultural heritage honoured in the museum archive.",
    exhibitId: "bsmu_exhibit_wedding_traditions",
    storyId: "bsmu_story_wedding_traditions",
    timelineId: "bsmu_timeline_wedding_traditions"
  },
  {
    id: "diaspora-journeys",
    title: "Diaspora Journeys",
    description: "Diaspora Journeys — cross-border family history preserved with dignity.",
    exhibitId: "bsmu_exhibit_diaspora_journeys",
    storyId: "bsmu_story_diaspora_journeys",
    timelineId: "bsmu_timeline_diaspora_journeys"
  },
  {
    id: "family-milestones",
    title: "Family Milestones",
    description: "Family Milestones — household history archived for future generations.",
    exhibitId: "bsmu_exhibit_family_milestones",
    storyId: "bsmu_story_family_milestones",
    timelineId: "bsmu_timeline_family_milestones"
  },
  {
    id: "golden-anniversary-stories",
    title: "Golden Anniversary Stories",
    description: "Golden Anniversary Stories — lasting love preserved in the museum.",
    exhibitId: "bsmu_exhibit_golden_anniversary",
    storyId: "bsmu_story_golden_anniversary",
    timelineId: "bsmu_timeline_golden_anniversary"
  },
  {
    id: "founders-couples",
    title: "Founders Couples",
    description: "Founders Couples — pioneering partnerships honoured in the archive.",
    exhibitId: "bsmu_exhibit_founders_couples",
    storyId: "bsmu_story_founders_couples",
    timelineId: "bsmu_timeline_founders_couples"
  },
  {
    id: "community-histories",
    title: "Community Histories",
    description: "Community Histories — collective family memory preserved with care.",
    exhibitId: "bsmu_exhibit_community_histories",
    storyId: "bsmu_story_community_histories",
    timelineId: "bsmu_timeline_community_histories"
  }
];

export type PreparedLegacyExhibitId =
  | "bsmu_exhibit_love_stories"
  | "bsmu_exhibit_wedding_traditions"
  | "bsmu_exhibit_diaspora_journeys"
  | "bsmu_exhibit_family_milestones"
  | "bsmu_exhibit_golden_anniversary"
  | "bsmu_exhibit_founders_couples"
  | "bsmu_exhibit_community_histories";

export type PreparedLegacyExhibitDefinition = {
  id: PreparedLegacyExhibitId;
  title: string;
  description: string;
  preservationId: PreparedMuseumPreservationId;
};

export const PREPARED_LEGACY_EXHIBITS: PreparedLegacyExhibitDefinition[] =
  PREPARED_MUSEUM_PRESERVATIONS.map((preservation) => ({
    id: preservation.exhibitId as PreparedLegacyExhibitId,
    title: `${preservation.title} exhibit`,
    description: `${preservation.title} — Legacy Exhibit reserved, not storage.`,
    preservationId: preservation.id
  }));

export type PreparedFamilyStoryId =
  | "bsmu_story_love_stories"
  | "bsmu_story_wedding_traditions"
  | "bsmu_story_diaspora_journeys"
  | "bsmu_story_family_milestones"
  | "bsmu_story_golden_anniversary"
  | "bsmu_story_founders_couples"
  | "bsmu_story_community_histories";

export type PreparedFamilyStoryDefinition = {
  id: PreparedFamilyStoryId;
  title: string;
  summary: string;
  preservationId: PreparedMuseumPreservationId;
};

export const PREPARED_FAMILY_STORIES: PreparedFamilyStoryDefinition[] =
  PREPARED_MUSEUM_PRESERVATIONS.map((preservation) => ({
    id: preservation.storyId as PreparedFamilyStoryId,
    title: `${preservation.title} story`,
    summary: `${preservation.title} — Family Story archived, not a database record.`,
    preservationId: preservation.id
  }));

export type RelationshipTimelineEntry = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export type PreparedRelationshipTimelineId =
  | "bsmu_timeline_love_stories"
  | "bsmu_timeline_wedding_traditions"
  | "bsmu_timeline_diaspora_journeys"
  | "bsmu_timeline_family_milestones"
  | "bsmu_timeline_golden_anniversary"
  | "bsmu_timeline_founders_couples"
  | "bsmu_timeline_community_histories";

export type PreparedRelationshipTimelineDefinition = {
  id: PreparedRelationshipTimelineId;
  title: string;
  summary: string;
  preservationId: PreparedMuseumPreservationId;
  entries: RelationshipTimelineEntry[];
};

export const PREPARED_RELATIONSHIP_TIMELINES: PreparedRelationshipTimelineDefinition[] =
  PREPARED_MUSEUM_PRESERVATIONS.map((preservation, index) => ({
    id: preservation.timelineId as PreparedRelationshipTimelineId,
    title: `${RELATIONSHIP_TIMELINE_LABEL}: ${preservation.title}`,
    summary: `Relationship timeline for ${preservation.title.toLowerCase()} — architecture preview.`,
    preservationId: preservation.id,
    entries: [
      {
        id: `bsmu_timeline_entry_${preservation.id}`,
        label: `${PRESERVING_STORIES_LABEL} milestone reserved`,
        recordedAt: new Date(Date.UTC(2026, 0, 1 + index, 12, 0, 0)).toISOString(),
        note: "Architecture preview — relationship timeline not live yet."
      }
    ]
  }));

export function getPreparedMuseumPreservation(
  preservationId: PreparedMuseumPreservationId
): PreparedMuseumPreservationDefinition | undefined {
  return PREPARED_MUSEUM_PRESERVATIONS.find((preservation) => preservation.id === preservationId);
}
