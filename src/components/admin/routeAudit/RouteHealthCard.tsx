import { ROUTE_HEALTH_STATUS_LABELS } from "../../../constants/routeAudit";
import type { RouteHealthMetric } from "../../../types/routeAudit";

type RouteHealthCardProps = {
  metrics: RouteHealthMetric[];
  totalRoutes: number;
};

export function RouteHealthCard({ metrics, totalRoutes }: RouteHealthCardProps) {
  return (
    <section className="route-health-card concierge-consultant-card--glass cc-reveal">
      <header className="route-health-card__head">
        <h3>Route health</h3>
        <p>{totalRoutes} routes inventoried across public, member, consultant, admin, institute, events, concierge, and century layers.</p>
      </header>

      <div className="route-health-card__metrics">
        {metrics.map((metric) => (
          <article key={metric.status} className={`route-health-card__chip route-health-card__chip--${metric.status}`}>
            <p>{ROUTE_HEALTH_STATUS_LABELS[metric.status]}</p>
            <strong>{metric.count}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
