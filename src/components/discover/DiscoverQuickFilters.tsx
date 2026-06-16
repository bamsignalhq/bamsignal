import type { DiscoverQuickFilter } from "../../utils/discoverFilters";

const CHIPS: { id: DiscoverQuickFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "verified", label: "Verified" },
  { id: "online", label: "Online" },
  { id: "new", label: "New" }
];

type DiscoverQuickFiltersProps = {
  active: DiscoverQuickFilter;
  onChange: (filter: DiscoverQuickFilter) => void;
};

export function DiscoverQuickFilters({ active, onChange }: DiscoverQuickFiltersProps) {
  return (
    <div className="discover-quick-filters discover-quick-filters--compact" role="toolbar" aria-label="Discover filters">
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
      </div>
    </div>
  );
}
