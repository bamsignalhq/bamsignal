import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_STATUSES,
  DOCUMENT_STATUS_LABELS
} from "../../../constants/documentCenter";
import type { DocumentSearchFilters } from "../../../types/documentCenter";
import type { DocumentCategoryId, DocumentStatusId } from "../../../constants/documentCenter";

type DocumentSearchBarProps = {
  filters: DocumentSearchFilters;
  onChange: (filters: DocumentSearchFilters) => void;
  onReset: () => void;
  resultCount: number;
};

export function DocumentSearchBar({ filters, onChange, onReset, resultCount }: DocumentSearchBarProps) {
  return (
    <section className="document-search-bar concierge-consultant-card--glass cc-reveal" aria-label="Document search">
      <header className="document-search-bar__head">
        <h3>Search & filter</h3>
        <button type="button" className="concierge-consultant-btn" onClick={onReset}>
          Reset
        </button>
      </header>

      <label className="document-search-field">
        <span>Search</span>
        <input
          type="search"
          value={filters.query}
          placeholder="Title, summary, author, owner…"
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </label>

      <div className="document-search-bar__grid">
        <label className="document-search-field">
          <span>Category</span>
          <select
            value={filters.categoryId}
            onChange={(event) =>
              onChange({ ...filters, categoryId: event.target.value as DocumentCategoryId | "all" })
            }
          >
            <option value="all">All categories</option>
            {DOCUMENT_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {DOCUMENT_CATEGORY_LABELS[category.id]}
              </option>
            ))}
          </select>
        </label>

        <label className="document-search-field">
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({ ...filters, status: event.target.value as DocumentStatusId | "all" })
            }
          >
            <option value="all">All statuses</option>
            {DOCUMENT_STATUSES.map((status) => (
              <option key={status.id} value={status.id}>
                {DOCUMENT_STATUS_LABELS[status.id]}
              </option>
            ))}
          </select>
        </label>

        <label className="document-search-field">
          <span>Owner</span>
          <input
            type="text"
            value={filters.owner}
            placeholder="Filter by owner"
            onChange={(event) => onChange({ ...filters, owner: event.target.value })}
          />
        </label>
      </div>

      <p className="document-search-bar__count">{resultCount} documents match</p>
    </section>
  );
}
