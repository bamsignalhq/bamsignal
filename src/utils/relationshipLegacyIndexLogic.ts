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
  LegacyFamilyChange,
  LegacyFamilyProfile,
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
    legacyFamily: mergeLegacyFamilyProfiles(existing.legacyFamily, incoming.legacyFamily),
    futureLegacy: existing.futureLegacy ?? incoming.futureLegacy
  };
  assertLegacyIndexIntegrity(existing, merged);
  return merged;
}

function mergeLegacyFamilyProfiles(
  existing?: RelationshipLegacyIndexRecord["legacyFamily"],
  incoming?: RelationshipLegacyIndexRecord["legacyFamily"]
): RelationshipLegacyIndexRecord["legacyFamily"] {
  if (!existing) return incoming;
  if (!incoming) return existing;
  const history =
    incoming.history.length > existing.history.length ? incoming.history : existing.history;
  return {
    childrenCount: Math.max(existing.childrenCount, incoming.childrenCount),
    currentCountry: incoming.currentCountry || existing.currentCountry,
    recordedAt: incoming.recordedAt > existing.recordedAt ? incoming.recordedAt : existing.recordedAt,
    recordedBy: incoming.recordedBy ?? existing.recordedBy,
    history,
    futureFamily: existing.futureFamily ?? incoming.futureFamily
  };
}

export function assertLegacyFamilyIntegrity(
  previous: RelationshipLegacyIndexRecord["legacyFamily"],
  next: RelationshipLegacyIndexRecord["legacyFamily"]
): void {
  if (!previous) return;
  if (!next) {
    throw new Error("Legacy family violation: legacyFamily cannot be removed");
  }
  if (next.history.length < previous.history.length) {
    throw new Error("Legacy family violation: family history cannot shrink");
  }
  if (next.childrenCount < previous.childrenCount) {
    throw new Error("Legacy family violation: children count cannot decrease");
  }
}

export function recordLegacyFamilyProfile(
  record: RelationshipLegacyIndexRecord,
  input: { childrenCount: number; currentCountry: string; recordedBy?: string }
): RelationshipLegacyIndexRecord {
  const childrenCount = Math.max(0, Math.floor(input.childrenCount));
  const currentCountry = input.currentCountry.trim();
  if (!currentCountry) {
    throw new Error("Legacy family violation: current country is required");
  }

  const previous = record.legacyFamily;
  if (previous && childrenCount < previous.childrenCount) {
    throw new Error("Legacy family violation: children count cannot decrease");
  }

  const now = new Date().toISOString();
  const change: LegacyFamilyChange = {
    childrenCount,
    currentCountry,
    at: now,
    by: input.recordedBy
  };

  const legacyFamily: LegacyFamilyProfile = {
    childrenCount,
    currentCountry,
    recordedAt: previous?.recordedAt ?? now,
    recordedBy: input.recordedBy ?? previous?.recordedBy,
    history: [...(previous?.history ?? []), change],
    futureFamily: previous?.futureFamily ?? {
      enabled: false,
      kinds: ["family-events", "legacy-celebrations", "child-milestones"]
    }
  };

  if (previous) {
    assertLegacyFamilyIntegrity(previous, legacyFamily);
  }

  let nextRecord: RelationshipLegacyIndexRecord = {
    ...record,
    legacyFamily,
    updatedAt: now
  };

  if (childrenCount > 0 && record.legacyStatus !== "legacy-family") {
    nextRecord = evolveLegacyStatus(nextRecord, {
      legacyStatus: "legacy-family",
      by: input.recordedBy
    });
    nextRecord = { ...nextRecord, legacyFamily };
  }

  return nextRecord;
}

export function hasLegacyFamilyProfile(
  record: RelationshipLegacyIndexRecord
): boolean {
  return Boolean(record.legacyFamily && record.legacyFamily.childrenCount > 0);
}

export function legacyFamilySearchCountry(record: RelationshipLegacyIndexRecord): string {
  return record.legacyFamily?.currentCountry ?? record.country;
}

export type LegacyTimelinePhaseView = {
  id: LegacyTimelinePhaseId;
  label: string;
  reached: boolean;
};

export function deriveLegacyTimelinePhases(input: {
  milestones: JourneyMilestoneEntry[];
  hasFamilyStory?: boolean;
  hasLegacyFamily?: boolean;
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
    "family-milestones": Boolean(input.hasLegacyFamily || input.hasFamilyStory),
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

export type LegacyFamilyViewModel = {
  journeyId: string;
  metYear?: string;
  marriedYear?: string;
  childrenCount: number;
  currentCountry: string;
  legacyStatus: LegacyStatusId;
};

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
  legacyFamily?: LegacyFamilyViewModel;
};

export function buildLegacyProfileViewModel(input: {
  member: ConciergeMemberRecord;
  index: RelationshipLegacyIndexRecord;
  storyCategories: JourneyStoryCategoryEntry[];
  milestones: JourneyMilestoneEntry[];
}): LegacyProfileViewModel {
  const { member, index, storyCategories, milestones } = input;
  const hasFamilyStory = storyCategories.some((item) => item.id === "family-story");
  const hasLegacyFamily = hasLegacyFamilyProfile(index);
  const metYear = milestoneYearById(milestones, "met");
  const marriedYear = milestoneYearById(milestones, "married");

  return {
    journeyId: index.journeyId,
    memberId: index.memberId,
    memberName: member.aboutYou.name,
    city: member.aboutYou.city,
    country: index.country,
    consultantName: member.assignedConsultantName,
    legacyStatus: index.legacyStatus,
    metYear,
    engagedYear: milestoneYearById(milestones, "engaged"),
    marriedYear,
    storyCategories,
    anniversaryMilestones: filterAnniversaryMilestones(milestones),
    timelinePhases: deriveLegacyTimelinePhases({
      milestones,
      hasFamilyStory,
      hasLegacyFamily,
      isLegacyArchive: member.journeyArchive?.isLegacyArchive
    }),
    registeredAt: index.registeredAt,
    legacyFamily: index.legacyFamily
      ? {
          journeyId: index.journeyId,
          metYear,
          marriedYear,
          childrenCount: index.legacyFamily.childrenCount,
          currentCountry: index.legacyFamily.currentCountry,
          legacyStatus: index.legacyStatus
        }
      : undefined
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
    if (filters.country) {
      const country = legacyFamilySearchCountry(index);
      if (!country.toLowerCase().includes(filters.country.toLowerCase())) return false;
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
      index.legacyFamily?.currentCountry ?? "",
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
