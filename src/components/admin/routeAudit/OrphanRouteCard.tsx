import { ROUTE_AUDIT_AREA_LABELS, ROUTE_HEALTH_STATUS_LABELS } from "../../../constants/routeAudit";
import type { RouteInventoryEntry } from "../../../types/routeAudit";

type OrphanRouteCardProps = {
  routes: RouteInventoryEntry[];
};

export function OrphanRouteCard({ routes }: OrphanRouteCardProps) {
  return (
    <section className="orphan-route-card concierge-consultant-card--glass cc-reveal">
      <header className="orphan-route-card__head">
        <h3>Orphan and drift routes</h3>
        <p>Deprecated aliases, redirect-only paths, and admin routes missing nav linkage.</p>
      </header>

      {routes.length ? (
        <ul className="orphan-route-card__list">
          {routes.map((route) => (
            <li key={route.id}>
              <div className="orphan-route-card__item-head">
                <strong><code>{route.path}</code></strong>
                <span>{ROUTE_HEALTH_STATUS_LABELS[route.health]}</span>
              </div>
              <p>
                {ROUTE_AUDIT_AREA_LABELS[route.areaId]} · {route.label}
                {route.note ? ` — ${route.note}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="orphan-route-card__empty">No orphan or drift routes detected in the current inventory.</p>
      )}
    </section>
  );
}
