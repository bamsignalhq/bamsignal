import type { SavedSearchRecord, SearchIndexEntry } from "../types/searchCenter";

export const SEARCH_SAVED_SEARCHES_SEED: SavedSearchRecord[] = [
  {
    id: "saved-001",
    label: "Unassigned Lagos applications",
    query: "lagos applied",
    entity: "applications",
    createdAt: "2026-06-20T10:00:00.000Z",
    useCount: 14
  },
  {
    id: "saved-002",
    label: "Failed payments this week",
    query: "failed paystack",
    entity: "payments",
    createdAt: "2026-06-18T08:00:00.000Z",
    useCount: 8
  },
  {
    id: "saved-003",
    label: "Open support escalations",
    query: "escalated urgent",
    entity: "support",
    createdAt: "2026-06-15T14:00:00.000Z",
    useCount: 22
  },
  {
    id: "saved-004",
    label: "Consultation reminders",
    query: "consultation reminder",
    entity: "notifications",
    createdAt: "2026-06-10T09:00:00.000Z",
    useCount: 6
  }
];

export const SEARCH_SUPPLEMENTAL_INDEX_SEED: SearchIndexEntry[] = [
  {
    id: "research-001",
    entity: "research",
    title: "Nigerian Relationship Index Q2 2026",
    subtitle: "Institute research",
    preview: "Quarterly corridor analysis — Lagos, Abuja, diaspora engagement trends.",
    searchText: "nigerian relationship index q2 2026 research corridor diaspora",
    jumpPath: "/hard/metrics",
    updatedAt: "2026-06-24T12:00:00.000Z"
  },
  {
    id: "research-002",
    entity: "research",
    title: "Trust Score Methodology",
    subtitle: "BamSignal Institute",
    preview: "How institutional trust scores are calculated for members and consultants.",
    searchText: "trust score methodology institute research",
    jumpPath: "/hard/metrics",
    updatedAt: "2026-06-20T08:00:00.000Z"
  },
  {
    id: "signal-001",
    entity: "signals",
    title: "Signal activity — Ada O.",
    subtitle: "Member signal",
    preview: "Outbound signal sent to Chidi M. — awaiting response.",
    searchText: "signal ada chidi outbound awaiting",
    jumpPath: "/hard/concierge",
    updatedAt: "2026-06-26T09:00:00.000Z",
    quickActionId: "open-member"
  },
  {
    id: "signal-002",
    entity: "signals",
    title: "Mutual signal — Lagos corridor",
    subtitle: "Discovery signal",
    preview: "Two members exchanged signals in Lagos community.",
    searchText: "mutual signal lagos corridor discovery",
    jumpPath: "/hard/discover",
    updatedAt: "2026-06-25T18:00:00.000Z"
  }
];
