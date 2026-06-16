import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

type DiscoverFeedToolbarProps = {
  nameQuery: string;
  onNameQueryChange: (value: string) => void;
  ageMin: number;
  ageMax: number;
  locationLabel: string;
  advancedCount: number;
  onOpenAge: () => void;
  onOpenLocation: () => void;
  onOpenAdvanced: () => void;
};

export function DiscoverFeedToolbar({
  nameQuery,
  onNameQueryChange,
  ageMin,
  ageMax,
  locationLabel,
  advancedCount,
  onOpenAge,
  onOpenLocation,
  onOpenAdvanced
}: DiscoverFeedToolbarProps) {
  return (
    <section className="discover-feed-toolbar" aria-label="Find people">
      <label className="discover-feed-toolbar__search">
        <Search size={18} aria-hidden />
        <input
          type="search"
          value={nameQuery}
          onChange={(e) => onNameQueryChange(e.target.value)}
          placeholder="Find people"
          aria-label="Find people"
        />
      </label>

      <div className="discover-feed-toolbar__filters">
        <button type="button" className="discover-feed-toolbar__chip" onClick={onOpenAge}>
          <span className="discover-feed-toolbar__chip-label">Age</span>
          <span className="discover-feed-toolbar__chip-value">
            {ageMin} – {ageMax}
          </span>
          <ChevronDown size={14} aria-hidden />
        </button>

        <button type="button" className="discover-feed-toolbar__chip" onClick={onOpenLocation}>
          <span className="discover-feed-toolbar__chip-label">Location</span>
          <span className="discover-feed-toolbar__chip-value">{locationLabel}</span>
          <ChevronDown size={14} aria-hidden />
        </button>

        <button type="button" className="discover-feed-toolbar__chip" onClick={onOpenAdvanced}>
          <SlidersHorizontal size={14} aria-hidden />
          Advanced Filters
          {advancedCount > 0 ? <em className="discover-feed-toolbar__count">{advancedCount}</em> : null}
        </button>
      </div>
    </section>
  );
}
