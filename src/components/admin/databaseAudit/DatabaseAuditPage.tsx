import { useCallback, useMemo, useState } from "react";
import {
  DATABASE_AUDIT_BRAND,
  DATABASE_AUDIT_ADMIN_PATH,
  DATABASE_DOMAINS,
  DATABASE_DOMAIN_LABELS,
  DATABASE_HEALTH_STATUS_LABELS,
  type DatabaseDomainId,
  type DatabaseHealthStatusId
} from "../../../constants/databaseAudit";
import { AUDIT_CENTER_ADMIN_PATH } from "../../../constants/auditCenterAdmin";
import { ROUTE_AUDIT_ADMIN_PATH } from "../../../constants/routeAudit";
import { PERMISSIONS_AUDIT_ADMIN_PATH } from "../../../constants/permissionsAudit";
import { JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH } from "../../../constants/journeyIntegrityAudit";
import { navigateToPath } from "../../../constants/routes";
import { buildMigrationGapReport } from "../../../utils/migrationGapReport";
import { DatabaseHealthCard } from "./DatabaseHealthCard";
import { DatabaseRecommendationCard } from "./DatabaseRecommendationCard";
import { DependencyCard } from "./DependencyCard";
import { MigrationStatusCard } from "./MigrationStatusCard";
import { TableIntegrityCard } from "./TableIntegrityCard";

export function DatabaseAuditPage() {
  const [domainFilter, setDomainFilter] = useState<DatabaseDomainId | "all">("all");
  const [healthFilter, setHealthFilter] = useState<DatabaseHealthStatusId | "all">("all");
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildMigrationGapReport();
  }, [refreshKey]);

  const filteredDependencies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return report.dependencies.filter((dependency) => {
      if (domainFilter !== "all" && dependency.domainId !== domainFilter) return false;
      if (healthFilter !== "all" && dependency.health !== healthFilter) return false;
      if (!normalizedQuery) return true;
      return (
        dependency.storageKey.toLowerCase().includes(normalizedQuery) ||
        dependency.engine.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [domainFilter, healthFilter, query, report.dependencies]);

  const filteredGaps = useMemo(() => {
    if (domainFilter === "all") return report.migrationGaps;
    return report.migrationGaps.filter((gap) => gap.domainId === domainFilter);
  }, [domainFilter, report.migrationGaps]);

  const handleReset = useCallback(() => {
    setDomainFilter("all");
    setHealthFilter("all");
    setQuery("");
  }, []);

  return (
    <div className="database-audit-page">
      <header className="database-audit-page__head">
        <div>
          <h2>{DATABASE_AUDIT_BRAND}</h2>
          <p>
            Supabase migration certainty — verify consultants, members, introductions, follow-ups,
            archives, legacy, payments, notifications, documents, support, safety, careers, academy,
            QA, and finance without assumptions.
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

      <DatabaseHealthCard metrics={report.metrics} totalTables={report.totalTables} />

      <div className="database-audit-page__filters">
        <label className="database-audit-search-field">
          <span>Search</span>
          <input
            type="search"
            value={query}
            placeholder="Storage key, engine…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label className="database-audit-search-field">
          <span>Domain</span>
          <select
            value={domainFilter}
            onChange={(event) => setDomainFilter(event.target.value as DatabaseDomainId | "all")}
          >
            <option value="all">All domains</option>
            {DATABASE_DOMAINS.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {DATABASE_DOMAIN_LABELS[domain.id]}
              </option>
            ))}
          </select>
        </label>

        <label className="database-audit-search-field">
          <span>Health</span>
          <select
            value={healthFilter}
            onChange={(event) => setHealthFilter(event.target.value as DatabaseHealthStatusId | "all")}
          >
            <option value="all">All statuses</option>
            {report.metrics.map((metric) => (
              <option key={metric.status} value={metric.status}>
                {DATABASE_HEALTH_STATUS_LABELS[metric.status]} ({metric.count})
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="concierge-consultant-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      <MigrationStatusCard gaps={filteredGaps} />

      <div className="database-audit-page__body">
        <TableIntegrityCard
          tables={report.tables}
          duplicates={report.duplicateTables}
          missing={report.missingTables}
        />
        <div className="database-audit-page__column">
          <DependencyCard dependencies={filteredDependencies} />
          <DatabaseRecommendationCard recommendations={report.recommendations} />
        </div>
      </div>

      <footer className="database-audit-page__foot">
        <p>Database audit path: {DATABASE_AUDIT_ADMIN_PATH}</p>
        <p>
          <button type="button" className="concierge-consultant-btn" onClick={() => navigateToPath(AUDIT_CENTER_ADMIN_PATH)}>
            Compliance audit
          </button>
          {" · "}
          <button type="button" className="concierge-consultant-btn" onClick={() => navigateToPath(ROUTE_AUDIT_ADMIN_PATH)}>
            Route audit
          </button>
          {" · "}
          <button type="button" className="concierge-consultant-btn" onClick={() => navigateToPath(PERMISSIONS_AUDIT_ADMIN_PATH)}>
            Permissions audit
          </button>
          {" · "}
          <button type="button" className="concierge-consultant-btn" onClick={() => navigateToPath(JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH)}>
            Journey audit
          </button>
        </p>
        <p>Unused baseline tables flagged: {report.unusedTables.length}</p>
      </footer>
    </div>
  );
}
