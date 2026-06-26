import { SEARCH_SAVED_SEARCHES_SEED } from "../data/searchCenterSeed";
import type { RecentSearchRecord, SavedSearchRecord } from "../types/searchCenter";
import type { SearchEntityId } from "../constants/searchCenter";

const STORAGE_KEY = "bamsignal.searchCenter.v1";

type SearchCenterStoreState = {
  savedSearches: SavedSearchRecord[];
  recentSearches: RecentSearchRecord[];
  updatedAt: string;
};

function readState(): SearchCenterStoreState {
  if (typeof window === "undefined") {
    return {
      savedSearches: [...SEARCH_SAVED_SEARCHES_SEED],
      recentSearches: [],
      updatedAt: new Date().toISOString()
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        savedSearches: [...SEARCH_SAVED_SEARCHES_SEED],
        recentSearches: [],
        updatedAt: new Date().toISOString()
      };
    }
    const parsed = JSON.parse(raw) as SearchCenterStoreState;
    return {
      savedSearches: Array.isArray(parsed.savedSearches)
        ? parsed.savedSearches
        : [...SEARCH_SAVED_SEARCHES_SEED],
      recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches : [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString()
    };
  } catch {
    return {
      savedSearches: [...SEARCH_SAVED_SEARCHES_SEED],
      recentSearches: [],
      updatedAt: new Date().toISOString()
    };
  }
}

function writeState(state: SearchCenterStoreState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function listSavedSearches(): SavedSearchRecord[] {
  return readState().savedSearches;
}

export function listRecentSearches(): RecentSearchRecord[] {
  return readState().recentSearches;
}

export function recordRecentSearch(input: {
  query: string;
  entity: SearchEntityId | "all";
  resultCount: number;
}): void {
  if (!input.query.trim()) return;
  const state = readState();
  const entry: RecentSearchRecord = {
    id: `recent-${Date.now()}`,
    query: input.query.trim(),
    entity: input.entity,
    searchedAt: new Date().toISOString(),
    resultCount: input.resultCount
  };
  state.recentSearches = [
    entry,
    ...state.recentSearches.filter(
      (item) => !(item.query === entry.query && item.entity === entry.entity)
    )
  ].slice(0, 20);
  state.updatedAt = new Date().toISOString();
  writeState(state);
}

export function saveSearchQuery(input: {
  label: string;
  query: string;
  entity: SearchEntityId | "all";
}): SavedSearchRecord {
  const state = readState();
  const record: SavedSearchRecord = {
    id: `saved-${Date.now()}`,
    label: input.label,
    query: input.query.trim(),
    entity: input.entity,
    createdAt: new Date().toISOString(),
    useCount: 0
  };
  state.savedSearches = [record, ...state.savedSearches].slice(0, 50);
  state.updatedAt = new Date().toISOString();
  writeState(state);
  return record;
}

export function incrementSavedSearchUse(id: string): void {
  const state = readState();
  state.savedSearches = state.savedSearches.map((item) =>
    item.id === id ? { ...item, useCount: item.useCount + 1 } : item
  );
  state.updatedAt = new Date().toISOString();
  writeState(state);
}

export function removeSavedSearch(id: string): void {
  const state = readState();
  state.savedSearches = state.savedSearches.filter((item) => item.id !== id);
  state.updatedAt = new Date().toISOString();
  writeState(state);
}
