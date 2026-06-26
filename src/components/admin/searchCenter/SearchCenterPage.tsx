import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SEARCH_CENTER_KEYBOARD_SHORTCUT } from "../../../constants/searchCenter";
import {
  SEARCH_CENTER_ADMIN_BRAND,
  SEARCH_CENTER_ADMIN_PATH
} from "../../../constants/searchCenterAdmin";
import type { EnterpriseSearchCenterBundle, SearchFilters } from "../../../types/searchCenter";
import { buildLiveSearchCenterBundle } from "../../../utils/searchCenterEngine";
import {
  incrementSavedSearchUse,
  recordRecentSearch,
  removeSavedSearch,
  saveSearchQuery
} from "../../../utils/searchCenterStore";
import { SearchCommandPalette } from "./SearchCommandPalette";
import { SearchQuickActionsCard } from "./SearchQuickActionsCard";
import { SearchResultsCard } from "./SearchResultsCard";
import { SearchSavedRecentCard } from "./SearchSavedRecentCard";
import { SearchSummaryCard } from "./SearchSummaryCard";

const DEFAULT_FILTERS: SearchFilters = { query: "", entity: "all" };

function isModKey(event: KeyboardEvent) {
  return event.metaKey || event.ctrlKey;
}

export function SearchCenterPage() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [bundle, setBundle] = useState<EnterpriseSearchCenterBundle | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async (nextFilters: SearchFilters) => {
    const next = await buildLiveSearchCenterBundle(nextFilters);
    setBundle(next);
    return next;
  }, []);

  useEffect(() => {
    void refresh(appliedFilters);
  }, [appliedFilters, refresh]);

  const runSearch = useCallback(async () => {
    setAppliedFilters(filters);
    const next = await refresh(filters);
    recordRecentSearch({
      query: filters.query,
      entity: filters.entity,
      resultCount: next.totalResults
    });
    setPaletteOpen(true);
  }, [filters, refresh]);

  const handleApplySaved = useCallback(
    async (query: string, entity: SearchFilters["entity"], savedId?: string) => {
      const nextFilters = { query, entity };
      setFilters(nextFilters);
      setAppliedFilters(nextFilters);
      const next = await refresh(nextFilters);
      recordRecentSearch({ query, entity, resultCount: next.totalResults });
      if (savedId) incrementSavedSearchUse(savedId);
    },
    [refresh]
  );

  const handleSaveCurrent = useCallback(() => {
    if (!appliedFilters.query.trim()) {
      setToast("Enter a query before saving.");
      return;
    }
    const label =
      appliedFilters.query.length > 40
        ? `${appliedFilters.query.slice(0, 40)}…`
        : appliedFilters.query;
    saveSearchQuery({
      label,
      query: appliedFilters.query,
      entity: appliedFilters.entity
    });
    setToast("Search saved.");
    void refresh(appliedFilters);
  }, [appliedFilters, refresh]);

  const handleJump = useCallback((path: string) => {
    window.location.assign(path);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcutKey = SEARCH_CENTER_KEYBOARD_SHORTCUT.split("+").pop();
      if (!shortcutKey || !isModKey(event) || event.key.toLowerCase() !== shortcutKey) return;
      event.preventDefault();
      setPaletteOpen(true);
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const displayBundle = useMemo(() => bundle, [bundle]);

  return (
    <div className="search-center-page">
      <header className="search-center-page__head">
        <div>
          <h2>{SEARCH_CENTER_ADMIN_BRAND}</h2>
          <p>
            Instantly find members, consultants, journeys, payments, reports, notifications,
            documents, and everything else — with filters, saved searches, recent history, quick
            actions, and a command palette.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={() => void runSearch()}>
          Refresh index
        </button>
      </header>

      {toast ? <p className="search-center-page__toast">{toast}</p> : null}

      {displayBundle ? (
        <>
          <SearchCommandPalette
            filters={filters}
            totalResults={displayBundle.totalResults}
            paletteOpen={paletteOpen}
            onChange={setFilters}
            onSubmit={() => void runSearch()}
            inputRef={inputRef}
          />
          <SearchSummaryCard summary={displayBundle.summary} />
          <SearchSavedRecentCard
            saved={displayBundle.savedSearches}
            recent={displayBundle.recentSearches}
            onApply={(query, entity) => void handleApplySaved(query, entity)}
            onSave={handleSaveCurrent}
            onRemoveSaved={(id) => {
              removeSavedSearch(id);
              void refresh(appliedFilters);
            }}
          />
          <SearchResultsCard groups={displayBundle.groups} onJump={handleJump} />
          <SearchQuickActionsCard />
          <footer className="search-center-page__foot">
            <p>Admin path: {SEARCH_CENTER_ADMIN_PATH}</p>
            <p>Indexed: {new Date(displayBundle.generatedAt).toLocaleString()}</p>
          </footer>
        </>
      ) : (
        <p className="search-center-page__empty">Building search index…</p>
      )}
    </div>
  );
}
