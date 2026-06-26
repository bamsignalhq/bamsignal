import {
  PERFORMANCE_ENGINEERING_TRACKS,
  PERFORMANCE_HEALTH_STATUS_LABELS,
  PERFORMANCE_TRACK_LABELS,
  type PerformanceCompareWindowId,
  type PerformanceTrackId
} from "../../../constants/performanceCenter";
import type { PerformanceTrackSnapshot } from "../../../types/performanceCenter";
import { getTrackValueForWindow } from "../../../utils/performanceCenterLogic";

type PerformanceTracksCardProps = {
  tracks: PerformanceTrackSnapshot[];
  compareWindow: PerformanceCompareWindowId;
  activeTrack: PerformanceTrackId;
  onTrackSelect: (trackId: PerformanceTrackId) => void;
};

export function PerformanceTracksCard({
  tracks,
  compareWindow,
  activeTrack,
  onTrackSelect
}: PerformanceTracksCardProps) {
  const trackMeta = Object.fromEntries(
    PERFORMANCE_ENGINEERING_TRACKS.map((item) => [item.id, item])
  );

  return (
    <section className="performance-center-card performance-tracks-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>Track</h3>
        <p>Startup, API latency, bundle size, web vitals, memory, CPU, and database signals.</p>
      </header>
      <div className="performance-tracks-card__grid">
        {tracks.map((track) => {
          const meta = trackMeta[track.trackId];
          const baseline =
            compareWindow === "current"
              ? track.current
              : getTrackValueForWindow(track, compareWindow);
          const displayValue =
            compareWindow === "current" ? track.current : getTrackValueForWindow(track, compareWindow);
          const unitSuffix = track.unit ? track.unit : "";
          return (
            <button
              key={track.id}
              type="button"
              className={`performance-tracks-card__item${
                activeTrack === track.trackId ? " is-active" : ""
              }`}
              onClick={() => onTrackSelect(track.trackId)}
            >
              <span>{PERFORMANCE_TRACK_LABELS[track.trackId]}</span>
              <strong>
                {displayValue}
                {unitSuffix}
              </strong>
              {compareWindow !== "current" ? (
                <small>
                  vs current {track.current}
                  {unitSuffix}
                </small>
              ) : (
                <small className={`performance-tracks-card__status--${track.status}`}>
                  {PERFORMANCE_HEALTH_STATUS_LABELS[track.status]}
                </small>
              )}
              {compareWindow !== "current" && baseline !== track.current ? (
                <small>
                  Δ{" "}
                  {meta?.lowerIsBetter
                    ? ((track.current - baseline) / baseline) * 100
                    : ((baseline - track.current) / baseline) * 100}
                  %
                </small>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
