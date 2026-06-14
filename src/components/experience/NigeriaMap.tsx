import { useEffect, useState } from "react";
import {
  MAP_ACTIVITIES,
  MAP_CENTER,
  NEARBY_DOTS,
  NIGERIA_CITIES,
  NIGERIA_PATH,
  SIGNAL_ARCS,
  radiusToPx,
  type NearbyDot
} from "../../data/nigeriaMap";

type NigeriaMapProps = {
  variant?: "hero" | "radius";
  radiusKm?: number;
  className?: string;
};

export function NigeriaMap({ variant = "hero", radiusKm = 10, className = "" }: NigeriaMapProps) {
  const [activityIndex, setActivityIndex] = useState(0);
  const isHero = variant === "hero";
  const circleR = radiusToPx(radiusKm);
  const visibleDots = NEARBY_DOTS.filter((d) => d.minKm <= radiusKm);

  useEffect(() => {
    if (!isHero) return;
    const t = window.setInterval(() => {
      setActivityIndex((i) => (i + 1) % MAP_ACTIVITIES.length);
    }, 2800);
    return () => window.clearInterval(t);
  }, [isHero]);

  return (
    <div className={`ng-map-wrap ${className}`}>
      <svg
        className="ng-map-svg"
        viewBox="0 0 400 480"
        role="img"
        aria-label="Nigeria signal map"
      >
        <defs>
          <radialGradient id="ng-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e91e8c" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#673ab7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ng-arc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e91e8c" stopOpacity="0" />
            <stop offset="50%" stopColor="#e91e8c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#9c27b0" stopOpacity="0" />
          </linearGradient>
          <filter id="ng-blur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <path className="ng-map-land" d={NIGERIA_PATH} />

        {isHero &&
          SIGNAL_ARCS.map(({ from, to, delay }, i) => {
            const a = NIGERIA_CITIES[from];
            const b = NIGERIA_CITIES[to];
            return (
              <line
                key={i}
                className="ng-map-arc"
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                style={{ animationDelay: `${delay}s` }}
              />
            );
          })}

        {!isHero && (
          <>
            <circle
              className="ng-map-radius"
              cx={MAP_CENTER.x}
              cy={MAP_CENTER.y}
              r={circleR}
              style={{ transition: "r 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
            {visibleDots.map((dot) => (
              <NearbyMarker key={dot.id} dot={dot} />
            ))}
          </>
        )}

        {NIGERIA_CITIES.map((city) => (
          <g key={city.id} className="ng-map-city" style={{ animationDelay: `${city.pulseDelay}s` }}>
            <circle className="ng-map-pulse ng-map-pulse--1" cx={city.x} cy={city.y} r="6" />
            <circle className="ng-map-pulse ng-map-pulse--2" cx={city.x} cy={city.y} r="6" />
            <circle className="ng-map-dot" cx={city.x} cy={city.y} r="5" />
            {isHero && (
              <text className="ng-map-label" x={city.x} y={city.y - 14} textAnchor="middle">
                {city.name}
              </text>
            )}
          </g>
        ))}
      </svg>

      {isHero && (
        <p className="ng-map-activity" aria-live="polite">
          {MAP_ACTIVITIES[activityIndex]}
        </p>
      )}
    </div>
  );
}

function NearbyMarker({ dot }: { dot: NearbyDot }) {
  return (
    <g className="ng-map-nearby">
      <circle className="ng-map-nearby-glow" cx={dot.x} cy={dot.y} r="14" />
      <image href={dot.photo} x={dot.x - 10} y={dot.y - 10} width="20" height="20" className="ng-map-nearby-avatar" />
    </g>
  );
}
