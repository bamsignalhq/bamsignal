import { Search, SlidersHorizontal } from "lucide-react";
import { formatHomeLocationSummary } from "../../constants/homeFilters";

type HomeFeedFiltersProps = {
  nameQuery: string;
  onNameQueryChange: (value: string) => void;
  ageMin: number;
  ageMax: number;
  city: string;
  state: string;
  distanceKm: number;
  hasCustomFilters: boolean;
  onOpenQuickFilters: () => void;
  onOpenAdvanced: () => void;
  onReset?: () => void;
};

export function HomeFeedFilters({
  nameQuery,
  onNameQueryChange,
  ageMin,
  ageMax,
  city,
  state,
  distanceKm,
  hasCustomFilters,
  onOpenQuickFilters,
  onOpenAdvanced,
  onReset
}: HomeFeedFiltersProps) {
  const location = formatHomeLocationSummary(city, state, distanceKm);
  const summary = `${ageMin}–${ageMax} • ${location}`;

  return (
    <div className="home-compact-filters" aria-label="Search filters">
      <label className="home-compact-filters__search">
        <Search size={16} strokeWidth={2} aria-hidden />
        <input
          type="search"
          value={nameQuery}
          onChange={(e) => onNameQueryChange(e.target.value)}
          placeholder="Search by name"
          aria-label="Search by name"
        />
      </label>

      <div className="home-compact-filters__row">
        <button type="button" className="home-compact-filters__summary" onClick={onOpenQuickFilters}>
          {summary}
        </button>
        <button type="button" className="home-compact-filters__filters-btn" onClick={onOpenAdvanced}>
          <SlidersHorizontal size={15} aria-hidden />
          Filters
        </button>
        {hasCustomFilters && onReset ? (
          <button type="button" className="home-compact-filters__reset-btn" onClick={onReset}>
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
