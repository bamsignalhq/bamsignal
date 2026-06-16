import { X } from "lucide-react";
import { INTENT_OPTIONS } from "../../constants/intents";
import {
  FILTER_ETHNICITIES,
  FILTER_GENOTYPES,
  FILTER_OCCUPATIONS,
  FILTER_RELIGIONS,
  NIGERIAN_STATES
} from "../../constants/profileOptions";
import type { HomeAdvancedFilters } from "../../types";
import {
  emptyHomeAdvancedFilters,
  homeAdvancedFilterCount,
  homeAdvancedToSearchFilters
} from "../../utils/homeFilters";

export {
  emptyHomeAdvancedFilters,
  homeAdvancedFilterCount,
  homeAdvancedToSearchFilters
};
export type { HomeAdvancedFilters };

const HAS_KIDS_OPTIONS = ["Has kids", "No kids"] as const;
const WANTS_KIDS_OPTIONS = ["Wants kids", "Doesn't want kids", "Open to kids"] as const;

function toggleList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

type HomeAdvancedFiltersSheetProps = {
  open: boolean;
  filters: HomeAdvancedFilters;
  onChange: (filters: HomeAdvancedFilters) => void;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
};

export function HomeAdvancedFiltersSheet({
  open,
  filters,
  onChange,
  onClose,
  onClear,
  onApply
}: HomeAdvancedFiltersSheetProps) {
  if (!open) return null;

  const toggle = (key: keyof Omit<HomeAdvancedFilters, "verifiedOnly">, value: string) => {
    const list = filters[key] as string[];
    onChange({
      ...filters,
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    } as HomeAdvancedFilters);
  };

  return (
    <div className="home-advanced-sheet" role="dialog" aria-modal="true" aria-label="Advanced filters">
      <button type="button" className="home-advanced-sheet__backdrop" onClick={onClose} aria-label="Close" />
      <div className="home-advanced-sheet__panel">
        <header className="home-advanced-sheet__head">
          <h3>Advanced Filters</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="home-advanced-sheet__body">
          <fieldset className="intent-fieldset">
            <legend>Tribe</legend>
            <div className="intent-tags selectable home-advanced-sheet__scroll">
              {FILTER_ETHNICITIES.map((tribe) => (
                <button
                  key={tribe}
                  type="button"
                  className={`intent-tag ${filters.tribes.includes(tribe) ? "selected" : ""}`}
                  onClick={() => toggle("tribes", tribe)}
                >
                  {tribe}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>Religion</legend>
            <div className="intent-tags selectable">
              {FILTER_RELIGIONS.map((religion) => (
                <button
                  key={religion}
                  type="button"
                  className={`intent-tag ${filters.religions.includes(religion) ? "selected" : ""}`}
                  onClick={() => toggle("religions", religion)}
                >
                  {religion}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>Occupation</legend>
            <div className="intent-tags selectable home-advanced-sheet__scroll">
              {FILTER_OCCUPATIONS.map((occupation) => (
                <button
                  key={occupation}
                  type="button"
                  className={`intent-tag ${filters.occupations.includes(occupation) ? "selected" : ""}`}
                  onClick={() => toggle("occupations", occupation)}
                >
                  {occupation}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>State of origin</legend>
            <div className="intent-tags selectable home-advanced-sheet__scroll">
              {NIGERIAN_STATES.map((origin) => (
                <button
                  key={origin}
                  type="button"
                  className={`intent-tag ${filters.statesOfOrigin.includes(origin) ? "selected" : ""}`}
                  onClick={() => toggle("statesOfOrigin", origin)}
                >
                  {origin === "FCT" ? "Abuja" : origin}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>Relationship intention</legend>
            <div className="intent-tags selectable">
              {INTENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`intent-tag ${filters.relationshipIntentions.includes(opt.id) ? "selected" : ""}`}
                  onClick={() => toggle("relationshipIntentions", opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>Genotype</legend>
            <div className="intent-tags selectable">
              {FILTER_GENOTYPES.map((genotype) => (
                <button
                  key={genotype}
                  type="button"
                  className={`intent-tag ${filters.genotypes.includes(genotype) ? "selected" : ""}`}
                  onClick={() => toggle("genotypes", genotype)}
                >
                  {genotype}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>Has kids</legend>
            <div className="intent-tags selectable">
              {HAS_KIDS_OPTIONS.map((pref) => (
                <button
                  key={pref}
                  type="button"
                  className={`intent-tag ${filters.hasKids.includes(pref) ? "selected" : ""}`}
                  onClick={() => toggle("hasKids", pref)}
                >
                  {pref}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>Wants kids</legend>
            <div className="intent-tags selectable">
              {WANTS_KIDS_OPTIONS.map((pref) => (
                <button
                  key={pref}
                  type="button"
                  className={`intent-tag ${filters.wantsKids.includes(pref) ? "selected" : ""}`}
                  onClick={() => toggle("wantsKids", pref)}
                >
                  {pref}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>Verified only</legend>
            <button
              type="button"
              className={`intent-tag ${filters.verifiedOnly ? "selected" : ""}`}
              onClick={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
            >
              Verified only
            </button>
          </fieldset>
        </div>

        <footer className="home-advanced-sheet__foot">
          <button type="button" className="btn-secondary" onClick={onClear}>
            Clear all
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onApply();
            }}
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
