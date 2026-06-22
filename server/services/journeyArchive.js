/** Permanent relationship archive — journeys are never deleted. */

export const JOURNEY_ARCHIVE_IMMUTABLE_KEYS = [
  "privateNotes",
  "introductions",
  "consultantSummary",
  "communicationJournal",
  "timeline",
  "stewardshipHistory",
  "followUpTasks"
];

export function createEmptyJourneyArchiveRegistry(now = new Date().toISOString()) {
  return { snapshots: {}, journeyIndex: {}, updatedAt: now };
}

export function marriageYearFromDate(isoDate) {
  if (!isoDate) return null;
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).getUTCFullYear();
}

export function assertNoArchiveDeletion(previous, next, keys = JOURNEY_ARCHIVE_IMMUTABLE_KEYS) {
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

export function registerJourneyArchiveSnapshot(state, snapshot) {
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

export function getArchiveSnapshotForMember(state, memberId) {
  return state.snapshots[memberId] ?? null;
}

export function listArchiveSnapshots(state) {
  return Object.values(state.snapshots).sort((a, b) => {
    const aTime = a.archivedAt ?? a.preservedAt;
    const bTime = b.archivedAt ?? b.preservedAt;
    return bTime.localeCompare(aTime);
  });
}

export function filterArchiveMembers(members, filters) {
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

export function isLegacyArchiveStatus(status) {
  return status === "legacy-archive";
}
