import { StateCitySelect } from "../StateCitySelect";
import { AgeRangeTapSelect } from "../AgeRangeTapSelect";
import { HomeDistanceSlider } from "./HomeDistanceSlider";

type HomeQuickFilterSheetProps = {
  open: boolean;
  ageMin: number;
  ageMax: number;
  state: string;
  city: string;
  distanceKm: number;
  signalsInRange?: number | null;
  signalsLoading?: boolean;
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
  signalsInRange = null,
  signalsLoading = false,
  onAgeMinChange,
  onAgeMaxChange,
  onLocationChange,
  onDistanceKmChange,
  onClose
}: HomeQuickFilterSheetProps) {
  if (!open) return null;

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
        <AgeRangeTapSelect
          label="Age range"
          ageMin={ageMin}
          ageMax={ageMax}
          onChange={(min, max) => {
            onAgeMinChange(min);
            onAgeMaxChange(max);
          }}
        />
        <StateCitySelect
          variant="compact"
          state={state}
          city={city}
          onLocationChange={onLocationChange}
          stateLabel="State"
          cityLabel="City"
        />
        <HomeDistanceSlider
          city={city}
          state={state}
          value={distanceKm}
          onChange={onDistanceKmChange}
          availableCount={signalsInRange}
          loading={signalsLoading}
        />
      </div>
    </div>
  );
}
