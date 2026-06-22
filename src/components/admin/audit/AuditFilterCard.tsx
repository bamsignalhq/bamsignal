import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  AUDIT_FILTER_FIELDS,
  AUDIT_TRACKED_ACTIONS
} from "../../../constants/auditCenter";
import type { AuditFilterState } from "../../../types/auditCenter";
import type { AuditEntityId } from "../../../constants/auditCenter";

type AuditFilterCardProps = {
  filters: AuditFilterState;
  onChange: (filters: AuditFilterState) => void;
  onReset: () => void;
};

export function AuditFilterCard({ filters, onChange, onReset }: AuditFilterCardProps) {
  return (
    <section className="audit-filter-card concierge-consultant-card--glass cc-reveal">
      <header className="audit-filter-card__head">
        <h3>Filters</h3>
        <button type="button" className="concierge-consultant-btn" onClick={onReset}>
          Reset
        </button>
      </header>

      <div className="audit-filter-card__grid">
        {AUDIT_FILTER_FIELDS.map((field) => {
          if (field.id === "action") {
            return (
              <label key={field.id} className="audit-filter-field">
                <span>{field.label}</span>
                <select
                  value={filters.action}
                  onChange={(event) =>
                    onChange({ ...filters, action: event.target.value as AuditFilterState["action"] })
                  }
                >
                  <option value="all">All actions</option>
                  {AUDIT_TRACKED_ACTIONS.map((action) => (
                    <option key={action.id} value={action.id}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          if (field.id === "entity") {
            return (
              <label key={field.id} className="audit-filter-field">
                <span>{field.label}</span>
                <select
                  value={filters.entity}
                  onChange={(event) =>
                    onChange({ ...filters, entity: event.target.value as AuditEntityId | "all" })
                  }
                >
                  <option value="all">All entities</option>
                  {Object.entries(AUDIT_ENTITY_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          if (field.id === "date") {
            return (
              <label key={field.id} className="audit-filter-field">
                <span>{field.label}</span>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(event) => onChange({ ...filters, date: event.target.value })}
                />
              </label>
            );
          }

          const key = field.id as "journeyId" | "consultant" | "member";
          return (
            <label key={field.id} className="audit-filter-field">
              <span>{field.label}</span>
              <input
                type="text"
                value={filters[key]}
                placeholder={`Filter by ${field.label.toLowerCase()}`}
                onChange={(event) => onChange({ ...filters, [key]: event.target.value })}
              />
            </label>
          );
        })}
      </div>

      <p className="audit-filter-card__hint">
        Tracked actions: {AUDIT_TRACKED_ACTIONS.map((action) => AUDIT_ACTION_LABELS[action.id]).join(", ")}.
      </p>
    </section>
  );
}
