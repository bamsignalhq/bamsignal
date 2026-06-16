import { StateCitySelect } from "../StateCitySelect";
import { clampHomeDistanceForCity, distanceOptionsForCity } from "../../utils/cityMetroRadius";

type HomeQuickFilterSheetProps = {
  open: boolean;
  ageMin: number;
  ageMax: number;
  state: string;
  city: string;
  distanceKm: number;
  onAgeMinChange: (value: number) => void;
  onAgeMaxChange: (value: number) => void;
  onLocationChange: (state: string, city: string) => void;
  onDistanceKmChange: (value: number) => void;
  onClose: () => void;
};

export function HomeQuickFilterSheet({
  open,
  ageMin,
  ageMax,
  state,
  city,
  distanceKm,
  onAgeMinChange,
  onAgeMaxChange,
  onLocationChange,
  onDistanceKmChange,
  onClose
}: HomeQuickFilterSheetProps) {
  if (!open) return null;

  const distanceOptions = distanceOptionsForCity(city, state);

  return (
    <div className="home-filter-sheet" role="dialog" aria-modal="true" aria-label="Age and location">
      <button type="button" className="home-filter-sheet__backdrop" onClick={onClose} aria-label="Close" />
      <div className="home-filter-sheet__panel card">
        <div className="home-filter-sheet__head">
          <h3>Filters</h3>
          <button type="button" className="home-filter-sheet__done" onClick={onClose}>
            Done
          </button>
        </div>
        <label className="home-filter-sheet__age">
          <span>Age range</span>
          <div className="home-filter-sheet__range">
            <input
              type="number"
              min={18}
              max={99}
              value={ageMin}
              onChange={(e) => onAgeMinChange(Number(e.target.value) || 18)}
              aria-label="Minimum age"
            />
            <span aria-hidden>–</span>
            <input
              type="number"
              min={18}
              max={99}
              value={ageMax}
              onChange={(e) => onAgeMaxChange(Number(e.target.value) || 99)}
              aria-label="Maximum age"
            />
          </div>
        </label>
        <StateCitySelect
          variant="compact"
          state={state}
          city={city}
          onLocationChange={onLocationChange}
          stateLabel="State"
          cityLabel="City"
          showStateSuffixOnCity
        />
        <fieldset className="intent-fieldset home-filter-sheet__distance">
          <legend>Distance</legend>
          <div className="home-distance-options">
            {distanceOptions.map((km) => (
              <button
                key={km}
                type="button"
                className={`home-distance-options__btn ${distanceKm === km ? "home-distance-options__btn--active" : ""}`}
                onClick={() => onDistanceKmChange(clampHomeDistanceForCity(city, state, km))}
              >
                {km}km
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
