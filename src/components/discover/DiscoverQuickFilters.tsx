import { SlidersHorizontal } from "lucide-react";
import type { DiscoverQuickFilter } from "../../utils/discoverFilters";

const CHIPS: { id: DiscoverQuickFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "online", label: "Online Now" },
  { id: "relationship", label: "Relationship" },
  { id: "friendship", label: "Friendship" },
  { id: "networking", label: "Networking" },
  { id: "verified", label: "Verified" },
  { id: "nearby", label: "Nearby" }
];

type DiscoverQuickFiltersProps = {
  active: DiscoverQuickFilter;
  onChange: (filter: DiscoverQuickFilter) => void;
  isPremium?: boolean;
  onAdvancedFilters?: () => void;
};

export function DiscoverQuickFilters({
  active,
  onChange,
  isPremium,
  onAdvancedFilters
}: DiscoverQuickFiltersProps) {
  return (
    <div className="discover-quick-filters" role="toolbar" aria-label="Quick filters">
      <div className="discover-quick-filters__scroll">
        {CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`discover-quick-filters__chip ${active === chip.id ? "active" : ""}`}
            onClick={() => onChange(chip.id)}
          >
            {chip.label}
          </button>
        ))}
        {isPremium && onAdvancedFilters && (
          <button type="button" className="discover-quick-filters__chip discover-quick-filters__chip--advanced" onClick={onAdvancedFilters}>
            <SlidersHorizontal size={14} />
            Advanced Filters
          </button>
        )}
      </div>
    </div>
  );
}
