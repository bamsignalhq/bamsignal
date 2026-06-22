import { useCallback, useMemo, useState } from "react";
import {
  JOURNEY_INTEGRITY_AUDIT_BRAND,
  JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH,
  JOURNEY_HEALTH_STATUS_LABELS,
  JOURNEY_STAGES,
  type JourneyHealthStatusId
} from "../../../constants/journeyIntegrityAudit";
import { AUDIT_CENTER_ADMIN_PATH } from "../../../constants/auditCenterAdmin";
import { DATABASE_AUDIT_ADMIN_PATH } from "../../../constants/databaseAudit";
import { ROUTE_AUDIT_ADMIN_PATH } from "../../../constants/routeAudit";
import { PERMISSIONS_AUDIT_ADMIN_PATH } from "../../../constants/permissionsAudit";
import { navigateToPath } from "../../../constants/routes";
import {
  buildJourneyIntegrityReport,
  summarizeJourneyIntegrityStatus
} from "../../../utils/journeyIntegrityReport";
import { JourneyHealthCard } from "./JourneyHealthCard";
import { JourneyIntegrityCard } from "./JourneyIntegrityCard";
import { JourneyDependencyCard } from "./JourneyDependencyCard";
import { TimelineIntegrityCard } from "./TimelineIntegrityCard";
import { JourneyRepairRecommendationCard } from "./JourneyRepairRecommendationCard";

export function JourneyIntegrityAuditPage() {
  const [statusFilter, setStatusFilter] = useState<JourneyHealthStatusId | "all">("all");
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildJourneyIntegrityReport();
  }, [refreshKey]);

  const overallStatus = useMemo(() => summarizeJourneyIntegrityStatus(report), [report]);

  const filteredJourneys = useMemo(() => {
    return report.journeys.filter((journey) => {
      if (statusFilter !== "all" && journey.status !== statusFilter) return false;
      return true;
    });
  }, [report.journeys, statusFilter]);

  const filteredIssues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return report.issues;
    return report.issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(normalizedQuery) ||
        issue.summary.toLowerCase().includes(normalizedQuery) ||
        issue.journeyIds.some((journeyId) => journeyId.toLowerCase().includes(normalizedQuery))
    );
  }, [query, report.issues]);

  const handleReset = useCallback(() => {
    setStatusFilter("all");
    setQuery("");
  }, []);

  return (
    <div className="journey-integrity-audit-page">
      <header className="journey-integrity-audit-page__head">
        <div>
          <h2>{JOURNEY_INTEGRITY_AUDIT_BRAND}</h2>
          <p>
            Verify journey IDs across Application, Consultation, Assignment, Introduction, Follow-up,
            Relationship, Archive, Legacy, Success Story, Milestones, Family, Quotes, and Events —
            detect missing IDs, duplicates, broken links, orphans, and timeline or archive
            inconsistencies.
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

      <JourneyHealthCard
        metrics={report.metrics}
        totalJourneys={report.totalJourneys}
        overallStatus={overallStatus}
      />

      <div className="journey-integrity-audit-page__filters">
        <label className="journey-integrity-search-field">
          <span>Search</span>
          <input
            type="search"
            value={query}
            placeholder="Journey ID, issue title…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label className="journey-integrity-search-field">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as JourneyHealthStatusId | "all")}
          >
            <option value="all">All statuses</option>
            {report.metrics.map((metric) => (
              <option key={metric.status} value={metric.status}>
                {JOURNEY_HEALTH_STATUS_LABELS[metric.status]} ({metric.count})
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="concierge-consultant-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="journey-integrity-audit-page__stages">
        <p>Verified stages:</p>
        <div className="journey-integrity-audit-page__stage-chips">
          {JOURNEY_STAGES.map((stage) => (
            <span key={stage.id} className="journey-integrity-audit-page__stage-chip">
              {stage.label}
            </span>
          ))}
        </div>
      </div>

      <div className="journey-integrity-audit-page__body">
        <div className="journey-integrity-audit-page__column">
          <JourneyIntegrityCard journeys={filteredJourneys} query={query} />
          <JourneyDependencyCard dependencies={report.dependencies} />
        </div>
        <div className="journey-integrity-audit-page__column">
          <TimelineIntegrityCard journeys={report.journeys} />
          <JourneyRepairRecommendationCard recommendations={report.recommendations} />
        </div>
      </div>

      {filteredIssues.length ? (
        <section className="journey-integrity-audit-page__issues concierge-consultant-card--glass cc-reveal">
          <h3>Detected issues ({filteredIssues.length})</h3>
          <ul>
            {filteredIssues.map((issue) => (
              <li key={issue.id} className={`journey-integrity-audit-page__issue journey-integrity-audit-page__issue--${issue.status}`}>
                <strong>{issue.title}</strong>
                <p>{issue.summary}</p>
                {issue.journeyIds.length ? (
                  <small>Journeys: {issue.journeyIds.join(", ")}</small>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="journey-integrity-audit-page__foot">
        <p>Journey audit path: {JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH}</p>
        <p>
          <button type="button" className="concierge-consultant-btn" onClick={() => navigateToPath(AUDIT_CENTER_ADMIN_PATH)}>
            Compliance
          </button>
          {" · "}
          <button type="button" className="concierge-consultant-btn" onClick={() => navigateToPath(ROUTE_AUDIT_ADMIN_PATH)}>
            Routes
          </button>
          {" · "}
          <button type="button" className="concierge-consultant-btn" onClick={() => navigateToPath(DATABASE_AUDIT_ADMIN_PATH)}>
            Database
          </button>
          {" · "}
          <button type="button" className="concierge-consultant-btn" onClick={() => navigateToPath(PERMISSIONS_AUDIT_ADMIN_PATH)}>
            Security
          </button>
        </p>
      </footer>
    </div>
  );
}
