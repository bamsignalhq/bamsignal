import { useCallback, useMemo, useState } from "react";
import {
  ROUTE_AUDIT_AREAS,
  ROUTE_AUDIT_AREA_LABELS,
  ROUTE_AUDIT_BRAND,
  ROUTE_AUDIT_ADMIN_PATH,
  ROUTE_HEALTH_STATUS_LABELS,
  type RouteAuditAreaId,
  type RouteHealthStatusId
} from "../../../constants/routeAudit";
import { AUDIT_CENTER_ADMIN_PATH } from "../../../constants/auditCenterAdmin";
import { DATABASE_AUDIT_ADMIN_PATH } from "../../../constants/databaseAudit";
import { navigateToPath } from "../../../constants/routes";
import { buildRouteHealthReport } from "../../../utils/routeHealthReport";
import { NavigationMapCard } from "./NavigationMapCard";
import { OrphanRouteCard } from "./OrphanRouteCard";
import { RedirectRecommendationCard } from "./RedirectRecommendationCard";
import { RouteHealthCard } from "./RouteHealthCard";

export function RouteAuditPage() {
  const [areaFilter, setAreaFilter] = useState<RouteAuditAreaId | "all">("all");
  const [healthFilter, setHealthFilter] = useState<RouteHealthStatusId | "all">("all");
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildRouteHealthReport();
  }, [refreshKey]);

  const filteredInventory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return report.inventory.filter((item) => {
      if (areaFilter !== "all" && item.areaId !== areaFilter) return false;
      if (healthFilter !== "all" && item.health !== healthFilter) return false;
      if (!normalizedQuery) return true;
      return (
        item.path.toLowerCase().includes(normalizedQuery) ||
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.source.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [areaFilter, healthFilter, query, report.inventory]);

  const handleReset = useCallback(() => {
    setAreaFilter("all");
    setHealthFilter("all");
    setQuery("");
  }, []);

  return (
    <div className="route-audit-page">
      <header className="route-audit-page__head">
        <div>
          <h2>{ROUTE_AUDIT_BRAND}</h2>
          <p>
            Complete route inventory with duplicate detection, dead-route signals, orphan page
            detection, redirect opportunities, and navigation simplification guidance.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh audit
        </button>
      </header>

      <RouteHealthCard metrics={report.metrics} totalRoutes={report.totalRoutes} />

      <div className="route-audit-page__filters">
        <label className="route-audit-search-field">
          <span>Search</span>
          <input
            type="search"
            value={query}
            placeholder="Path, label, source…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label className="route-audit-search-field">
          <span>Area</span>
          <select
            value={areaFilter}
            onChange={(event) => setAreaFilter(event.target.value as RouteAuditAreaId | "all")}
          >
            <option value="all">All areas</option>
            {ROUTE_AUDIT_AREAS.map((area) => (
              <option key={area.id} value={area.id}>
                {ROUTE_AUDIT_AREA_LABELS[area.id]}
              </option>
            ))}
          </select>
        </label>

        <label className="route-audit-search-field">
          <span>Health</span>
          <select
            value={healthFilter}
            onChange={(event) => setHealthFilter(event.target.value as RouteHealthStatusId | "all")}
          >
            <option value="all">All statuses</option>
            {report.metrics.map((metric) => (
              <option key={metric.status} value={metric.status}>
                {ROUTE_HEALTH_STATUS_LABELS[metric.status]} ({metric.count})
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="concierge-consultant-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      <section className="route-audit-page__inventory concierge-consultant-card--glass cc-reveal">
        <header>
          <h3>Route inventory</h3>
          <p>{filteredInventory.length} routes match the current filters.</p>
        </header>

        <div className="route-audit-page__inventory-table" role="table" aria-label="Route inventory">
          <div className="route-audit-page__inventory-row route-audit-page__inventory-row--head" role="row">
            <span role="columnheader">Path</span>
            <span role="columnheader">Area</span>
            <span role="columnheader">Label</span>
            <span role="columnheader">Health</span>
            <span role="columnheader">Source</span>
          </div>
          {filteredInventory.map((item) => (
            <div key={item.id} className="route-audit-page__inventory-row" role="row">
              <span role="cell"><code>{item.path}</code></span>
              <span role="cell">{ROUTE_AUDIT_AREA_LABELS[item.areaId]}</span>
              <span role="cell">{item.label}</span>
              <span role="cell">{ROUTE_HEALTH_STATUS_LABELS[item.health]}</span>
              <span role="cell">{item.source}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="route-audit-page__body">
        <NavigationMapCard entries={report.navigationMap} />
        <div className="route-audit-page__column">
          <OrphanRouteCard routes={report.orphans} />
          <RedirectRecommendationCard recommendations={report.redirectRecommendations} />
        </div>
      </div>

      <section className="route-audit-page__simplify concierge-consultant-card--glass cc-reveal">
        <header>
          <h3>Navigation simplification opportunities</h3>
          <p>Overlapping admin and public surfaces that could be consolidated.</p>
        </header>
        <ul>
          {report.simplificationOpportunities.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
              <p className="route-audit-page__simplify-paths">{item.affectedPaths.join(" · ")}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="route-audit-page__foot">
        <p>Route audit path: {ROUTE_AUDIT_ADMIN_PATH}</p>
        <p>
          Compliance audit:{" "}
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => navigateToPath(AUDIT_CENTER_ADMIN_PATH)}
          >
            {AUDIT_CENTER_ADMIN_PATH}
          </button>
          {" · "}
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => navigateToPath(DATABASE_AUDIT_ADMIN_PATH)}
          >
            Database audit
          </button>
        </p>
        <p>Duplicates detected: {report.duplicates.length}</p>
      </footer>
    </div>
  );
}
