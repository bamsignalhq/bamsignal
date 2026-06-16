import { Search, SlidersHorizontal } from "lucide-react";

type HomeFeedFiltersProps = {
  nameQuery: string;
  onNameQueryChange: (value: string) => void;
  ageMin: number;
  ageMax: number;
  city: string;
  state: string;
  onOpenQuickFilters: () => void;
  onOpenAdvanced: () => void;
};

function locationLabel(city: string, state: string): string {
  if (city) return city;
  if (state) return state === "FCT" ? "Abuja" : state;
  return "Anywhere";
}

export function HomeFeedFilters({
  nameQuery,
  onNameQueryChange,
  ageMin,
  ageMax,
  city,
  state,
  onOpenQuickFilters,
  onOpenAdvanced
}: HomeFeedFiltersProps) {
  const summary = `${ageMin}–${ageMax} • ${locationLabel(city, state)}`;

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
      </div>
    </div>
  );
}
