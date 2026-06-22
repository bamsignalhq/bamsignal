import type { JourneyStoryCategoryId } from "../constants/journeyStoryCategories";
import {
  LEGACY_ANNIVERSARY_MILESTONE_IDS,
  LEGACY_TIMELINE_PHASES,
  type LegacyIndexFilters,
  type LegacyStatusId,
  type LegacyTimelinePhaseId
} from "../constants/relationshipLegacyIndex";
import { milestoneYearFromDate } from "../constants/journeyMilestones";
import { isValidJourneyId, normalizeJourneyId } from "../constants/journeyId";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { JourneyMilestoneEntry } from "../types/journeyMilestone";
import type { JourneyStoryCategoryEntry } from "../types/JourneyStoryType";
import type {
  LegacyStatusChange,
  RelationshipLegacyIndexRecord
} from "../types/relationshipLegacyIndex";
import { marriageYearFromMember } from "./conciergeJourneyArchive";

export function createEmptyLegacyIndexRecord(input: {
  journeyId: string;
  memberId: string;
  country?: string;
  legacyStatus?: LegacyStatusId;
  registeredBy?: string;
}): RelationshipLegacyIndexRecord {
  const now = new Date().toISOString();
  const legacyStatus = input.legacyStatus ?? "active-legacy";
  return {
    journeyId: input.journeyId,
    memberId: input.memberId,
    legacyStatus,
    country: input.country ?? "Nigeria",
    registeredAt: now,
    updatedAt: now,
    statusHistory: [{ to: legacyStatus, at: now, by: input.registeredBy }],
    futureLegacy: {
      enabled: false,
      kinds: [
        "silver-anniversaries",
        "golden-anniversaries",
        "legacy-events",
        "couple-celebrations",
        "family-milestones"
      ]
    }
  };
}

export function assertLegacyIndexIntegrity(
  previous: RelationshipLegacyIndexRecord,
  next: RelationshipLegacyIndexRecord
): void {
  if (previous.journeyId !== next.journeyId) {
    throw new Error("Legacy index violation: journeyId cannot change");
  }
  if (previous.memberId !== next.memberId) {
    throw new Error("Legacy index violation: memberId cannot change");
  }
  if (previous.registeredAt !== next.registeredAt) {
    throw new Error("Legacy index violation: registeredAt cannot be overwritten");
  }
  if (next.statusHistory.length < previous.statusHistory.length) {
    throw new Error("Legacy index violation: status history cannot shrink");
  }
}

export function evolveLegacyStatus(
  record: RelationshipLegacyIndexRecord,
  input: { legacyStatus: LegacyStatusId; by?: string }
): RelationshipLegacyIndexRecord {
  if (record.legacyStatus === input.legacyStatus) return record;
  const now = new Date().toISOString();
  const change: LegacyStatusChange = {
    from: record.legacyStatus,
    to: input.legacyStatus,
    at: now,
    by: input.by
  };
  return {
    ...record,
    legacyStatus: input.legacyStatus,
    updatedAt: now,
    statusHistory: [...record.statusHistory, change]
  };
}

export function mergeLegacyIndexRecords(
  existing: RelationshipLegacyIndexRecord,
  incoming: RelationshipLegacyIndexRecord
): RelationshipLegacyIndexRecord {
  if (existing.journeyId !== incoming.journeyId) {
    throw new Error("Legacy index violation: cannot merge different journey IDs");
  }
  const merged: RelationshipLegacyIndexRecord = {
    ...existing,
    legacyStatus: incoming.legacyStatus ?? existing.legacyStatus,
    country: existing.country || incoming.country,
    updatedAt: incoming.updatedAt > existing.updatedAt ? incoming.updatedAt : existing.updatedAt,
    statusHistory:
      incoming.statusHistory.length > existing.statusHistory.length
        ? incoming.statusHistory
        : existing.statusHistory,
    futureLegacy: existing.futureLegacy ?? incoming.futureLegacy
  };
  assertLegacyIndexIntegrity(existing, merged);
  return merged;
}

export type LegacyTimelinePhaseView = {
  id: LegacyTimelinePhaseId;
  label: string;
  reached: boolean;
};

export function deriveLegacyTimelinePhases(input: {
  milestones: JourneyMilestoneEntry[];
  hasFamilyStory?: boolean;
  isLegacyArchive?: boolean;
}): LegacyTimelinePhaseView[] {
  const milestoneIds = new Set(input.milestones.map((item) => item.id));
  const hasAnniversary = LEGACY_ANNIVERSARY_MILESTONE_IDS.some((id) => milestoneIds.has(id));

  const reachedByPhase: Record<LegacyTimelinePhaseId, boolean> = {
    met: milestoneIds.has("met"),
    relationship: milestoneIds.has("relationship-formed"),
    engagement: milestoneIds.has("engaged"),
    marriage: milestoneIds.has("married"),
    anniversaries: hasAnniversary,
    "family-milestones": Boolean(input.hasFamilyStory),
    "legacy-archive": Boolean(input.isLegacyArchive)
  };

  return LEGACY_TIMELINE_PHASES.map((phase) => ({
    id: phase.id,
    label: phase.label,
    reached: reachedByPhase[phase.id]
  }));
}

export function filterAnniversaryMilestones(
  milestones: JourneyMilestoneEntry[]
): JourneyMilestoneEntry[] {
  const allowed = new Set<string>(LEGACY_ANNIVERSARY_MILESTONE_IDS);
  return milestones.filter((item) => allowed.has(item.id));
}

export function milestoneYearById(
  milestones: JourneyMilestoneEntry[],
  id: JourneyMilestoneEntry["id"]
): string | undefined {
  const entry = milestones.find((item) => item.id === id);
  if (!entry) return undefined;
  const year = milestoneYearFromDate(entry.milestoneAt);
  return year || undefined;
}

export type LegacyProfileViewModel = {
  journeyId: string;
  memberId: string;
  memberName: string;
  city: string;
  country: string;
  consultantName?: string;
  legacyStatus: LegacyStatusId;
  metYear?: string;
  engagedYear?: string;
  marriedYear?: string;
  storyCategories: JourneyStoryCategoryEntry[];
  anniversaryMilestones: JourneyMilestoneEntry[];
  timelinePhases: LegacyTimelinePhaseView[];
  registeredAt: string;
};

export function buildLegacyProfileViewModel(input: {
  member: ConciergeMemberRecord;
  index: RelationshipLegacyIndexRecord;
  storyCategories: JourneyStoryCategoryEntry[];
  milestones: JourneyMilestoneEntry[];
}): LegacyProfileViewModel {
  const { member, index, storyCategories, milestones } = input;
  const hasFamilyStory = storyCategories.some((item) => item.id === "family-story");

  return {
    journeyId: index.journeyId,
    memberId: index.memberId,
    memberName: member.aboutYou.name,
    city: member.aboutYou.city,
    country: index.country,
    consultantName: member.assignedConsultantName,
    legacyStatus: index.legacyStatus,
    metYear: milestoneYearById(milestones, "met"),
    engagedYear: milestoneYearById(milestones, "engaged"),
    marriedYear: milestoneYearById(milestones, "married"),
    storyCategories,
    anniversaryMilestones: filterAnniversaryMilestones(milestones),
    timelinePhases: deriveLegacyTimelinePhases({
      milestones,
      hasFamilyStory,
      isLegacyArchive: member.journeyArchive?.isLegacyArchive
    }),
    registeredAt: index.registeredAt
  };
}

export function filterLegacyIndexMembers(
  members: ConciergeMemberRecord[],
  filters: LegacyIndexFilters,
  indexByJourneyId: Record<string, RelationshipLegacyIndexRecord>,
  storyCategoriesByJourneyId: Record<string, JourneyStoryCategoryEntry[]>
): ConciergeMemberRecord[] {
  const query = (filters.query ?? "").trim();
  const marriageYear = (filters.marriageYear ?? "").trim();

  return members.filter((member) => {
    if (!member.journeyId) return false;
    const index = indexByJourneyId[member.journeyId];
    if (!index) return false;

    if (filters.legacyStatus !== "all" && index.legacyStatus !== filters.legacyStatus) {
      return false;
    }
    if (filters.consultant) {
      const consultant = member.assignedConsultantName ?? "";
      if (!consultant.toLowerCase().includes(filters.consultant.toLowerCase())) return false;
    }
    if (filters.city && !member.aboutYou.city.toLowerCase().includes(filters.city.toLowerCase())) {
      return false;
    }
    if (filters.country && !index.country.toLowerCase().includes(filters.country.toLowerCase())) {
      return false;
    }
    if (marriageYear) {
      const year = marriageYearFromMember(member);
      if (!year || String(year) !== marriageYear) return false;
    }
    if (filters.storyCategory !== "all") {
      const categories = storyCategoriesByJourneyId[member.journeyId] ?? [];
      if (!categories.some((item) => item.id === filters.storyCategory)) return false;
    }
    if (!query) return true;

    const normalizedQuery = isValidJourneyId(query) ? normalizeJourneyId(query) : query.toLowerCase();
    const categoryLabels = (storyCategoriesByJourneyId[member.journeyId] ?? [])
      .map((item) => item.id)
      .join(" ");
    const haystack = [
      member.journeyId,
      member.aboutYou.name,
      member.aboutYou.city,
      index.country,
      member.assignedConsultantName ?? "",
      index.legacyStatus,
      categoryLabels
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function isLegacyIndexEligible(member: ConciergeMemberRecord): boolean {
  return Boolean(
    member.journeyId &&
      (member.journeyArchive?.isLegacyArchive ||
        member.journeyArchive?.archivedAt ||
        ["married", "legacy-archive"].includes(member.status))
  );
}
