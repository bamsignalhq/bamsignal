import type { RecentSearchRecord, SavedSearchRecord } from "../../../types/searchCenter";
import { SEARCH_ENTITY_LABELS } from "../../../constants/searchCenter";

type SearchSavedRecentCardProps = {
  saved: SavedSearchRecord[];
  recent: RecentSearchRecord[];
  onApply: (query: string, entity: SavedSearchRecord["entity"]) => void;
  onSave: () => void;
  onRemoveSaved: (id: string) => void;
};

export function SearchSavedRecentCard({
  saved,
  recent,
  onApply,
  onSave,
  onRemoveSaved
}: SearchSavedRecentCardProps) {
  return (
    <div className="search-saved-recent">
      <section className="search-saved-card concierge-consultant-card--glass cc-reveal">
        <header className="search-saved-card__head">
          <div>
            <h3>Saved searches</h3>
            <p>Reusable operator queries for daily workflows.</p>
          </div>
          <button type="button" className="concierge-consultant-btn" onClick={onSave}>
            Save current
          </button>
        </header>
        {saved.length ? (
          <ul className="search-saved-card__list">
            {saved.map((item) => (
              <li key={item.id} className="search-saved-row">
                <button
                  type="button"
                  className="search-saved-row__apply"
                  onClick={() => onApply(item.query, item.entity)}
                >
                  <strong>{item.label}</strong>
                  <span>
                    {item.query} · {item.entity === "all" ? "All" : SEARCH_ENTITY_LABELS[item.entity]} ·
                    used {item.useCount}×
                  </span>
                </button>
                <button
                  type="button"
                  className="search-saved-row__remove"
                  onClick={() => onRemoveSaved(item.id)}
                  aria-label={`Remove ${item.label}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="search-saved-card__empty">No saved searches yet.</p>
        )}
      </section>

      <section className="search-recent-card concierge-consultant-card--glass cc-reveal">
        <header>
          <h3>Recent searches</h3>
          <p>Last 20 queries run in this command center.</p>
        </header>
        {recent.length ? (
          <ul className="search-recent-card__list">
            {recent.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="search-recent-row"
                  onClick={() => onApply(item.query, item.entity)}
                >
                  <strong>{item.query || "(empty)"}</strong>
                  <span>
                    {item.entity === "all" ? "All entities" : SEARCH_ENTITY_LABELS[item.entity]} ·{" "}
                    {item.resultCount} results · {new Date(item.searchedAt).toLocaleString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="search-recent-card__empty">Run a search to populate recent history.</p>
        )}
      </section>
    </div>
  );
}
