import { NIGERIAN_STATES, citiesForState, stateForCity } from "../constants/profileOptions";

type StateCitySelectProps = {
  state: string;
  city: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  stateLabel?: string;
  cityLabel?: string;
  stateOptional?: boolean;
};

export function StateCitySelect({
  state,
  city,
  onStateChange,
  onCityChange,
  stateLabel = "State",
  cityLabel = "City",
  stateOptional = false
}: StateCitySelectProps) {
  const cityOptions = state ? citiesForState(state) : [];

  const handleStateChange = (nextState: string) => {
    onStateChange(nextState);
    const cities = citiesForState(nextState);
    if (city && !cities.includes(city)) {
      onCityChange(cities[0] ?? "");
    } else if (!city && cities[0]) {
      onCityChange(cities[0]);
    }
  };

  return (
    <>
      <label>
        {stateLabel}
        <select
          value={state}
          onChange={(e) => handleStateChange(e.target.value)}
          required={!stateOptional}
        >
          {stateOptional && <option value="">Select state</option>}
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label>
        {cityLabel}
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!state}
          required
        >
          {!state && <option value="">Select state first</option>}
          {state && !cityOptions.includes(city) && city && (
            <option value={city}>{city}</option>
          )}
          {cityOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

export function resolveProfileLocation(city: string, state?: string): { state: string; city: string } {
  const resolvedState = state || stateForCity(city) || "Lagos";
  const cities = citiesForState(resolvedState);
  const resolvedCity = cities.includes(city) ? city : cities[0] ?? city;
  return { state: resolvedState, city: resolvedCity };
}
