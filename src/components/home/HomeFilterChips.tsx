import type { HomeFilterChip } from "../../utils/homeFilters";

type HomeFilterChipsProps = {
  chips: HomeFilterChip[];
};

/** Advanced-only chips — age and location live in the compact summary row. */
export function HomeFilterChips({ chips }: HomeFilterChipsProps) {
  if (!chips.length) return null;

  return (
    <div className="home-filter-scroll" aria-label="Active filters">
      <div className="home-filter-scroll__track">
        {chips.map((chip) => (
          <span key={chip.id} className="home-filter-scroll__chip">
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
}
