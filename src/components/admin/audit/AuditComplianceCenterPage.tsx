import { useCallback, useMemo, useState } from "react";
import {
  AUDIT_CENTER_ADMIN_BRAND,
  AUDIT_CENTER_ADMIN_PATH
} from "../../../constants/auditCenterAdmin";
import { ROUTE_AUDIT_ADMIN_PATH } from "../../../constants/routeAudit";
import { DATABASE_AUDIT_ADMIN_PATH } from "../../../constants/databaseAudit";
import { PERMISSIONS_AUDIT_ADMIN_PATH } from "../../../constants/permissionsAudit";
import { JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH } from "../../../constants/journeyIntegrityAudit";
import { navigateToPath } from "../../../constants/routes";
import type { AuditFilterState } from "../../../types/auditCenter";
import { buildAuditComplianceBundle } from "../../../utils/auditCenterEngine";
import { emptyAuditFilters } from "../../../utils/auditCenterLogic";
import { ActivityTimelineCard } from "./ActivityTimelineCard";
import { AuditEventCard } from "./AuditEventCard";
import { AuditFilterCard } from "./AuditFilterCard";
import { AuditSummaryCard } from "./AuditSummaryCard";
import { ComplianceOverviewCard } from "./ComplianceOverviewCard";

export function AuditComplianceCenterPage() {
  const [filters, setFilters] = useState<AuditFilterState>(() => emptyAuditFilters());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildAuditComplianceBundle(filters, selectedEventId);
  }, [filters, refreshKey, selectedEventId]);

  const selectedEvent =
    bundle.timeline.find((event) => event.id === selectedEventId) ?? bundle.selectedEvent;

  const handleResetFilters = useCallback(() => {
    setFilters(emptyAuditFilters());
    setSelectedEventId(null);
  }, []);

  return (
    <div className="audit-center-page">
      <header className="audit-center-page__head">
        <div>
          <h2>{AUDIT_CENTER_ADMIN_BRAND}</h2>
          <p>
            Centralized append-only audit layer for payments, consultations, assignments,
            introductions, archives, permissions, exports, and notifications.
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

      <div className="audit-center-page__body">
        <AuditFilterCard filters={filters} onChange={setFilters} onReset={handleResetFilters} />
        <AuditSummaryCard summaries={bundle.summaries} />
        <ActivityTimelineCard
          events={bundle.timeline}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
        />
        <div className="audit-center-page__detail">
          {selectedEvent ? (
            <AuditEventCard event={selectedEvent} />
          ) : (
            <p className="audit-center-page__empty">Select an event to inspect full audit record.</p>
          )}
        </div>
      </div>

      <footer className="audit-center-page__foot">
        <p>Admin path: {AUDIT_CENTER_ADMIN_PATH}</p>
        <p>
          Route audit:{" "}
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => navigateToPath(ROUTE_AUDIT_ADMIN_PATH)}
          >
            {ROUTE_AUDIT_ADMIN_PATH}
          </button>
        </p>
        <p>
          Database audit:{" "}
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => navigateToPath(DATABASE_AUDIT_ADMIN_PATH)}
          >
            {DATABASE_AUDIT_ADMIN_PATH}
          </button>
        </p>
        <p>
          Permissions audit:{" "}
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => navigateToPath(PERMISSIONS_AUDIT_ADMIN_PATH)}
          >
            {PERMISSIONS_AUDIT_ADMIN_PATH}
          </button>
        </p>
        <p>
          Journey audit:{" "}
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => navigateToPath(JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH)}
          >
            {JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH}
          </button>
        </p>
        <p>Active filters: {bundle.activeFilters.length ? bundle.activeFilters.join(", ") : "none"}</p>
      </footer>
    </div>
  );
}
