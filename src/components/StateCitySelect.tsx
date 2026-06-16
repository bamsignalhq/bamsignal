import { useMemo } from "react";
import {
  NIGERIAN_STATES,
  citiesForState,
  stateForCity
} from "../constants/profileOptions";

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
  const resolvedState = state || (city ? stateForCity(city) : "");
  const cityOptions = useMemo(
    () => (resolvedState ? citiesForState(resolvedState) : []),
    [resolvedState]
  );

  const handleStateChange = (nextState: string) => {
    onLocationChange(nextState, "");
  };

  const handleCityChange = (nextCity: string) => {
    const nextState = state || stateForCity(nextCity) || resolvedState || "";
    onLocationChange(nextState, nextCity);
  };

  const stateSelect = (
    <label className="state-city-select__field">
      <span>{stateLabel}</span>
      <select
        value={state}
        onChange={(e) => handleStateChange(e.target.value)}
        required={!stateOptional}
      >
        {stateOptional && <option value=""></option>}
        {!state && !stateOptional && <option value=""></option>}
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
        {!city && <option value=""></option>}
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
      {state ? citySelect : null}
    </div>
  );
}

export function resolveProfileLocation(city: string, state?: string): { state: string; city: string } {
  const resolvedState = state || stateForCity(city) || "Abia";
  const cities = citiesForState(resolvedState);
  const resolvedCity = cities.includes(city) ? city : cities[0] ?? city;
  return { state: resolvedState, city: resolvedCity };
}
