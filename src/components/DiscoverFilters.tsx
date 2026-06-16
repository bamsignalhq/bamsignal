import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { MONETIZATION_COPY } from "../constants/copy";
import { StateCitySelect } from "./StateCitySelect";
import { INTENT_OPTIONS } from "../constants/intents";
import {
  FILTER_ETHNICITIES,
  FILTER_LIFESTYLES,
  FILTER_RELIGIONS,
  ALL_NIGERIAN_CITIES,
  NIGERIAN_STATES,
  citiesForState
} from "../constants/profileOptions";
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
        <div className="discover-filters-sheet" role="dialog" aria-modal="true" aria-label="Discovery filters">
          <header className="discover-filters-sheet__head">
            <h3>Discovery filters</h3>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
          </header>

          <fieldset className="intent-fieldset discover-location-field">
            <legend>Your location</legend>
            <p className="discover-filters-note discover-filters-note--compact">
              {isPremium
                ? "Change state or city anytime."
                : freeStateChangesRemaining === Infinity
                  ? "Unlimited state changes on Premium."
                  : `${freeStateChangesRemaining ?? 0} free state change${freeStateChangesRemaining === 1 ? "" : "s"} left · city changes in the same state are free`}
            </p>
            <StateCitySelect
              state={discoverState}
              city={discoverCity}
              onLocationChange={onDiscoverLocationChange}
              stateLabel="State"
              cityLabel="City"
            />
          </fieldset>

          <fieldset className="intent-fieldset discover-online-field">
            <legend>Activity</legend>
            <button
              type="button"
              className={`discover-online-toggle ${prefs.onlineNow ? "active" : ""} ${!isPremium ? "discover-online-toggle--locked" : ""}`}
              onClick={toggleOnlineNow}
              aria-pressed={Boolean(prefs.onlineNow)}
            >
              <span className="discover-online-toggle__label">🟢 Online Now</span>
              <span className="discover-online-toggle__hint">
                {isPremium ? "Prioritize recently active profiles" : MONETIZATION_COPY.lockedFeature}
              </span>
            </button>
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>Preference mode</legend>
            <div className="discover-mode-toggle">
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
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>Intent</legend>
            <div className="intent-tags selectable">
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
          </fieldset>

          <div className="match-prefs-age">
            <label>
              Age from
              <input
                type="number"
                min={18}
                max={99}
                placeholder="18"
                value={prefs.ageMin ?? ""}
                onChange={(e) =>
                  onChange({ ...prefs, ageMin: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </label>
            <label>
              Age to
              <input
                type="number"
                min={18}
                max={99}
                placeholder="45"
                value={prefs.ageMax ?? ""}
                onChange={(e) =>
                  onChange({ ...prefs, ageMax: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </label>
          </div>

          <label>
            Max distance (miles)
            <input
              type="number"
              min={1}
              max={MAX_DISCOVER_RADIUS_MILES}
              placeholder="Any"
              value={prefs.distanceMax != null ? kmToMiles(prefs.distanceMax) : ""}
              onChange={(e) =>
                onChange({
                  ...prefs,
                  distanceMax: e.target.value ? milesToKm(Number(e.target.value)) : undefined
                })
              }
            />
          </label>

          <fieldset className="intent-fieldset">
            <legend>Preferred state</legend>
            <div className="intent-tags selectable match-prefs-scroll">
              {NIGERIAN_STATES.map((state) => (
                <button
                  key={state}
                  type="button"
                  className={`intent-tag ${prefs.states.includes(state) ? "selected" : ""}`}
                  onClick={() => toggle("states", state)}
                >
                  {state === "FCT" ? "Abuja" : state}
                </button>
              ))}
            </div>
          </fieldset>

          {prefs.states.length > 0 && (
            <fieldset className="intent-fieldset">
              <legend>Preferred city</legend>
              <div className="intent-tags selectable match-prefs-scroll">
                {prefs.states.flatMap((s) => citiesForState(s)).map((city) => (
                  <button
                    key={city}
                    type="button"
                    className={`intent-tag ${prefs.cities.includes(city) ? "selected" : ""}`}
                    onClick={() => toggle("cities", city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className={`intent-fieldset ${!isPremium ? "discover-filter--locked" : ""}`}>
            <legend>Faith {!isPremium && `· ${MONETIZATION_COPY.lockedFeature}`}</legend>
            <div className="intent-tags selectable">
              {FILTER_RELIGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`intent-tag ${prefs.religions.includes(r) ? "selected" : ""}`}
                  onClick={() => requirePremium(() => toggle("religions", r))}
                >
                  {r}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>Background (optional)</legend>
            <div className="intent-tags selectable match-prefs-scroll">
              {FILTER_ETHNICITIES.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`intent-tag ${prefs.ethnicities.includes(e) ? "selected" : ""}`}
                  onClick={() => toggle("ethnicities", e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={`intent-fieldset ${!isPremium ? "discover-filter--locked" : ""}`}>
            <legend>Lifestyle {!isPremium && `· ${MONETIZATION_COPY.lockedFeature}`}</legend>
            <div className="intent-tags selectable">
              {FILTER_LIFESTYLES.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`intent-tag ${prefs.lifestyles.includes(l) ? "selected" : ""}`}
                  onClick={() => requirePremium(() => toggle("lifestyles", l))}
                >
                  {l}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={`intent-fieldset discover-premium-filters ${!isPremium ? "discover-filter--locked" : ""}`}>
            <legend>Advanced preferences {!isPremium && `· ${MONETIZATION_COPY.lockedFeature}`}</legend>
            <button
              type="button"
              className={`discover-online-toggle ${prefs.requireVerified ? "active" : ""}`}
              onClick={() => togglePremium("requireVerified", !prefs.requireVerified)}
            >
              <span className="discover-online-toggle__label">Verified only</span>
            </button>
            <button
              type="button"
              className={`discover-online-toggle ${prefs.requireVoiceIntro ? "active" : ""}`}
              onClick={() => togglePremium("requireVoiceIntro", !prefs.requireVoiceIntro)}
            >
              <span className="discover-online-toggle__label">🎤 Voice intro</span>
            </button>
            <label className="discover-compat-filter">
              Min compatibility %
              <input
                type="range"
                min={65}
                max={99}
                step={1}
                value={prefs.minCompatibility ?? 65}
                disabled={!isPremium}
                onChange={(e) =>
                  togglePremium("minCompatibility", Number(e.target.value))
                }
              />
              <span>{prefs.minCompatibility ?? 65}%+</span>
            </label>
          </fieldset>

          <div className="discover-filters-actions">
            <button type="button" className="link-btn" onClick={clearAll}>
              Show everyone
            </button>
            <button type="button" className="btn-primary" onClick={() => setOpen(false)}>
              Apply
            </button>
          </div>
        </div>
      )}
    </>
  );
}
