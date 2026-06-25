import { WORKFORCE_CAPACITY_STATE_LABELS } from "../../../constants/workforceManagement";
import type { WorkforceCapacityHeatmapCell } from "../../../types/workforceManagement";

type CapacityHeatmapCardProps = {
  heatmap: WorkforceCapacityHeatmapCell[];
};

export function CapacityHeatmapCard({ heatmap }: CapacityHeatmapCardProps) {
  return (
    <section className="workforce-card capacity-heatmap-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Capacity heatmap</h3>
        <p>Live capacity states across the workforce — Available through Overloaded.</p>
      </header>
      {heatmap.length === 0 ? (
        <p className="concierge-consultant__empty">No capacity data yet.</p>
      ) : (
        <ul className="capacity-heatmap-card__list">
          {heatmap.map((cell) => (
            <li
              key={cell.profileId}
              className={`capacity-heatmap-card__cell capacity-heatmap-card__cell--${cell.capacityState}`}
            >
              <div>
                <strong>{cell.displayName}</strong>
                <span>{cell.regionId}</span>
              </div>
              <div className="capacity-heatmap-card__meta">
                <span>{WORKFORCE_CAPACITY_STATE_LABELS[cell.capacityState]}</span>
                <span>
                  {cell.activeJourneys}/{cell.maxActiveJourneys} journeys
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
