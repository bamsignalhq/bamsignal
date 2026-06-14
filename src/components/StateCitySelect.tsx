import { useEffect, useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { NIGERIAN_STATES, citiesForState, searchCitiesInState, stateForCity } from "../constants/profileOptions";

type StateCitySelectProps = {
  state: string;
  city: string;
  onLocationChange: (state: string, city: string) => void;
  stateLabel?: string;
  cityLabel?: string;
  stateOptional?: boolean;
};

export function StateCitySelect({
  state,
  city,
  onLocationChange,
  stateLabel = "State",
  cityLabel = "City",
  stateOptional = false
}: StateCitySelectProps) {
  const listId = useId();
  const [query, setQuery] = useState(city);
  const [open, setOpen] = useState(false);

  const cityOptions = useMemo(() => (state ? citiesForState(state) : []), [state]);
  const filtered = useMemo(
    () => searchCitiesInState(state, query),
    [state, query]
  );

  useEffect(() => {
    setQuery(city);
  }, [city]);

  const handleStateChange = (nextState: string) => {
    setQuery("");
    setOpen(false);
    onLocationChange(nextState, "");
  };

  const pickCity = (nextCity: string) => {
    setQuery(nextCity);
    setOpen(false);
    onLocationChange(state, nextCity);
  };

  return (
    <div className="state-city-select">
      <label className="state-city-select__field">
        {stateLabel}
        <select
          value={state}
          onChange={(e) => handleStateChange(e.target.value)}
          required={!stateOptional}
        >
          {stateOptional && <option value="">Select state</option>}
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s === "FCT" ? "FCT (Abuja)" : s}
            </option>
          ))}
        </select>
      </label>

      <label className="state-city-select__field">
        {cityLabel}
        <div className="state-city-select__search">
          <Search size={16} aria-hidden className="state-city-select__search-icon" />
          <input
            type="search"
            value={query}
            list={listId}
            placeholder={state ? "Search or select city" : "Select state first"}
            disabled={!state}
            required
            autoComplete="address-level2"
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 160)}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              setOpen(true);
              const exact = cityOptions.find((c) => c.toLowerCase() === value.trim().toLowerCase());
              if (exact) onLocationChange(state, exact);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[0]) {
                e.preventDefault();
                pickCity(filtered[0]);
              }
            }}
          />
          <datalist id={listId}>
            {cityOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        {open && state && filtered.length > 0 && (
          <ul className="state-city-select__suggestions" role="listbox">
            {filtered.slice(0, 8).map((c) => (
              <li key={c}>
                <button type="button" role="option" onMouseDown={() => pickCity(c)}>
                  {c}
                </button>
              </li>
            ))}
          </ul>
        )}
        {state && query && filtered.length === 0 && (
          <p className="state-city-select__empty">No matching city in {state === "FCT" ? "FCT" : state}.</p>
        )}
      </label>
    </div>
  );
}

export function resolveProfileLocation(city: string, state?: string): { state: string; city: string } {
  const resolvedState = state || stateForCity(city) || "Lagos";
  const cities = citiesForState(resolvedState);
  const resolvedCity = cities.includes(city) ? city : cities[0] ?? city;
  return { state: resolvedState, city: resolvedCity };
}
