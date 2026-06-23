import {
  INSTITUTIONAL_AUDIT_ACTION_LABELS,
  INSTITUTIONAL_AUDIT_SEVERITY_LABELS,
  INSTITUTIONAL_COMPLIANCE_FILTER_FIELDS,
  type AuditActionId,
  type AuditSeverityId
} from "../../../constants/institutionalAuditCompliance";
import type { InstitutionalComplianceFilters } from "../../../types/auditEngine";

type ComplianceSearchBarProps = {
  filters: InstitutionalComplianceFilters;
  onChange: (filters: InstitutionalComplianceFilters) => void;
  onReset: () => void;
};

export function ComplianceSearchBar({ filters, onChange, onReset }: ComplianceSearchBarProps) {
  return (
    <section className="institutional-compliance-search concierge-consultant-card--glass cc-reveal">
      <header className="institutional-compliance-search__head">
        <h3>Search &amp; filters</h3>
        <p>Filter institutional audit events by date, actor, action, target, and severity.</p>
      </header>

      <div className="institutional-compliance-search__grid">
        <label>
          Date
          <input
            type="date"
            value={filters.date}
            onChange={(event) => onChange({ ...filters, date: event.target.value })}
          />
        </label>
        <label>
          Actor
          <input
            type="search"
            placeholder="Name, email, or role"
            value={filters.actor}
            onChange={(event) => onChange({ ...filters, actor: event.target.value })}
          />
        </label>
        <label>
          Action
          <select
            value={filters.action}
            onChange={(event) =>
              onChange({ ...filters, action: event.target.value as AuditActionId | "all" })
            }
          >
            <option value="all">All actions</option>
            {Object.entries(INSTITUTIONAL_AUDIT_ACTION_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Target
          <input
            type="search"
            placeholder="Target label or reference"
            value={filters.target}
            onChange={(event) => onChange({ ...filters, target: event.target.value })}
          />
        </label>
        <label>
          Severity
          <select
            value={filters.severity}
            onChange={(event) =>
              onChange({ ...filters, severity: event.target.value as AuditSeverityId | "all" })
            }
          >
            <option value="all">All severities</option>
            {Object.entries(INSTITUTIONAL_AUDIT_SEVERITY_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <footer className="institutional-compliance-search__foot">
        <p>
          Active filters:{" "}
          {INSTITUTIONAL_COMPLIANCE_FILTER_FIELDS.map((field) => field.label).join(", ")}
        </p>
        <button type="button" className="concierge-consultant-btn" onClick={onReset}>
          Reset filters
        </button>
      </footer>
    </section>
  );
}
