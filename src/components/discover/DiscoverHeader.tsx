import { SlidersHorizontal } from "lucide-react";

type DiscoverHeaderProps = {
  cityLabel: string;
  filterCount?: number;
  onOpenFilters?: () => void;
};

export function DiscoverHeader({ cityLabel, filterCount = 0, onOpenFilters }: DiscoverHeaderProps) {
  return (
    <header className="discover-premium-head">
      <div className="discover-premium-head__titles">
        <h1>Discover</h1>
        <p>Thoughtful connections start here.</p>
      </div>
      <div className="discover-premium-head__actions">
        {onOpenFilters ? (
          <button type="button" className="discover-premium-head__filters" onClick={onOpenFilters}>
            <SlidersHorizontal size={18} aria-hidden />
            Filters{filterCount > 0 ? ` (${filterCount})` : ""}
          </button>
        ) : null}
        <div className="discover-premium-head__city" aria-label={`Browsing ${cityLabel}`}>
          <span aria-hidden>📍</span>
          {cityLabel}
        </div>
      </div>
    </header>
  );
}
