import type { RefObject } from "react";
import { SEARCH_CENTER_KEYBOARD_SHORTCUT } from "../../../constants/searchCenter";
import type { SearchFilters } from "../../../types/searchCenter";
import { SEARCH_ENTITIES } from "../../../constants/searchCenter";

type SearchCommandPaletteProps = {
  filters: SearchFilters;
  totalResults: number;
  paletteOpen: boolean;
  onChange: (filters: SearchFilters) => void;
  onSubmit: () => void;
  inputRef: RefObject<HTMLInputElement>;
};

export function SearchCommandPalette({
  filters,
  totalResults,
  paletteOpen,
  onChange,
  onSubmit,
  inputRef
}: SearchCommandPaletteProps) {
  return (
    <section
      className={`search-command-palette concierge-consultant-card--glass cc-reveal${paletteOpen ? " is-open" : ""}`}
    >
      <header className="search-command-palette__head">
        <div>
          <h3>Command palette</h3>
          <p>
            Global search across members, consultants, journeys, payments, reports, and every
            institutional record. Press <kbd>{SEARCH_CENTER_KEYBOARD_SHORTCUT.replace("mod", "⌘")}</kbd> to
            focus.
          </p>
        </div>
        <span className="search-command-palette__count">{totalResults} result(s)</span>
      </header>
      <form
        className="search-command-palette__form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className="search-command-palette__query">
          <span>Search everything</span>
          <input
            ref={inputRef}
            type="search"
            value={filters.query}
            placeholder="Members, journeys, payments, reports, documents…"
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <label className="search-command-palette__entity">
          <span>Entity filter</span>
          <select
            value={filters.entity}
            onChange={(event) =>
              onChange({
                ...filters,
                entity: event.target.value as SearchFilters["entity"]
              })
            }
          >
            <option value="all">All entities</option>
            {SEARCH_ENTITIES.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="concierge-consultant-btn">
          Search
        </button>
      </form>
    </section>
  );
}
