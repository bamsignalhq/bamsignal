import {
  SAFETY_CATEGORIES,
  SAFETY_CATEGORY_LABELS,
  SAFETY_SEVERITIES,
  SAFETY_SEVERITY_LABELS,
  SAFETY_STATUSES,
  SAFETY_STATUS_LABELS
} from "../../../constants/safetyCenter";
import type { SafetyFilterState, SafetyIncidentRecord, SafetyMetric } from "../../../types/safetyCenter";
import type { SafetyCategoryId, SafetySeverityId, SafetyStatusId } from "../../../constants/safetyCenter";
import { SafetyIncidentCard } from "./SafetyIncidentCard";

type SafetyQueueCardProps = {
  metrics: SafetyMetric[];
  queue: SafetyIncidentRecord[];
  filters: SafetyFilterState;
  selectedIncidentId: string | null;
  onChangeFilters: (filters: SafetyFilterState) => void;
  onResetFilters: () => void;
  onSelectIncident: (incidentId: string) => void;
};

export function SafetyQueueCard({
  metrics,
  queue,
  filters,
  selectedIncidentId,
  onChangeFilters,
  onResetFilters,
  onSelectIncident
}: SafetyQueueCardProps) {
  return (
    <section className="safety-queue-card concierge-consultant-card--glass cc-reveal">
      <header className="safety-queue-card__head">
        <div>
          <h3>Safety queue</h3>
          <p>Open incidents requiring review or escalation.</p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={onResetFilters}>
          Reset filters
        </button>
      </header>

      <div className="safety-queue-card__metrics">
        {metrics.map((metric) => (
          <article key={metric.id} className="safety-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="safety-queue-card__filters">
        <label className="safety-search-field">
          <span>Search</span>
          <input
            type="search"
            value={filters.query}
            placeholder="Ref, subject, summary…"
            onChange={(event) => onChangeFilters({ ...filters, query: event.target.value })}
          />
        </label>

        <label className="safety-search-field">
          <span>Category</span>
          <select
            value={filters.categoryId}
            onChange={(event) =>
              onChangeFilters({ ...filters, categoryId: event.target.value as SafetyCategoryId | "all" })
            }
          >
            <option value="all">All categories</option>
            {SAFETY_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {SAFETY_CATEGORY_LABELS[category.id]}
              </option>
            ))}
          </select>
        </label>

        <label className="safety-search-field">
          <span>Severity</span>
          <select
            value={filters.severity}
            onChange={(event) =>
              onChangeFilters({ ...filters, severity: event.target.value as SafetySeverityId | "all" })
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
              onChangeFilters({ ...filters, status: event.target.value as SafetyStatusId | "all" })
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

      {queue.length ? (
        <div className="safety-queue-card__list">
          {queue.map((incident) => (
            <SafetyIncidentCard
              key={incident.id}
              incident={incident}
              selected={selectedIncidentId === incident.id}
              onSelect={() => onSelectIncident(incident.id)}
            />
          ))}
        </div>
      ) : (
        <p className="safety-queue-card__empty">No open incidents match the current filters.</p>
      )}
    </section>
  );
}
