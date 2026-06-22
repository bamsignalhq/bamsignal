/** Signal Concierge relationship archive — journeys are never deleted. */

export const JOURNEY_ARCHIVE_TITLE = "Relationship Journey Archive";
export const JOURNEY_ARCHIVE_SUBCOPY =
  "Every relationship journey is preserved permanently. Members belong to BamSignal — always.";
export const LEGACY_ARCHIVE_TITLE = "Legacy Archive";
export const LEGACY_ARCHIVE_SUBCOPY =
  "Honoring successful journeys. Archived journeys remain private — never public.";
export const JOURNEY_HISTORY_LABEL = "Journey History";
export const ARCHIVE_PRIVACY_COPY =
  "Archived journeys remain private. No public exposure.";

export type RelationshipJourneyStatus =
  | "active"
  | "paused"
  | "matched"
  | "exclusive"
  | "engaged"
  | "married"
  | "closed"
  | "legacy-archive";

export const RELATIONSHIP_JOURNEY_STATUS_LABELS: Record<RelationshipJourneyStatus, string> = {
  active: "Active",
  paused: "Paused",
  matched: "Matched",
  exclusive: "Exclusive",
  engaged: "Engaged",
  married: "Married",
  closed: "Closed",
  "legacy-archive": "Legacy Archive"
};

export const RELATIONSHIP_JOURNEY_LIFECYCLE = [
  { id: "applied", label: "Applied" },
  { id: "consultation", label: "Consultation" },
  { id: "accepted", label: "Accepted" },
  { id: "introductions", label: "Introductions" },
  { id: "relationship", label: "Relationship" },
  { id: "engagement", label: "Engagement" },
  { id: "marriage", label: "Marriage" },
  { id: "legacy-archive", label: "Legacy Archive" }
] as const;

export const JOURNEY_ARCHIVE_IMMUTABLE_COLLECTIONS = [
  "privateNotes",
  "introductions",
  "consultantSummary",
  "communicationJournal",
  "timeline",
  "stewardshipHistory",
  "followUpTasks",
  "photos"
] as const;

/** Reserved — anniversary recognition, success stories, couple events (not implemented). */
export type ConciergeJourneyFutureMilestoneKind =
  | "anniversary-recognition"
  | "success-story"
  | "marriage-milestone"
  | "couple-event";

export type ConciergeJourneyFutureMilestones = {
  enabled?: boolean;
  kinds?: ConciergeJourneyFutureMilestoneKind[];
  anniversaryDate?: string;
  successStoryId?: string;
  coupleEventIds?: string[];
};

export type JourneyArchiveMetadata = {
  relationshipStatus: RelationshipJourneyStatus;
  relationshipFormedAt?: string;
  marriedAt?: string;
  archivedAt?: string;
  isLegacyArchive: boolean;
  /** Reserved for future milestone products — not implemented. */
  futureMilestones?: ConciergeJourneyFutureMilestones;
};

export const EMPTY_JOURNEY_ARCHIVE_FILTERS = {
  query: "",
  archiveStatus: "all" as RelationshipJourneyStatus | "all",
  marriageYear: "",
  consultant: "",
  city: "",
  tier: "all" as import("./signalConcierge").SignalConciergeTierId | "all"
};

export type JourneyArchiveFilters = typeof EMPTY_JOURNEY_ARCHIVE_FILTERS;
