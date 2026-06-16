import { X } from "lucide-react";
import { MatchPreferenceFields } from "../preferences/MatchPreferenceFields";
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
          <details className="home-advanced-sheet__section" open>
            <summary>Background</summary>
            <MatchPreferenceFields
              ethnicities={filters.tribes}
              onEthnicitiesChange={(tribes) => onChange({ ...filters, tribes })}
              religions={filters.religions}
              onReligionsChange={(religions) => onChange({ ...filters, religions })}
              statesOfOrigin={filters.statesOfOrigin}
              onStatesOfOriginChange={(statesOfOrigin) => onChange({ ...filters, statesOfOrigin })}
            />
          </details>

          <details className="home-advanced-sheet__section">
            <summary>Life & goals</summary>
            <MatchPreferenceFields
              occupations={filters.occupations}
              onOccupationsChange={(occupations) => onChange({ ...filters, occupations })}
              relationshipIntentions={filters.relationshipIntentions}
              onRelationshipIntentionsChange={(relationshipIntentions) =>
                onChange({ ...filters, relationshipIntentions })
              }
              hasKids={filters.hasKids}
              onHasKidsChange={(hasKids) => onChange({ ...filters, hasKids })}
              wantsKids={filters.wantsKids}
              onWantsKidsChange={(wantsKids) => onChange({ ...filters, wantsKids })}
            />
          </details>

          <details className="home-advanced-sheet__section">
            <summary>Health & style</summary>
            <MatchPreferenceFields
              genotypes={filters.genotypes}
              onGenotypesChange={(genotypes) => onChange({ ...filters, genotypes })}
              bodyTypes={filters.bodyTypes}
              onBodyTypesChange={(bodyTypes) => onChange({ ...filters, bodyTypes })}
            />
          </details>

          <details className="home-advanced-sheet__section">
            <summary>Trust</summary>
            <MatchPreferenceFields
              verificationPreferences={filters.verificationPreferences}
              onVerificationPreferencesChange={(verificationPreferences) =>
                onChange({ ...filters, verificationPreferences, verifiedOnly: false })
              }
            />
          </details>
        </div>

        <footer className="home-advanced-sheet__foot">
          <button type="button" className="btn-secondary" onClick={onClear}>
            Clear all
          </button>
          <button type="button" className="btn-primary" onClick={onApply}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
