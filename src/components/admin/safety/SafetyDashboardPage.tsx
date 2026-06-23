import { useCallback, useMemo, useState } from "react";
import {
  SAFETY_CASE_TYPES,
  SAFETY_CASE_TYPE_LABELS,
  SAFETY_CENTER_FUTURE_KINDS,
  SAFETY_SEVERITIES,
  SAFETY_SEVERITY_LABELS,
  SAFETY_STATUSES,
  SAFETY_STATUS_LABELS
} from "../../../constants/safetyCenter";
import {
  SAFETY_CENTER_ADMIN_BRAND,
  SAFETY_CENTER_ADMIN_PATH
} from "../../../constants/safetyCenterAdmin";
import type { SafetyCaseTypeId, SafetySeverityId, SafetyStatusId } from "../../../constants/safetyCenter";
import { buildSafetyCenterBundle } from "../../../utils/safetyCenterEngine";
import { assessCaseRisk, emptySafetyFilters, listSafetyCases } from "../../../utils/safetyCenterLogic";
import { EscalationQueue } from "./EscalationQueue";
import { IncidentTimeline } from "./IncidentTimeline";
import { RiskAssessmentCard } from "./RiskAssessmentCard";
import { SafetyActionCard } from "./SafetyActionCard";
import { SafetyCaseCard } from "./SafetyCaseCard";

export function SafetyDashboardPage() {
  const [filters, setFilters] = useState(() => emptySafetyFilters());
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildSafetyCenterBundle(filters, selectedCaseId);
  }, [filters, refreshKey, selectedCaseId]);

  const allCases = useMemo(() => listSafetyCases(), [refreshKey]);

  const selectedCase =
    bundle.queue.find((record) => record.id === selectedCaseId) ??
    bundle.escalations.find((record) => record.id === selectedCaseId) ??
    bundle.selectedCase;

  const riskAssessment = useMemo(
    () => (selectedCase ? assessCaseRisk(selectedCase, allCases) : null),
    [allCases, selectedCase]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(emptySafetyFilters());
    setSelectedCaseId(null);
  }, []);

  return (
    <div className="safety-center-page">
      <header className="safety-center-page__head">
        <div>
          <h2>{SAFETY_CENTER_ADMIN_BRAND}</h2>
          <p>
            Institutional safety command center — harassment, fraud, catfishing, threats, identity
            concerns, abusive behaviour, blackmail, scam reports, and emergency escalation. Trust is
            the product.
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

      <section className="safety-center-page__metrics" aria-label="Safety metrics">
        {bundle.metrics.map((metric) => (
          <article key={metric.id} className="safety-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <div className="safety-center-page__body">
        <section className="safety-queue-card concierge-consultant-card--glass cc-reveal" aria-label="Case queue">
          <header className="safety-queue-card__head">
            <div>
              <h3>Case queue</h3>
              <p>Open cases requiring investigation or action.</p>
            </div>
            <button type="button" className="concierge-consultant-btn" onClick={handleResetFilters}>
              Reset filters
            </button>
          </header>

          <div className="safety-queue-card__filters">
            <label className="safety-search-field">
              <span>Search</span>
              <input
                type="search"
                value={filters.query}
                placeholder="Ref, subject, summary…"
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              />
            </label>

            <label className="safety-search-field">
              <span>Case type</span>
              <select
                value={filters.caseTypeId}
                onChange={(event) =>
                  setFilters({ ...filters, caseTypeId: event.target.value as SafetyCaseTypeId | "all" })
                }
              >
                <option value="all">All types</option>
                {SAFETY_CASE_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {SAFETY_CASE_TYPE_LABELS[type.id]}
                  </option>
                ))}
              </select>
            </label>

            <label className="safety-search-field">
              <span>Severity</span>
              <select
                value={filters.severity}
                onChange={(event) =>
                  setFilters({ ...filters, severity: event.target.value as SafetySeverityId | "all" })
                }
              >
                <option value="all">All severities</option>
                {SAFETY_SEVERITIES.map((severity) => (
                  <option key={severity.id} value={severity.id}>
                    {SAFETY_SEVERITY_LABELS[severity.id]}
                  </option>
                ))}
              </select>
            </label>

            <label className="safety-search-field">
              <span>Status</span>
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters({ ...filters, status: event.target.value as SafetyStatusId | "all" })
                }
              >
                <option value="all">All statuses</option>
                {SAFETY_STATUSES.map((status) => (
                  <option key={status.id} value={status.id}>
                    {SAFETY_STATUS_LABELS[status.id]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {bundle.queue.length ? (
            <div className="safety-queue-card__list">
              {bundle.queue.map((record) => (
                <SafetyCaseCard
                  key={record.id}
                  record={record}
                  selected={selectedCaseId === record.id}
                  onSelect={() => setSelectedCaseId(record.id)}
                />
              ))}
            </div>
          ) : (
            <p className="safety-queue-card__empty">No open cases match the current filters.</p>
          )}
        </section>

        <div className="safety-center-page__detail">
          {selectedCase ? (
            <>
              <SafetyCaseCard record={selectedCase} />
              {riskAssessment ? <RiskAssessmentCard assessment={riskAssessment} /> : null}
              <SafetyActionCard actionsTaken={selectedCase.actionsTaken} />
              <IncidentTimeline timeline={selectedCase.timeline} />
            </>
          ) : (
            <p className="safety-center-page__empty">
              Select a case to inspect risk assessment, actions, and full timeline.
            </p>
          )}
        </div>

        <EscalationQueue
          cases={bundle.escalations}
          selectedCaseId={selectedCaseId}
          onSelectCase={setSelectedCaseId}
        />
      </div>

      <footer className="safety-center-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — not implemented in this release.</p>
        <ul>
          {SAFETY_CENTER_FUTURE_KINDS.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
        <p>Admin path: {SAFETY_CENTER_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
