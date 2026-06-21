import type { DiscoverRelationshipFilter } from "../../constants/discoverExperience";
import { DISCOVER_RELATIONSHIP_FILTERS } from "../../constants/discoverExperience";

type DiscoverFiltersBarProps = {
  active: DiscoverRelationshipFilter;
  onChange: (filter: DiscoverRelationshipFilter) => void;
  className?: string;
};

export function DiscoverFiltersBar({ active, onChange, className = "" }: DiscoverFiltersBarProps) {
  return (
    <div
      className={`discover-filters-bar ${className}`.trim()}
      role="toolbar"
      aria-label="Discover filters"
    >
      <div className="discover-filters-bar__scroll">
        {DISCOVER_RELATIONSHIP_FILTERS.map((filter) => {
          const isActive = active === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              className={`discover-filters-bar__chip${isActive ? " discover-filters-bar__chip--active" : ""}`}
              onClick={() => onChange(filter.id)}
              aria-pressed={isActive}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
