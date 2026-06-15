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
    <section className="home-feed-filters card" aria-label="Find people">
      <p className="home-feed-filters__tagline">Find people by what matters to you.</p>
      <label className="home-feed-filters__search">
        <Search size={18} aria-hidden />
        <input
          type="search"
          value={nameQuery}
          onChange={(e) => onNameQueryChange(e.target.value)}
          placeholder="Find people"
          aria-label="Find people by name"
        />
      </label>

      <div className="home-feed-filters__row">
        <label className="home-feed-filters__age">
          <span>Age</span>
          <div className="home-feed-filters__age-inputs">
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
      </div>

      <StateCitySelect
        state={state}
        city={city}
        onLocationChange={onLocationChange}
        stateLabel="State"
        cityLabel="City"
      />

      <div className="home-feed-filters__actions">
        <button type="button" className="btn-secondary btn-sm home-feed-filters__advanced" onClick={onOpenAdvanced}>
          <SlidersHorizontal size={16} aria-hidden />
          Advanced Filters
          {advancedCount > 0 ? <em>{advancedCount}</em> : null}
        </button>
        <button type="button" className="btn-primary btn-sm" disabled={loading} onClick={onApply}>
          {loading ? "Updating…" : "Apply"}
        </button>
      </div>
    </section>
  );
}
