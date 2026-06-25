/** Relationship Legacy Index™ — permanent archive identity, never deleted. */

const LEGACY_STATUS_ORDER = {
  "active-legacy": 10,
  "legacy-family": 20,
  "legacy-archive": 30,
  "anniversary-legacy": 40,
  "golden-legacy": 50
};

const LEGACY_ANNIVERSARY_MILESTONE_IDS = new Set([
  "first-anniversary",
  "five-years-together",
  "ten-years-together",
  "twenty-years-together",
  "silver-anniversary",
  "golden-anniversary"
]);

export function createEmptyLegacyIndexRecord(input) {
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

export function assertLegacyIndexIntegrity(previous, next) {
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

export function registerLegacyIndexEntry(state, record) {
  const existing = state.byJourneyId[record.journeyId];
  if (existing) {
    return { ...state, byJourneyId: { ...state.byJourneyId, [record.journeyId]: existing } };
  }
  return {
    ...state,
    byJourneyId: { ...state.byJourneyId, [record.journeyId]: record },
    updatedAt: new Date().toISOString()
  };
}

export function evolveLegacyStatus(record, input) {
  if (record.legacyStatus === input.legacyStatus) return record;
  const now = new Date().toISOString();
  return {
    ...record,
    legacyStatus: input.legacyStatus,
    updatedAt: now,
    statusHistory: [
      ...record.statusHistory,
      { from: record.legacyStatus, to: input.legacyStatus, at: now, by: input.by }
    ]
  };
}

export function assertLegacyFamilyIntegrity(previous, next) {
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

export function recordLegacyFamilyProfile(record, input) {
  const childrenCount = Math.max(0, Math.floor(input.childrenCount));
  const currentCountry = (input.currentCountry ?? "").trim();
  if (!currentCountry) {
    throw new Error("Legacy family violation: current country is required");
  }

  const previous = record.legacyFamily;
  if (previous && childrenCount < previous.childrenCount) {
    throw new Error("Legacy family violation: children count cannot decrease");
  }

  const now = new Date().toISOString();
  const change = {
    childrenCount,
    currentCountry,
    at: now,
    by: input.recordedBy
  };

  const legacyFamily = {
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

  let nextRecord = {
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

export function legacyFamilySearchCountry(record) {
  return record.legacyFamily?.currentCountry ?? record.country;
}

export function filterAnniversaryMilestones(milestones) {
  return (milestones ?? []).filter((item) => LEGACY_ANNIVERSARY_MILESTONE_IDS.has(item.id));
}

export function deriveLegacyTimelinePhases({ milestones, hasFamilyStory, hasLegacyFamily, isLegacyArchive }) {
  const milestoneIds = new Set((milestones ?? []).map((item) => item.id));
  const hasAnniversary = [...LEGACY_ANNIVERSARY_MILESTONE_IDS].some((id) => milestoneIds.has(id));
  const phases = [
    { id: "met", label: "Met", reached: milestoneIds.has("met") },
    { id: "relationship", label: "Relationship", reached: milestoneIds.has("relationship-formed") },
    { id: "engagement", label: "Engagement", reached: milestoneIds.has("engaged") },
    { id: "marriage", label: "Marriage", reached: milestoneIds.has("married") },
    { id: "anniversaries", label: "Anniversaries", reached: hasAnniversary },
    {
      id: "family-milestones",
      label: "Family Milestones",
      reached: Boolean(hasLegacyFamily || hasFamilyStory)
    },
    { id: "legacy-archive", label: "Legacy Archive", reached: Boolean(isLegacyArchive) }
  ];
  return phases;
}

export function filterLegacyIndexEntries(entries, filters) {
  const query = (filters.query ?? "").trim().toLowerCase();
  const marriageYear = (filters.marriageYear ?? "").trim();

  return entries.filter((entry) => {
    if (filters.legacyStatus && filters.legacyStatus !== "all" && entry.legacyStatus !== filters.legacyStatus) {
      return false;
    }
    if (filters.consultant && !(entry.consultant ?? "").toLowerCase().includes(filters.consultant.toLowerCase())) {
      return false;
    }
    if (filters.city && !entry.city.toLowerCase().includes(filters.city.toLowerCase())) {
      return false;
    }
    if (filters.country) {
      const country = (entry.currentCountry ?? entry.country ?? "").toLowerCase();
      if (!country.includes(filters.country.toLowerCase())) return false;
    }
    if (marriageYear && String(entry.marriageYear ?? "") !== marriageYear) return false;
    if (filters.storyCategory && filters.storyCategory !== "all") {
      if (!(entry.storyCategories ?? []).includes(filters.storyCategory)) return false;
    }
    if (!query) return true;
    const haystack = [
      entry.journeyId,
      entry.memberName,
      entry.city,
      entry.country,
      entry.consultant ?? "",
      entry.legacyStatus,
      ...(entry.storyCategories ?? [])
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function legacyStatusRank(status) {
  return LEGACY_STATUS_ORDER[status] ?? 0;
}
