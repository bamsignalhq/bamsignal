import { DOCUMENT_STATUSES, DOCUMENT_STATUS_LABELS } from "../../../constants/documentCenter";
import type { DocumentSearchFilters } from "../../../types/documentCenter";
import type { DocumentCategoryId, DocumentStatusId } from "../../../constants/documentCenter";
import { DOCUMENT_CATEGORIES } from "../../../constants/documentCenter";

type SearchCardProps = {
  filters: DocumentSearchFilters;
  resultCount: number;
  onChange: (filters: DocumentSearchFilters) => void;
  onReset: () => void;
};

export function SearchCard({ filters, resultCount, onChange, onReset }: SearchCardProps) {
  return (
    <section className="document-card search-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Search</h3>
        <p>{resultCount} result(s) — documents, knowledge articles, tags, and owners.</p>
      </header>
      <div className="search-card__fields">
        <label className="finance-search-field">
          <span>Query</span>
          <input
            type="search"
            value={filters.query}
            placeholder="Title, body, tag, owner…"
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
          />
        </label>
        <label className="finance-search-field">
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
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label className="finance-search-field">
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
        <label className="finance-search-field">
          <span>Tag</span>
          <input
            type="text"
            value={filters.tag}
            placeholder="e.g. support"
            onChange={(event) => onChange({ ...filters, tag: event.target.value })}
          />
        </label>
        <label className="finance-search-field">
          <span>Owner</span>
          <input
            type="text"
            value={filters.owner}
            placeholder="Team or owner"
            onChange={(event) => onChange({ ...filters, owner: event.target.value })}
          />
        </label>
        <button type="button" className="concierge-consultant-btn" onClick={onReset}>
          Reset
        </button>
      </div>
    </section>
  );
}
