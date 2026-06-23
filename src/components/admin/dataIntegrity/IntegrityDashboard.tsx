import { useMemo, useState } from "react";
import {
  DATA_INTEGRITY_ADMIN_PATH,
  DATA_INTEGRITY_BRAND
} from "../../../constants/dataIntegrityAdmin";
import {
  DATA_INTEGRITY_CHECKS,
  INTEGRITY_STATUS_LABELS
} from "../../../constants/dataIntegrity";
import { JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH } from "../../../constants/journeyIntegrityAudit";
import { navigateToPath } from "../../../constants/routes";
import type { DataIntegrityCheckId, IntegrityStatusId } from "../../../types/dataIntegrity";
import { buildDataIntegrityBundle } from "../../../utils/dataIntegrityEngine";
import { IntegrityIssueCard } from "./IntegrityIssueCard";
import { IntegritySummaryCard } from "./IntegritySummaryCard";

export function IntegrityDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState<IntegrityStatusId | "all">("all");
  const [checkFilter, setCheckFilter] = useState<DataIntegrityCheckId | "all">("all");

  const bundle = useMemo(() => {
    void refreshKey;
    return buildDataIntegrityBundle();
  }, [refreshKey]);

  const filteredChecks = useMemo(() => {
    return bundle.checks.filter((check) => {
      if (statusFilter !== "all" && check.status !== statusFilter) return false;
      if (checkFilter !== "all" && check.id !== checkFilter) return false;
      return true;
    });
  }, [bundle.checks, checkFilter, statusFilter]);

  return (
    <div className="data-integrity-page">
      <header className="data-integrity-page__head">
        <div>
          <h2>{DATA_INTEGRITY_BRAND}</h2>
          <p>
            Verify institutional consistency continuously — Journey IDs, Consultant Assignments,
            Introductions, Follow-Ups, Archives, Legacy Profiles, Payments, Meetings, and
            Notifications.
          </p>
        </div>
        <div className="data-integrity-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(JOURNEY_INTEGRITY_AUDIT_ADMIN_PATH)}
          >
            Journey audit
          </button>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Re-verify
          </button>
        </div>
      </header>

      <IntegritySummaryCard
        summary={bundle.summary}
        generatedAt={bundle.generatedAt}
        checkCount={bundle.checks.length}
      />

      <div className="data-integrity-page__filters">
        <label className="data-integrity-filter">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as IntegrityStatusId | "all")}
          >
            <option value="all">All statuses</option>
            {Object.entries(INTEGRITY_STATUS_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="data-integrity-filter">
          <span>Check</span>
          <select
            value={checkFilter}
            onChange={(event) => setCheckFilter(event.target.value as DataIntegrityCheckId | "all")}
          >
            <option value="all">All checks</option>
            {DATA_INTEGRITY_CHECKS.map((check) => (
              <option key={check.id} value={check.id}>
                {check.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="data-integrity-page__checks">
        <header className="data-integrity-page__checks-head">
          <h3>Integrity checks ({filteredChecks.length})</h3>
          <p>Live verification against concierge stores and operational registries.</p>
        </header>
        <div className="data-integrity-page__checks-grid">
          {filteredChecks.length ? (
            filteredChecks.map((check) => <IntegrityIssueCard key={check.id} check={check} />)
          ) : (
            <p className="data-integrity-page__empty">No checks match the current filters.</p>
          )}
        </div>
      </section>

      <footer className="data-integrity-page__foot">
        <p>Admin path: {DATA_INTEGRITY_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
