import { STORAGE_KEYS } from "../constants/limits";
import type {
  JourneyArchiveMetadata,
  RelationshipJourneyStatus
} from "../constants/conciergeJourneyArchive";
import type { ConciergeMemberRecord, ConciergeTimelineEvent } from "../types/conciergeConsultant";
import { readJson, writeJson } from "./storage";

const ARCHIVE_KEY = STORAGE_KEYS.conciergeJourneyArchive;

export type JourneyArchiveRegistryState = {
  memberIds: string[];
  updatedAt: string;
};

export function createEmptyArchiveRegistry(now = new Date().toISOString()): JourneyArchiveRegistryState {
  return { memberIds: [], updatedAt: now };
}

function loadArchiveRegistry(): JourneyArchiveRegistryState {
  return readJson<JourneyArchiveRegistryState>(ARCHIVE_KEY, createEmptyArchiveRegistry());
}

function saveArchiveRegistry(state: JourneyArchiveRegistryState): void {
  writeJson(ARCHIVE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function assertNoArchiveDeletion(
  previous: ConciergeMemberRecord,
  next: ConciergeMemberRecord
): void {
  const collections: (keyof ConciergeMemberRecord)[] = [
    "privateNotes",
    "introductions",
    "communicationJournal",
    "timeline",
    "stewardshipHistory",
    "followUpTasks",
    "photos"
  ];

  for (const key of collections) {
    const prevValue = previous[key];
    const nextValue = next[key];
    if (!Array.isArray(prevValue)) continue;
    const nextArray = Array.isArray(nextValue) ? nextValue : [];
    if (nextArray.length < prevValue.length) {
      throw new Error(`Archive integrity violation: ${String(key)} cannot shrink`);
    }
  }

  if (previous.consultantSummary && !next.consultantSummary) {
    throw new Error("Archive integrity violation: consultantSummary cannot be removed");
  }
  if (previous.journeyArchive && !next.journeyArchive) {
    throw new Error("Archive integrity violation: journeyArchive cannot be removed");
  }
  if (previous.successStoryConsent && next.successStoryConsent) {
    if (next.successStoryConsent.history.length < previous.successStoryConsent.history.length) {
      throw new Error("Archive integrity violation: successStoryConsent history cannot shrink");
    }
    const prevCategories = previous.successStoryConsent.storyProfile?.categories ?? [];
    const nextCategories = next.successStoryConsent.storyProfile?.categories ?? [];
    if (nextCategories.length < prevCategories.length) {
      throw new Error("Archive integrity violation: story categories cannot shrink");
    }
  }
  if (previous.journeyMilestoneTimeline && next.journeyMilestoneTimeline) {
    if (
      next.journeyMilestoneTimeline.milestones.length <
      previous.journeyMilestoneTimeline.milestones.length
    ) {
      throw new Error("Archive integrity violation: journey milestones cannot shrink");
    }
  }
  if (previous.journeyMilestoneTimeline && !next.journeyMilestoneTimeline) {
    throw new Error("Archive integrity violation: journeyMilestoneTimeline cannot be removed");
  }
  if (previous.journeyId && next.journeyId && previous.journeyId !== next.journeyId) {
    throw new Error("Archive integrity violation: journeyId cannot change");
  }
}

export function deriveRelationshipStatus(member: ConciergeMemberRecord): RelationshipJourneyStatus {
  if (member.journeyArchive?.relationshipStatus) {
    return member.journeyArchive.relationshipStatus;
  }
  if (member.status === "legacy-archive") return "legacy-archive";
  if (member.status === "married") return "married";
  if (member.status === "engaged") return "engaged";
  if (member.status === "exclusive") return "exclusive";
  if (member.status === "matched") return "matched";
  if (member.status === "paused") return "paused";
  if (member.status === "closed") return "closed";
  if (["relationship", "introductions-in-progress", "active-search", "accepted"].includes(member.status)) {
    return "active";
  }
  return "active";
}

export function normalizeJourneyArchive(member: ConciergeMemberRecord): ConciergeMemberRecord {
  const relationshipStatus = deriveRelationshipStatus(member);
  const journeyArchive: JourneyArchiveMetadata = {
    ...member.journeyArchive,
    relationshipStatus,
    isLegacyArchive: relationshipStatus === "legacy-archive",
    relationshipFormedAt: member.journeyArchive?.relationshipFormedAt,
    marriedAt: member.journeyArchive?.marriedAt,
    archivedAt: member.journeyArchive?.archivedAt,
    futureMilestones: member.journeyArchive?.futureMilestones
  };

  return {
    ...member,
    journeyArchive
  };
}

export function registerArchivedMember(memberId: string): void {
  const registry = loadArchiveRegistry();
  if (registry.memberIds.includes(memberId)) return;
  saveArchiveRegistry({
    ...registry,
    memberIds: [...registry.memberIds, memberId]
  });
}

export function listArchivedMemberIds(): string[] {
  return loadArchiveRegistry().memberIds;
}

export function marriageYearFromMember(member: ConciergeMemberRecord): number | null {
  const marriedAt = member.journeyArchive?.marriedAt;
  if (!marriedAt) return null;
  const parsed = Date.parse(marriedAt);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).getUTCFullYear();
}

export function archiveMemberJourney(
  member: ConciergeMemberRecord,
  input: {
    relationshipStatus: RelationshipJourneyStatus;
    relationshipFormedAt?: string;
    marriedAt?: string;
    archivedAt?: string;
    timelineDetail?: string;
  }
): ConciergeMemberRecord {
  const now = input.archivedAt ?? new Date().toISOString();
  const journeyId = member.journeyId ?? "";
  const timeline: ConciergeTimelineEvent[] = [...member.timeline];

  if (input.relationshipStatus === "engaged" && !timeline.some((event) => event.type === "engagement")) {
    timeline.unshift({
      id: `tl_eng_${Date.now().toString(36)}`,
      memberId: member.id,
      journeyId,
      type: "engagement",
      label: "Engagement",
      at: now,
      detail: input.timelineDetail
    });
  }

  if (input.relationshipStatus === "married" && !timeline.some((event) => event.type === "marriage")) {
    timeline.unshift({
      id: `tl_mar_${Date.now().toString(36)}`,
      memberId: member.id,
      journeyId,
      type: "marriage",
      label: "Marriage",
      at: input.marriedAt ?? now,
      detail: input.timelineDetail
    });
  }

  if (
    input.relationshipStatus === "legacy-archive" &&
    !timeline.some((event) => event.type === "archived")
  ) {
    timeline.unshift({
      id: `tl_arc_${Date.now().toString(36)}`,
      memberId: member.id,
      journeyId,
      type: "archived",
      label: "Archived",
      at: now,
      detail: input.timelineDetail ?? "Relationship journey moved to Legacy Archive."
    });
  }

  const next: ConciergeMemberRecord = normalizeJourneyArchive({
    ...member,
    status: input.relationshipStatus === "legacy-archive" ? "legacy-archive" : member.status,
    timeline,
    journeyArchive: {
      relationshipStatus: input.relationshipStatus,
      relationshipFormedAt: input.relationshipFormedAt ?? member.journeyArchive?.relationshipFormedAt,
      marriedAt: input.marriedAt ?? member.journeyArchive?.marriedAt,
      archivedAt:
        input.relationshipStatus === "legacy-archive"
          ? now
          : member.journeyArchive?.archivedAt,
      isLegacyArchive: input.relationshipStatus === "legacy-archive",
      futureMilestones: member.journeyArchive?.futureMilestones
    }
  });

  registerArchivedMember(member.id);
  return next;
}

export function filterMembersForArchiveSearch(
  members: ConciergeMemberRecord[],
  filters: {
    query?: string;
    archiveStatus?: RelationshipJourneyStatus | "all";
    marriageYear?: string;
    consultant?: string;
    city?: string;
    tier?: string;
  }
): ConciergeMemberRecord[] {
  const query = (filters.query ?? "").trim().toLowerCase();
  const marriageYear = (filters.marriageYear ?? "").trim();

  return members.filter((member) => {
    const archive = member.journeyArchive;
    if (!archive) return false;

    if (filters.archiveStatus && filters.archiveStatus !== "all") {
      if (archive.relationshipStatus !== filters.archiveStatus) return false;
    }
    if (filters.consultant) {
      const consultant = member.assignedConsultantName ?? "";
      if (!consultant.toLowerCase().includes(filters.consultant.toLowerCase())) return false;
    }
    if (filters.city && !member.aboutYou.city.toLowerCase().includes(filters.city.toLowerCase())) {
      return false;
    }
    if (filters.tier && filters.tier !== "all" && member.preferredTier !== filters.tier) {
      return false;
    }
    if (marriageYear) {
      const year = marriageYearFromMember(member);
      if (!year || String(year) !== marriageYear) return false;
    }
    if (!query) return true;
    const haystack = [
      member.journeyId ?? "",
      member.aboutYou.name,
      member.aboutYou.city,
      member.assignedConsultantName ?? "",
      member.preferredTier ?? "",
      archive.relationshipStatus
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function listArchiveEligibleMembers(members: ConciergeMemberRecord[]): ConciergeMemberRecord[] {
  return members.filter(
    (member) =>
      member.journeyArchive?.isLegacyArchive ||
      member.journeyArchive?.archivedAt ||
      ["married", "engaged", "legacy-archive", "closed"].includes(member.status)
  );
}

export function resetJourneyArchiveRegistryForTests(): void {
  writeJson(ARCHIVE_KEY, createEmptyArchiveRegistry());
}
