import { useEffect, useMemo } from "react";
import {
  NIGERIAN_STATES,
  citiesForState,
  cityBelongsToState,
  resolveStateName,
  stateForCity
} from "../constants/profileOptions";
import { sanitizeStateCityPair } from "../utils/searchLocationPrefs";

type StateCitySelectProps = {
  state: string;
  city: string;
  onLocationChange: (state: string, city: string) => void;
  stateLabel?: string;
  cityLabel?: string;
  stateOptional?: boolean;
  variant?: "default" | "compact";
  /** Compact mode: hide state picker when a city is already selected. */
  hideStateWhenCitySelected?: boolean;
};

export function StateCitySelect({
  state,
  city,
  onLocationChange,
  stateLabel = "State",
  cityLabel = "City",
  stateOptional = false,
  variant = "default",
  hideStateWhenCitySelected = false
}: StateCitySelectProps) {
  const resolvedState = resolveStateName(state) || state || (city ? stateForCity(city) : "");
  const cityOptions = useMemo(
    () => (resolvedState ? citiesForState(resolvedState) : []),
    [resolvedState]
  );

  useEffect(() => {
    if (!resolvedState || !city) return;
    if (!cityBelongsToState(city, resolvedState)) {
      onLocationChange(resolvedState, "");
    }
  }, [resolvedState, city, onLocationChange]);

  const handleStateChange = (nextState: string) => {
    const canonical = resolveStateName(nextState) || nextState;
    onLocationChange(canonical, "");
  };

  const handleCityChange = (nextCity: string) => {
    const aligned = sanitizeStateCityPair(resolvedState || state, nextCity);
    onLocationChange(aligned.state, aligned.city);
  };

  const stateSelect = (
    <label className="state-city-select__field">
      <span>{stateLabel}</span>
      <select
        value={resolvedState}
        onChange={(e) => handleStateChange(e.target.value)}
        required={!stateOptional}
      >
        {stateOptional && <option value="">Select state</option>}
        {!state && !stateOptional && (
          <option value="">{variant === "compact" ? "State" : "Choose your state"}</option>
        )}
        {NIGERIAN_STATES.map((s) => (
          <option key={s} value={s}>
            {s === "FCT" ? "FCT (Abuja)" : s}
          </option>
        ))}
      </select>
    </label>
  );

  const citySelect = (
    <label className="state-city-select__field">
      <span>{cityLabel}</span>
      <select
        value={city}
        disabled={!resolvedState}
        onChange={(e) => handleCityChange(e.target.value)}
        required
      >
        {!city && <option value="">Select city</option>}
        {cityOptions.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );

  if (variant === "compact") {
    const showState = !hideStateWhenCitySelected || !city;
    return (
      <div
        className={`state-city-select state-city-select--compact${showState ? "" : " state-city-select--city-only"}`}
      >
        {showState ? stateSelect : null}
        {citySelect}
      </div>
    );
  }

  return (
    <div className="state-city-select state-city-select--stacked">
      {stateSelect}
      {resolvedState ? citySelect : null}
    </div>
  );
}

export function resolveProfileLocation(city: string, state?: string): { state: string; city: string } {
  const resolvedState = state || stateForCity(city) || "Abia";
  const cities = citiesForState(resolvedState);
  const resolvedCity = cities.includes(city) ? city : cities[0] ?? city;
  return { state: resolvedState, city: resolvedCity };
}
