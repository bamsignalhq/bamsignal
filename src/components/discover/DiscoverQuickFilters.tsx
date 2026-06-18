import { MapPin, Sparkles } from "lucide-react";
import type { DiscoverQuickFilter } from "../../utils/discoverFilters";

const CHIPS: {
  id: DiscoverQuickFilter;
  label: string;
  icon?: "sparkles" | "pin" | "online" | "new";
}[] = [
  { id: "all", label: "For You", icon: "sparkles" },
  { id: "nearby", label: "Nearby", icon: "pin" },
  { id: "online", label: "Online", icon: "online" },
  { id: "new", label: "New", icon: "new" }
];

type DiscoverQuickFiltersProps = {
  active: DiscoverQuickFilter;
  onChange: (filter: DiscoverQuickFilter) => void;
};

export function DiscoverQuickFilters({ active, onChange }: DiscoverQuickFiltersProps) {
  return (
    <div className="discover-premium-chips" role="toolbar" aria-label="Discover filters">
      <div className="discover-premium-chips__scroll">
        {CHIPS.map((chip) => {
          const isActive = active === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              className={`discover-premium-chips__chip${isActive ? " discover-premium-chips__chip--active" : ""}`}
              onClick={() => onChange(chip.id)}
              aria-pressed={isActive}
            >
              {chip.icon === "sparkles" ? <Sparkles size={14} aria-hidden /> : null}
              {chip.icon === "pin" ? <MapPin size={14} aria-hidden /> : null}
              {chip.icon === "online" ? (
                <span className="discover-premium-chips__online-dot" aria-hidden />
              ) : null}
              {chip.icon === "new" ? <Sparkles size={14} aria-hidden /> : null}
              {chip.label}
              {chip.id === "new" ? <span className="discover-premium-chips__new-badge">NEW</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
