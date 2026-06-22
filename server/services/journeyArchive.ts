/** Permanent relationship archive — journeys are never deleted. */

export type RelationshipJourneyStatus =
  | "active"
  | "paused"
  | "matched"
  | "exclusive"
  | "engaged"
  | "married"
  | "closed"
  | "legacy-archive";

export type JourneyArchiveSnapshot = {
  memberId: string;
  journeyId: string;
  relationshipStatus: RelationshipJourneyStatus;
  relationshipFormedAt?: string;
  marriedAt?: string;
  archivedAt?: string;
  isLegacyArchive: boolean;
  preservedAt: string;
};

export type JourneyArchiveRegistryState = {
  snapshots: Record<string, JourneyArchiveSnapshot>;
  journeyIndex: Record<string, string>;
  updatedAt: string;
};

export const JOURNEY_ARCHIVE_IMMUTABLE_KEYS = [
  "privateNotes",
  "introductions",
  "consultantSummary",
  "communicationJournal",
  "timeline",
  "stewardshipHistory",
  "followUpTasks"
] as const;

export function createEmptyJourneyArchiveRegistry(now = new Date().toISOString()): JourneyArchiveRegistryState {
  return { snapshots: {}, journeyIndex: {}, updatedAt: now };
}

export function marriageYearFromDate(isoDate?: string): number | null {
  if (!isoDate) return null;
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).getUTCFullYear();
}

export function assertNoArchiveDeletion<T extends Record<string, unknown>>(
  previous: T,
  next: T,
  keys: readonly string[] = JOURNEY_ARCHIVE_IMMUTABLE_KEYS
): void {
  for (const key of keys) {
    const prevValue = previous[key];
    const nextValue = next[key];
    if (prevValue === undefined) continue;
    if (Array.isArray(prevValue)) {
      const nextArray = Array.isArray(nextValue) ? nextValue : [];
      if (nextArray.length < prevValue.length) {
        throw new Error(`Archive integrity violation: ${key} cannot shrink`);
      }
      continue;
    }
    if (typeof prevValue === "object" && prevValue !== null) {
      if (!nextValue || typeof nextValue !== "object") {
        throw new Error(`Archive integrity violation: ${key} cannot be removed`);
      }
    }
  }
}

export function registerJourneyArchiveSnapshot(
  state: JourneyArchiveRegistryState,
  snapshot: JourneyArchiveSnapshot
): JourneyArchiveRegistryState {
  if (state.journeyIndex[snapshot.journeyId] && state.journeyIndex[snapshot.journeyId] !== snapshot.memberId) {
    throw new Error("Journey archive already registered to another member");
  }
  return {
    ...state,
    snapshots: { ...state.snapshots, [snapshot.memberId]: snapshot },
    journeyIndex: { ...state.journeyIndex, [snapshot.journeyId]: snapshot.memberId },
    updatedAt: new Date().toISOString()
  };
}

export function getArchiveSnapshotForMember(
  state: JourneyArchiveRegistryState,
  memberId: string
): JourneyArchiveSnapshot | null {
  return state.snapshots[memberId] ?? null;
}

export function listArchiveSnapshots(state: JourneyArchiveRegistryState): JourneyArchiveSnapshot[] {
  return Object.values(state.snapshots).sort((a, b) => {
    const aTime = a.archivedAt ?? a.preservedAt;
    const bTime = b.archivedAt ?? b.preservedAt;
    return bTime.localeCompare(aTime);
  });
}

export type ArchiveSearchInput = {
  query?: string;
  archiveStatus?: RelationshipJourneyStatus | "all";
  marriageYear?: string;
  consultant?: string;
  city?: string;
  tier?: string;
};

export type ArchiveSearchMember = {
  memberId: string;
  journeyId: string;
  name: string;
  city: string;
  tier?: string;
  consultant?: string;
  archive: JourneyArchiveSnapshot;
};

export function filterArchiveMembers(
  members: ArchiveSearchMember[],
  filters: ArchiveSearchInput
): ArchiveSearchMember[] {
  const query = (filters.query ?? "").trim().toLowerCase();
  const marriageYear = (filters.marriageYear ?? "").trim();

  return members.filter((member) => {
    if (filters.archiveStatus && filters.archiveStatus !== "all") {
      if (member.archive.relationshipStatus !== filters.archiveStatus) return false;
    }
    if (filters.consultant && !(member.consultant ?? "").toLowerCase().includes(filters.consultant.toLowerCase())) {
      return false;
    }
    if (filters.city && !member.city.toLowerCase().includes(filters.city.toLowerCase())) {
      return false;
    }
    if (filters.tier && filters.tier !== "all" && member.tier !== filters.tier) {
      return false;
    }
    if (marriageYear) {
      const year = marriageYearFromDate(member.archive.marriedAt);
      if (!year || String(year) !== marriageYear) return false;
    }
    if (!query) return true;
    const haystack = [
      member.journeyId,
      member.name,
      member.city,
      member.consultant ?? "",
      member.tier ?? "",
      member.archive.relationshipStatus
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function isLegacyArchiveStatus(status: RelationshipJourneyStatus): boolean {
  return status === "legacy-archive";
}
