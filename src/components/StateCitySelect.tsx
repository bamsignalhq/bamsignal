import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  NIGERIAN_STATES,
  citiesForState,
  searchCitiesInState,
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

const SUGGESTION_LIMIT = 80;

function CitySearchField({
  state,
  city,
  disabled,
  compact,
  onPick
}: {
  state: string;
  city: string;
  disabled: boolean;
  compact?: boolean;
  onPick: (city: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (!state || disabled) return [];
    return searchCitiesInState(state, open ? query : "").slice(0, SUGGESTION_LIMIT);
  }, [state, disabled, open, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const handlePick = (nextCity: string) => {
    onPick(nextCity);
    close();
  };

  const placeholder = disabled ? "Select state first" : city ? "" : "Search city or LGA";

  return (
    <div
      className={`state-city-select__search${compact ? " state-city-select__search--compact" : ""}`}
    >
      <Search size={compact ? 14 : 16} className="state-city-select__search-icon" aria-hidden />
      <input
        type="search"
        value={open ? query : city}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          if (disabled) return;
          setOpen(true);
          setQuery(city);
        }}
        onBlur={() => {
          window.setTimeout(close, 150);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && suggestions.length > 0 ? (
        <ul className="state-city-select__suggestions" role="listbox">
          {suggestions.map((option) => (
            <li key={option}>
              <button type="button" onMouseDown={() => handlePick(option)}>
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && query && suggestions.length === 0 ? (
        <p className="state-city-select__empty">No matches — try another spelling</p>
      ) : null}
    </div>
  );
}

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
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
  const resolvedState = state || (city ? stateForCity(city) : "");
  const cityOptions = useMemo(() => (resolvedState ? citiesForState(resolvedState) : []), [resolvedState]);
  const filteredCityOptions = useMemo(
    () => searchCitiesInState(resolvedState || "", cityFilter),
    [resolvedState, cityFilter]
  );

  useEffect(() => {
    setCitiesOpen(false);
    setCityFilter("");
  }, [state]);

  const handleStateChange = (nextState: string) => {
    onLocationChange(nextState, "");
    setCitiesOpen(Boolean(nextState));
  };

  const pickCity = (nextCity: string) => {
    const nextState = state || stateForCity(nextCity) || resolvedState || "";
    onLocationChange(nextState, nextCity);
    setCitiesOpen(false);
    setCityFilter("");
  };

  if (variant === "compact") {
    const showState = !hideStateWhenCitySelected || !city;
    return (
      <div
        className={`state-city-select state-city-select--compact${showState ? "" : " state-city-select--city-only"}`}
      >
        {showState ? (
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
        ) : null}

        <label className="state-city-select__field">
          <span>{cityLabel}</span>
          <CitySearchField
            state={resolvedState || ""}
            city={city}
            disabled={!resolvedState}
            compact
            onPick={pickCity}
          />
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
            <>
              <div className="state-city-select__search">
                <Search size={16} className="state-city-select__search-icon" aria-hidden />
                <input
                  type="search"
                  value={cityFilter}
                  placeholder={city ? "" : `Search ${cityOptions.length} cities & LGAs`}
                  autoComplete="off"
                  onChange={(e) => setCityFilter(e.target.value)}
                />
              </div>
              <div className="state-city-select__city-grid intent-tags selectable">
                {filteredCityOptions.length > 0 ? (
                  filteredCityOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`intent-tag ${city === c ? "selected" : ""}`}
                      onClick={() => pickCity(c)}
                    >
                      {c}
                    </button>
                  ))
                ) : (
                  <p className="state-city-select__empty">No matches — try another spelling</p>
                )}
              </div>
            </>
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
