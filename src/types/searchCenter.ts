import type { SearchEntityId, SearchQuickActionId } from "../constants/searchCenter";

export type SearchIndexEntry = {
  id: string;
  entity: SearchEntityId;
  title: string;
  subtitle?: string;
  preview: string;
  searchText: string;
  jumpPath: string;
  updatedAt: string;
  quickActionId?: SearchQuickActionId;
};

export type SearchHighlightPart = {
  text: string;
  highlight: boolean;
};

export type SearchResultRecord = SearchIndexEntry & {
  score: number;
  highlightedTitle: SearchHighlightPart[];
  highlightedPreview: SearchHighlightPart[];
};

export type SearchResultGroup = {
  entity: SearchEntityId;
  label: string;
  results: SearchResultRecord[];
};

export type SearchFilters = {
  query: string;
  entity: SearchEntityId | "all";
};

export type SavedSearchRecord = {
  id: string;
  label: string;
  query: string;
  entity: SearchEntityId | "all";
  createdAt: string;
  useCount: number;
};

export type RecentSearchRecord = {
  id: string;
  query: string;
  entity: SearchEntityId | "all";
  searchedAt: string;
  resultCount: number;
};

export type SearchCenterSummary = {
  indexSize: number;
  entityCounts: Record<SearchEntityId, number>;
  lastIndexedAt: string;
};

export type EnterpriseSearchCenterBundle = {
  generatedAt: string;
  summary: SearchCenterSummary;
  filters: SearchFilters;
  groups: SearchResultGroup[];
  totalResults: number;
  savedSearches: SavedSearchRecord[];
  recentSearches: RecentSearchRecord[];
  index: SearchIndexEntry[];
};
