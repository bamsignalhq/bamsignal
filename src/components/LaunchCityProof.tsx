import { LAUNCH_PRIMARY_CITIES } from "../constants/seedCities";

export function LaunchCityProof() {
  return (
    <p className="launch-city-proof" aria-label="Active launch cities">
      <span className="launch-city-proof__label">Now active in</span>
      {LAUNCH_PRIMARY_CITIES.map((city) => (
        <span key={city} className="launch-city-proof__city">
          📍 {city}
        </span>
      ))}
    </p>
  );
}
