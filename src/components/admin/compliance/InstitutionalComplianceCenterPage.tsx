import { useCallback, useMemo, useState } from "react";
import {
  INSTITUTIONAL_AUDIT_TARGET_LABELS,
  INSTITUTIONAL_COMPLIANCE_FUTURE_CAPABILITIES
} from "../../../constants/institutionalAuditCompliance";
import {
  INSTITUTIONAL_COMPLIANCE_ADMIN_BRAND,
  INSTITUTIONAL_COMPLIANCE_ADMIN_PATH
} from "../../../constants/institutionalComplianceAdmin";
import { AUDIT_CENTER_ADMIN_PATH } from "../../../constants/auditCenterAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildInstitutionalAuditBundle } from "../../../utils/auditEngine";
import { emptyInstitutionalComplianceFilters } from "../../../utils/auditEngineLogic";
import { AuditActorCard } from "./AuditActorCard";
import { AuditEventCard } from "./AuditEventCard";
import { AuditTimeline } from "./AuditTimeline";
import { ComplianceOverviewCard } from "./ComplianceOverviewCard";
import { ComplianceSearchBar } from "./ComplianceSearchBar";

export function InstitutionalComplianceCenterPage() {
  const [filters, setFilters] = useState(() => emptyInstitutionalComplianceFilters());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildInstitutionalAuditBundle(filters, selectedEventId);
  }, [filters, refreshKey, selectedEventId]);

  const selectedEvent =
    bundle.timeline.find((event) => event.id === selectedEventId) ?? bundle.selectedEvent;

  const handleResetFilters = useCallback(() => {
    setFilters(emptyInstitutionalComplianceFilters());
    setSelectedEventId(null);
  }, []);

  return (
    <div className="institutional-compliance-page">
      <header className="institutional-compliance-page__head">
        <div>
          <h2>{INSTITUTIONAL_COMPLIANCE_ADMIN_BRAND}</h2>
          <p>
            Permanent append-only audit system for institutional access, concierge operations,
            finance, archives, documents, support escalations, and safety actions.
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

      <ComplianceOverviewCard metrics={bundle.metrics} />
      <ComplianceSearchBar filters={filters} onChange={setFilters} onReset={handleResetFilters} />

      <div className="institutional-compliance-page__body">
        <AuditTimeline
          events={bundle.timeline}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
        />
        <div className="institutional-compliance-page__detail">
          {selectedEvent ? (
            <>
              <AuditActorCard actor={selectedEvent.actor} ipAddress={selectedEvent.ipAddress} />
              <AuditEventCard event={selectedEvent} />
              <section className="institutional-audit-target-card concierge-consultant-card--glass cc-reveal">
                <header>
                  <h3>Target</h3>
                </header>
                <dl className="institutional-audit-target-card__grid">
                  <div>
                    <dt>Label</dt>
                    <dd>{selectedEvent.target.label}</dd>
                  </div>
                  <div>
                    <dt>Kind</dt>
                    <dd>{INSTITUTIONAL_AUDIT_TARGET_LABELS[selectedEvent.target.kind]}</dd>
                  </div>
                  <div>
                    <dt>Reference</dt>
                    <dd>
                      <code>{selectedEvent.target.ref ?? selectedEvent.target.id}</code>
                    </dd>
                  </div>
                </dl>
                {selectedEvent.detail ? <p>{selectedEvent.detail}</p> : null}
              </section>
            </>
          ) : (
            <p className="institutional-compliance-page__empty">
              Select an event to inspect actor, target, and full audit record.
            </p>
          )}
        </div>
      </div>

      <section className="institutional-compliance-page__future concierge-consultant-card--glass cc-reveal">
        <header>
          <h3>Future ready</h3>
          <p>Documented capabilities planned for regulatory and board reporting.</p>
        </header>
        <ul>
          {INSTITUTIONAL_COMPLIANCE_FUTURE_CAPABILITIES.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong> — {item.description}
            </li>
          ))}
        </ul>
      </section>

      <footer className="institutional-compliance-page__foot">
        <p>Admin path: {INSTITUTIONAL_COMPLIANCE_ADMIN_PATH}</p>
        <p>
          Legacy audit center:{" "}
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => navigateToPath(AUDIT_CENTER_ADMIN_PATH)}
          >
            {AUDIT_CENTER_ADMIN_PATH}
          </button>
        </p>
        <p>Active filters: {bundle.activeFilters.length ? bundle.activeFilters.join(", ") : "none"}</p>
      </footer>
    </div>
  );
}
