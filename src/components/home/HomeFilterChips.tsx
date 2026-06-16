import type { HomeFilterChip } from "../../utils/homeFilters";

type HomeFilterChipsProps = {
  chips: HomeFilterChip[];
  onRemove: (chip: HomeFilterChip) => void;
  onReset: () => void;
  onSave?: () => void;
  showSave?: boolean;
};

export function HomeFilterChips({ chips, onRemove, onReset, onSave, showSave }: HomeFilterChipsProps) {
  if (!chips.length && !showSave) return null;

  return (
    <div className="home-filter-chips" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          className="home-filter-chips__chip"
          onClick={() => onRemove(chip)}
          aria-label={`Remove ${chip.label} filter`}
        >
          {chip.label}
          <span aria-hidden>×</span>
        </button>
      ))}
      {chips.length > 0 ? (
        <button type="button" className="home-filter-chips__clear" onClick={onReset}>
          Clear all
        </button>
      ) : null}
      {showSave && onSave ? (
        <button type="button" className="home-filter-chips__save" onClick={onSave}>
          Save
        </button>
      ) : null}
    </div>
  );
}
