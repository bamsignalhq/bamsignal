import { PERFORMANCE_HEALTH_STATUS_LABELS } from "../../../constants/performanceCenter";
import type { PerformanceDatabaseProfile } from "../../../types/performanceCenter";

type DatabasePerformanceCardProps = {
  profiles: PerformanceDatabaseProfile[];
};

export function DatabasePerformanceCard({ profiles }: DatabasePerformanceCardProps) {
  return (
    <section className="performance-center-card database-performance-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>Database performance</h3>
        <p>Query volume, slow queries, index usage, and cache efficiency.</p>
      </header>
      {profiles.length ? (
        <ul className="performance-center-card__list">
          {profiles.map((item) => (
            <li key={item.id}>
              <div className="performance-center-card__row">
                <strong>{item.name}</strong>
                <span
                  className={`performance-center-card__badge performance-center-card__badge--${item.status}`}
                >
                  {PERFORMANCE_HEALTH_STATUS_LABELS[item.status]}
                </span>
              </div>
              <div className="performance-center-card__meta">
                <span>{item.queryCount} qps</span>
                <span>{item.slowQueryCount} slow</span>
                <span>{item.indexUsagePercent}% indexes</span>
                <span>{item.cacheHitPercent}% cache</span>
                <span>{item.connectionPoolUsed}% pool</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="performance-center-card__empty">No database profiles in this section.</p>
      )}
    </section>
  );
}
