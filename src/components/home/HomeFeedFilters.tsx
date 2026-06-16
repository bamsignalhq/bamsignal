import { Search, SlidersHorizontal } from "lucide-react";
import { StateCitySelect } from "../StateCitySelect";

type HomeFeedFiltersProps = {
  nameQuery: string;
  onNameQueryChange: (value: string) => void;
  ageMin: number;
  ageMax: number;
  onAgeMinChange: (value: number) => void;
  onAgeMaxChange: (value: number) => void;
  state: string;
  city: string;
  onLocationChange: (state: string, city: string) => void;
  advancedCount: number;
  onOpenAdvanced: () => void;
  onApply: () => void;
  loading?: boolean;
};

export function HomeFeedFilters({
  nameQuery,
  onNameQueryChange,
  ageMin,
  ageMax,
  onAgeMinChange,
  onAgeMaxChange,
  state,
  city,
  onLocationChange,
  advancedCount,
  onOpenAdvanced,
  onApply,
  loading
}: HomeFeedFiltersProps) {
  return (
    <div className="home-feed-filters__body" aria-label="Search filters">
      <label className="home-feed-filters__search">
        <Search size={16} strokeWidth={2} aria-hidden />
        <input
          type="search"
          value={nameQuery}
          onChange={(e) => onNameQueryChange(e.target.value)}
          placeholder="Search by name"
          aria-label="Search by name"
        />
      </label>

      <div className="home-feed-filters__grid">
        <label className="home-feed-filters__field">
          <span>Age range</span>
          <div className="home-feed-filters__range">
            <input
              type="number"
              min={18}
              max={99}
              value={ageMin}
              onChange={(e) => onAgeMinChange(Number(e.target.value) || 18)}
              aria-label="Minimum age"
            />
            <span aria-hidden>–</span>
            <input
              type="number"
              min={18}
              max={99}
              value={ageMax}
              onChange={(e) => onAgeMaxChange(Number(e.target.value) || 99)}
              aria-label="Maximum age"
            />
          </div>
        </label>

        <StateCitySelect
          variant="compact"
          state={state}
          city={city}
          onLocationChange={onLocationChange}
          stateLabel="State"
          cityLabel="City"
        />
      </div>

      <div className="home-feed-filters__toolbar">
        <button type="button" className="home-feed-filters__filters-btn" onClick={onOpenAdvanced}>
          <SlidersHorizontal size={15} aria-hidden />
          Filters
          {advancedCount > 0 ? <em>{advancedCount}</em> : null}
        </button>
        <button type="button" className="home-feed-filters__apply" disabled={loading} onClick={onApply}>
          {loading ? "Updating…" : "Apply"}
        </button>
      </div>
    </div>
  );
}
