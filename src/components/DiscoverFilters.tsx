import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { INTENT_OPTIONS } from "../constants/intents";
import { StateCitySelect } from "./StateCitySelect";
import { searchStateFromPrefs, withSearchStateChange, normalizeSearchCities } from "../utils/searchLocationPrefs";
import { normalizeLifestyleTraits } from "../constants/profileOptions";
import { MatchPreferenceFields } from "./preferences/MatchPreferenceFields";
import { AgeRangeTapSelect } from "./AgeRangeTapSelect";
import { TapSelectField } from "./TapSelectField";
import { MAX_DISCOVER_RADIUS_MILES, kmToMiles, milesToKm } from "../utils/discoverLocation";
import type { MatchPreferences, PreferenceMode } from "../types";
import { defaultMatchPreferences } from "../utils/profile";

type DiscoverFiltersProps = {
  prefs: MatchPreferences;
  onChange: (prefs: MatchPreferences) => void;
  discoverState: string;
  discoverCity: string;
  onDiscoverLocationChange: (state: string, city: string) => void;
  freeStateChangesRemaining?: number;
  isPremium?: boolean;
  onRequirePremium?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
};

const COMPAT_OPTIONS = Array.from({ length: 35 }, (_, i) => String(65 + i));

export function DiscoverFilters({
  prefs,
  onChange,
  discoverState,
  discoverCity,
  onDiscoverLocationChange,
  freeStateChangesRemaining,
  isPremium = false,
  onRequirePremium,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false
}: DiscoverFiltersProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  };

  const ageMin = prefs.ageMin ?? 22;
  const ageMax = prefs.ageMax ?? 35;
  const distanceMiles = prefs.distanceMax != null ? kmToMiles(prefs.distanceMax) : null;

  const locationHelper = useMemo(() => {
    if (isPremium || freeStateChangesRemaining === Infinity) {
      return { stateLine: "State changes: unlimited", cityLine: "City changes are free" };
    }
    const remaining = freeStateChangesRemaining ?? 0;
    return {
      stateLine: `State changes: ${remaining} remaining`,
      cityLine: "City changes are free"
    };
  }, [freeStateChangesRemaining, isPremium]);

  const toggle = <T extends string>(key: keyof MatchPreferences, value: T) => {
    const list = (prefs[key] as T[]) ?? [];
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    onChange({ ...prefs, [key]: next });
  };

  const clearAll = () => {
    onChange(defaultMatchPreferences());
  };

  const toggleOnlineNow = () => {
    if (!isPremium) {
      onRequirePremium?.();
      return;
    }
    onChange({ ...prefs, onlineNow: !prefs.onlineNow });
  };

  const requirePremium = (action: () => void) => {
    if (!isPremium) {
      onRequirePremium?.();
      return;
    }
    action();
  };

  const togglePremium = <K extends keyof MatchPreferences>(key: K, value: MatchPreferences[K]) => {
    requirePremium(() => onChange({ ...prefs, [key]: value }));
  };

  const activeCount =
    prefs.religions.length +
    prefs.ethnicities.length +
    prefs.lifestyles.length +
    prefs.cities.length +
    prefs.states.length +
    prefs.intents.length +
    (prefs.ageMin != null || prefs.ageMax != null ? 1 : 0) +
    (prefs.distanceMax != null ? 1 : 0) +
    (prefs.preferenceMode === "strict" ? 1 : 0) +
    (prefs.onlineNow ? 1 : 0) +
    (prefs.minCompatibility != null ? 1 : 0) +
    (prefs.requireVoiceIntro ? 1 : 0) +
    (prefs.requireVerified ? 1 : 0);

  return (
    <>
      {!hideTrigger && (
        <button type="button" className="discover-filters-btn" onClick={() => setOpen(true)}>
          <SlidersHorizontal size={18} />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      )}

      {open && (
        <div
          className="discover-filters-sheet discover-filters-sheet--fintech"
          role="dialog"
          aria-modal="true"
          aria-label="Discovery filters"
        >
          <header className="discover-filters-sheet__head discover-filters-sheet__head--fintech">
            <div>
              <h3>Discovery Filters</h3>
              <p className="discover-filters-sheet__subtitle">Fine-tune who you discover.</p>
            </div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
          </header>

          <div className="discover-filters-sheet__scroll">
            <section className="discover-filters-card discover-filters-card--location">
              <h4 className="discover-filters-card__title">Location</h4>
              <p className="discover-filters-card__hint">{locationHelper.stateLine}</p>
              <p className="discover-filters-card__hint">{locationHelper.cityLine}</p>
              <StateCitySelect
                state={discoverState}
                city={discoverCity}
                onLocationChange={onDiscoverLocationChange}
                stateLabel="State"
                cityLabel="City"
                variant="compact"
              />
            </section>

            <section className="discover-filters-card">
              <h4 className="discover-filters-card__title">Activity</h4>
              <button
                type="button"
                className={`discover-filters-pill ${prefs.onlineNow ? "discover-filters-pill--active" : ""}`}
                onClick={toggleOnlineNow}
                aria-pressed={Boolean(prefs.onlineNow)}
              >
                🟢 Online Now
              </button>
              {!isPremium ? (
                <p className="discover-filters-card__hint discover-filters-card__hint--lock">
                  Signal Pass feature 🔒
                </p>
              ) : (
                <p className="discover-filters-card__hint">Prioritize recently active profiles</p>
              )}
            </section>

            <section className="discover-filters-card">
              <h4 className="discover-filters-card__title">Preference mode</h4>
              <div className="discover-mode-toggle discover-mode-toggle--fintech" role="group" aria-label="Preference mode">
                {(["flexible", "strict"] as PreferenceMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={prefs.preferenceMode === mode ? "active" : ""}
                    onClick={() => onChange({ ...prefs, preferenceMode: mode })}
                  >
                    {mode === "flexible" ? "Flexible" : "Strict"}
                  </button>
                ))}
              </div>
            </section>

            <section className="discover-filters-card">
              <h4 className="discover-filters-card__title">Intent</h4>
              <div className="discover-filters-intents intent-tags selectable">
                {INTENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`intent-tag ${prefs.intents.includes(opt.id) ? "selected" : ""}`}
                    onClick={() => toggle("intents", opt.id)}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="discover-filters-card discover-filters-card--fields">
              <MatchPreferenceFields
                className="match-pref-fields--discover-filters"
                religions={prefs.religions}
                onReligionsChange={(religions) => onChange({ ...prefs, religions })}
                ethnicities={prefs.ethnicities}
                onEthnicitiesChange={(ethnicities) => onChange({ ...prefs, ethnicities })}
                prefLifestyles={prefs.lifestyles}
                onPrefLifestylesChange={(lifestyles) =>
                  onChange({ ...prefs, lifestyles: normalizeLifestyleTraits(lifestyles) })
                }
                searchState={searchStateFromPrefs(prefs)}
                onSearchStateChange={(searchState) =>
                  onChange(withSearchStateChange(prefs, searchState))
                }
                searchCities={prefs.cities}
                onSearchCitiesChange={(cities) =>
                  onChange({
                    ...prefs,
                    cities: normalizeSearchCities(cities, searchStateFromPrefs(prefs))
                  })
                }
              />
            </section>

            <section className="discover-filters-card discover-filters-card--age">
              <h4 className="discover-filters-card__title">Age</h4>
              <p className="discover-filters-age-summary" aria-live="polite">
                {ageMin} — {ageMax}
              </p>
              <AgeRangeTapSelect
                ageMin={ageMin}
                ageMax={ageMax}
                onChange={(nextMin, nextMax) => onChange({ ...prefs, ageMin: nextMin, ageMax: nextMax })}
                label=""
              />
            </section>

            <section className="discover-filters-card">
              <label className="discover-filters-distance">
                <span className="discover-filters-distance__label">Max distance</span>
                <div className="discover-filters-distance__field">
                  <input
                    type="number"
                    min={1}
                    max={MAX_DISCOVER_RADIUS_MILES}
                    placeholder="Any"
                    value={distanceMiles ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...prefs,
                        distanceMax: e.target.value ? milesToKm(Number(e.target.value)) : undefined
                      })
                    }
                  />
                  <span className="discover-filters-distance__unit">
                    {distanceMiles != null ? `${distanceMiles} mi` : "Any"}
                  </span>
                </div>
              </label>
            </section>

            <section
              className={`discover-filters-card discover-filters-card--advanced ${!isPremium ? "discover-filters-card--locked" : ""}`}
            >
              <h4 className="discover-filters-card__title">Advanced Preferences</h4>
              {!isPremium ? (
                <p className="discover-filters-card__hint discover-filters-card__hint--lock">
                  Signal Pass required 🔒
                </p>
              ) : null}

              <label className="discover-filters-switch">
                <span>Verified only</span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={Boolean(prefs.requireVerified)}
                  onChange={() => togglePremium("requireVerified", !prefs.requireVerified)}
                />
              </label>

              <label className="discover-filters-switch">
                <span>Voice intro</span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={Boolean(prefs.requireVoiceIntro)}
                  onChange={() => togglePremium("requireVoiceIntro", !prefs.requireVoiceIntro)}
                />
              </label>

              <div
                className={!isPremium ? "discover-filters-field--locked" : undefined}
                onClick={!isPremium ? () => onRequirePremium?.() : undefined}
                onKeyDown={undefined}
              >
                <TapSelectField
                  label="Minimum Compatibility"
                  options={COMPAT_OPTIONS}
                  value={String(prefs.minCompatibility ?? 65)}
                  formatValue={(value) => `${value}%+`}
                  disabled={!isPremium}
                  onChange={(next) => {
                    if (!next || Array.isArray(next)) return;
                    togglePremium("minCompatibility", Number(next));
                  }}
                />
              </div>
            </section>
          </div>

          <footer className="discover-filters-sheet__footer">
            <button type="button" className="link-btn discover-filters-sheet__clear" onClick={clearAll}>
              Show everyone
            </button>
            <button type="button" className="btn-primary discover-filters-sheet__apply" onClick={() => setOpen(false)}>
              Apply Filters
            </button>
          </footer>
        </div>
      )}
    </>
  );
}
