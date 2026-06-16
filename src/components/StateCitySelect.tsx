import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { NIGERIAN_STATES, citiesForState, stateForCity } from "../constants/profileOptions";

type StateCitySelectProps = {
  state: string;
  city: string;
  onLocationChange: (state: string, city: string) => void;
  stateLabel?: string;
  cityLabel?: string;
  stateOptional?: boolean;
  variant?: "default" | "compact";
};

export function StateCitySelect({
  state,
  city,
  onLocationChange,
  stateLabel = "State",
  cityLabel = "City",
  stateOptional = false,
  variant = "default"
}: StateCitySelectProps) {
  const [citiesOpen, setCitiesOpen] = useState(false);
  const cityOptions = useMemo(() => (state ? citiesForState(state) : []), [state]);

  useEffect(() => {
    setCitiesOpen(false);
  }, [state]);

  const handleStateChange = (nextState: string) => {
    onLocationChange(nextState, "");
    setCitiesOpen(Boolean(nextState));
  };

  const pickCity = (nextCity: string) => {
    onLocationChange(state, nextCity);
    setCitiesOpen(false);
  };

  if (variant === "compact") {
    return (
      <div className="state-city-select state-city-select--compact">
        <label className="state-city-select__field">
          <span>{stateLabel}</span>
          <select
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            required={!stateOptional}
          >
            {stateOptional && <option value="">Select state</option>}
            {!state && !stateOptional && <option value="">State</option>}
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s === "FCT" ? "FCT (Abuja)" : s}
              </option>
            ))}
          </select>
        </label>

        <label className="state-city-select__field">
          <span>{cityLabel}</span>
          <select
            value={city}
            disabled={!state}
            onChange={(e) => onLocationChange(state, e.target.value)}
          >
            {!state && <option value="">Select state first</option>}
            {state && !city && <option value="">City</option>}
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }

  return (
    <div className="state-city-select state-city-select--stacked">
      <label className="state-city-select__field">
        {stateLabel}
        <select
          value={state}
          onChange={(e) => handleStateChange(e.target.value)}
          required={!stateOptional}
        >
          {stateOptional && <option value="">Select state</option>}
          {!state && !stateOptional && <option value="">Choose your state</option>}
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s === "FCT" ? "FCT (Abuja)" : s}
            </option>
          ))}
        </select>
      </label>

      {state && (
        <div className="state-city-select__city-block">
          <button
            type="button"
            className="state-city-select__city-trigger"
            onClick={() => setCitiesOpen((o) => !o)}
            aria-expanded={citiesOpen}
          >
            <span>
              <strong>{cityLabel}</strong>
              <small>{city || "Tap to choose your city"}</small>
            </span>
            <ChevronDown size={18} className={citiesOpen ? "rotated" : ""} aria-hidden />
          </button>
          {citiesOpen && (
            <div className="state-city-select__city-grid intent-tags selectable">
              {cityOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`intent-tag ${city === c ? "selected" : ""}`}
                  onClick={() => pickCity(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function resolveProfileLocation(city: string, state?: string): { state: string; city: string } {
  const resolvedState = state || stateForCity(city) || "Abia";
  const cities = citiesForState(resolvedState);
  const resolvedCity = cities.includes(city) ? city : cities[0] ?? city;
  return { state: resolvedState, city: resolvedCity };
}
