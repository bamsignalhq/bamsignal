import { useCallback, useMemo, useState } from "react";
import {
  BACKUP_AREAS,
  RECOVERY_CENTER_FUTURE_KINDS,
  RECOVERY_CENTER_POLICIES,
  RECOVERY_LEVELS,
  RECOVERY_LEVEL_LABELS,
  INCIDENT_RECOVERY_STATUS_LABELS
} from "../../../constants/recoveryCenter";
import {
  RECOVERY_CENTER_ADMIN_BRAND,
  RECOVERY_CENTER_ADMIN_PATH
} from "../../../constants/recoveryCenterAdmin";
import type { BackupAreaId, RecoveryLevelId } from "../../../constants/recoveryCenter";
import { buildRecoveryCenterBundle, emptyRecoveryFilters } from "../../../utils/recoveryCenterEngine";
import { BackupStatusCard } from "./BackupStatusCard";
import { IncidentRecoveryTimeline } from "./IncidentRecoveryTimeline";
import { RecoveryPlanCard } from "./RecoveryPlanCard";
import { RecoveryReadinessCard } from "./RecoveryReadinessCard";

export function RecoveryDashboardPage() {
  const [filters, setFilters] = useState(() => emptyRecoveryFilters());
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildRecoveryCenterBundle(filters, selectedIncidentId);
  }, [filters, refreshKey, selectedIncidentId]);

  const selectedIncident =
    bundle.incidents.find((incident) => incident.id === selectedIncidentId) ?? bundle.selectedIncident;

  const handleAreaSelect = useCallback((areaId: BackupAreaId) => {
    setFilters((current) => ({
      ...current,
      areaId: current.areaId === areaId ? "all" : areaId
    }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(emptyRecoveryFilters());
    setSelectedIncidentId(null);
  }, []);

  return (
    <div className="recovery-center-page">
      <header className="recovery-center-page__head">
        <div>
          <h2>{RECOVERY_CENTER_ADMIN_BRAND}</h2>
          <p>
            Resilience architecture — database, document, audit, archive, and configuration backups.
            Recovery plans for minor through disaster incidents. No institution is complete without
            disaster recovery planning.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <section className="recovery-center-page__metrics" aria-label="Recovery metrics">
        {bundle.metrics.map((metric) => (
          <article key={metric.id} className="recovery-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <RecoveryReadinessCard readiness={bundle.readiness} />

      <section className="recovery-center-page__policies">
        <h3>Policies</h3>
        <ul>
          {RECOVERY_CENTER_POLICIES.map((policy) => (
            <li key={policy.id}>{policy.label}</li>
          ))}
        </ul>
      </section>

      <section className="recovery-center-page__areas" aria-label="Backup areas">
        {BACKUP_AREAS.map((area) => {
          const backup = bundle.backups.find((item) => item.areaId === area.id);
          if (!backup) return null;
          return (
            <BackupStatusCard
              key={area.id}
              backup={backup}
              hint={area.hint}
              active={filters.areaId === area.id}
              onSelect={() => handleAreaSelect(area.id)}
            />
          );
        })}
      </section>

      <div className="recovery-center-page__filters">
        <label className="recovery-search-field">
          <span>Search incidents</span>
          <input
            type="search"
            value={filters.query}
            placeholder="Ref, title, summary…"
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          />
        </label>

        <label className="recovery-search-field">
          <span>Recovery level</span>
          <select
            value={filters.levelId}
            onChange={(event) =>
              setFilters({ ...filters, levelId: event.target.value as RecoveryLevelId | "all" })
            }
          >
            <option value="all">All levels</option>
            {RECOVERY_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {RECOVERY_LEVEL_LABELS[level.id]}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="concierge-consultant-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      <section className="recovery-center-page__plans" aria-label="Recovery plans">
        <h3>Recovery plans</h3>
        <div className="recovery-center-page__plans-grid">
          {RECOVERY_LEVELS.map((level) => {
            const plan = bundle.plans.find((item) => item.levelId === level.id);
            if (!plan) return null;
            return <RecoveryPlanCard key={plan.id} plan={plan} hint={level.hint} />;
          })}
        </div>
      </section>

      <div className="recovery-center-page__body">
        <section className="recovery-center-page__incidents">
          <h3>Incident recovery</h3>
          {bundle.incidents.length ? (
            bundle.incidents.map((incident) => (
              <button
                key={incident.id}
                type="button"
                className={[
                  "recovery-incident-card",
                  "recovery-incident-card--button",
                  selectedIncidentId === incident.id ? "is-active" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedIncidentId(incident.id)}
              >
                <div className="recovery-incident-card__head">
                  <strong>{incident.incidentRef}</strong>
                  <span>{RECOVERY_LEVEL_LABELS[incident.levelId]}</span>
                  <span>{INCIDENT_RECOVERY_STATUS_LABELS[incident.status]}</span>
                </div>
                <h4>{incident.title}</h4>
                <p>{incident.summary}</p>
                <span className="recovery-incident-card__meta">
                  {incident.owner} · {new Date(incident.startedAt).toLocaleString()}
                </span>
              </button>
            ))
          ) : (
            <p className="recovery-center-page__empty">No incidents match the current filters.</p>
          )}
        </section>

        <div className="recovery-center-page__detail">
          {selectedIncident ? (
            <>
              <article className="recovery-incident-detail concierge-consultant-card--glass">
                <header>
                  <h3>{selectedIncident.title}</h3>
                  <p>{selectedIncident.summary}</p>
                </header>
                <dl className="recovery-incident-detail__grid">
                  <div>
                    <dt>Reference</dt>
                    <dd>{selectedIncident.incidentRef}</dd>
                  </div>
                  <div>
                    <dt>Level</dt>
                    <dd>{RECOVERY_LEVEL_LABELS[selectedIncident.levelId]}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{INCIDENT_RECOVERY_STATUS_LABELS[selectedIncident.status]}</dd>
                  </div>
                  <div>
                    <dt>Owner</dt>
                    <dd>{selectedIncident.owner}</dd>
                  </div>
                </dl>
              </article>
              <IncidentRecoveryTimeline timeline={selectedIncident.timeline} />
            </>
          ) : (
            <p className="recovery-center-page__empty">
              Select an incident to view recovery timeline and status.
            </p>
          )}
        </div>
      </div>

      <footer className="recovery-center-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — not implemented in this release.</p>
        <ul>
          {RECOVERY_CENTER_FUTURE_KINDS.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
        <p>Admin path: {RECOVERY_CENTER_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
