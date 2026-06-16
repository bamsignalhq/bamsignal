import { useMemo, type CSSProperties } from "react";
import { clampHomeDistanceForCity, getCityMetroRadiusKm } from "../../utils/cityMetroRadius";
import { MIN_HOME_DISTANCE_KM } from "../../constants/homeFilters";

type HomeDistanceSliderProps = {
  city: string;
  state: string;
  value: number;
  onChange: (km: number) => void;
};

export function HomeDistanceSlider({ city, state, value, onChange }: HomeDistanceSliderProps) {
  const maxKm = getCityMetroRadiusKm(city, state);
  const km = clampHomeDistanceForCity(city, state, value);
  const fillPercent = useMemo(() => {
    if (maxKm <= MIN_HOME_DISTANCE_KM) return 100;
    return ((km - MIN_HOME_DISTANCE_KM) / (maxKm - MIN_HOME_DISTANCE_KM)) * 100;
  }, [km, maxKm]);

  return (
    <div className="home-distance-slider">
      <div className="home-distance-slider__head">
        <span className="home-distance-slider__label">Distance</span>
        <strong className="home-distance-slider__value">{km} km</strong>
      </div>
      <div
        className="home-distance-slider__track-wrap"
        style={{ "--distance-fill": `${fillPercent}%` } as CSSProperties}
      >
        <input
          type="range"
          className="home-distance-slider__input"
          min={MIN_HOME_DISTANCE_KM}
          max={maxKm}
          step={1}
          value={km}
          onChange={(e) => onChange(clampHomeDistanceForCity(city, state, Number(e.target.value)))}
          aria-label={`Search radius ${km} kilometers`}
          aria-valuemin={MIN_HOME_DISTANCE_KM}
          aria-valuemax={maxKm}
          aria-valuenow={km}
        />
      </div>
      <div className="home-distance-slider__ends" aria-hidden>
        <span>{MIN_HOME_DISTANCE_KM} km</span>
        <span>{maxKm} km</span>
      </div>
    </div>
  );
}
