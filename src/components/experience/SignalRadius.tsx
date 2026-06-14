import { useState } from "react";
import { RADIUS_OPTIONS } from "../../data/nigeriaMap";
import { NigeriaMap } from "./NigeriaMap";

export function SignalRadius() {
  const [radius, setRadius] = useState(10);
  const radiusIndex = RADIUS_OPTIONS.indexOf(radius as (typeof RADIUS_OPTIONS)[number]);
  const safeIndex = radiusIndex >= 0 ? radiusIndex : 1;

  return (
    <section className="exp-radius">
      <h2 className="exp-radius-title">How far can your signal travel?</h2>

      <div className="exp-radius-map">
        <NigeriaMap variant="radius" radiusKm={radius} />
      </div>

      <div className="exp-radius-controls">
        {RADIUS_OPTIONS.map((km) => (
          <button
            key={km}
            type="button"
            className={`exp-radius-chip ${radius === km ? "exp-radius-chip--active" : ""}`}
            onClick={() => setRadius(km)}
          >
            {km}km
          </button>
        ))}
      </div>

      <input
        type="range"
        className="exp-radius-slider"
        min={0}
        max={RADIUS_OPTIONS.length - 1}
        step={1}
        value={safeIndex}
        onChange={(e) => setRadius(RADIUS_OPTIONS[Number(e.target.value)] ?? 10)}
        aria-label="Signal radius"
      />
    </section>
  );
}
