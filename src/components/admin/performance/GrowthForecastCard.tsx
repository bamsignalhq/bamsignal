import { PERFORMANCE_HEALTH_STATUS_LABELS } from "../../../constants/performanceCenter";
import type { PerformanceGrowthForecast } from "../../../types/performanceCenter";

type GrowthForecastCardProps = {
  forecasts: PerformanceGrowthForecast[];
};

export function GrowthForecastCard({ forecasts }: GrowthForecastCardProps) {
  return (
    <section className="performance-center-card growth-forecast-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>Growth forecast</h3>
        <p>Projected member growth, sessions, throughput, storage, and bandwidth headroom.</p>
      </header>
      {forecasts.length ? (
        <ul className="performance-center-card__list">
          {forecasts.map((item) => (
            <li key={item.id}>
              <div className="performance-center-card__row">
                <strong>{item.periodLabel}</strong>
                <span
                  className={`performance-center-card__badge performance-center-card__badge--${item.status}`}
                >
                  {PERFORMANCE_HEALTH_STATUS_LABELS[item.status]}
                </span>
              </div>
              <div className="performance-center-card__meta">
                <span>{item.memberCount.toLocaleString()} members</span>
                <span>{item.concurrentSessions.toLocaleString()} sessions</span>
                <span>{item.apiThroughput.toLocaleString()} rpm</span>
                <span>{item.storageGb} GB storage</span>
                <span>{item.bandwidthTb} TB bandwidth</span>
                <span>{item.headroomPercent}% headroom</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="performance-center-card__empty">No growth forecasts available.</p>
      )}
    </section>
  );
}
