import { useMemo, useState } from "react";
import { PERMISSIONS_AUDIT_ADMIN_PATH } from "../../../constants/permissionsAudit";
import { SECURITY_STATUS_LABELS } from "../../../constants/productionSecurity";
import {
  PRODUCTION_SECURITY_ADMIN_PATH,
  PRODUCTION_SECURITY_BRAND
} from "../../../constants/productionSecurityAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildProductionSecurityReport } from "../../../utils/productionSecurityEngine";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";
import { SecurityChecklist } from "./SecurityChecklist";
import { SecurityHealthReportCard } from "./SecurityHealthReportCard";

export function SecurityDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildProductionSecurityReport();
  }, [refreshKey]);

  return (
    <div className="institutional-page production-security-page">
      <header className="institutional-page__head">
        <div>
          <h2>{PRODUCTION_SECURITY_BRAND}</h2>
          <p>
            Production security hardening — authentication, authorization, RLS, sessions, secrets,
            headers, rate limiting, validation, and route verification without architecture redesign.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(PERMISSIONS_AUDIT_ADMIN_PATH)}
          >
            Permissions audit
          </button>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Re-scan
          </button>
        </div>
      </header>

      <SecurityHealthReportCard report={report} />

      <div className="institutional-page__body">
        <SecurityChecklist checklist={report.checklist} domains={report.domains} />

        <div className="institutional-page__column">
          <section className="institutional-card route-verification-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Route verification</h3>
              <p>Admin, consultant, member, operations, executive, Supabase, and storage access.</p>
            </header>
            <ul className="institutional-card__list">
              {report.routeVerifications.map((zone) => (
                <li key={zone.id}>
                  <div className="institutional-card__row">
                    <strong>{zone.label}</strong>
                    <InstitutionalStatusBadge
                      status={zone.status}
                      label={SECURITY_STATUS_LABELS[zone.status]}
                    />
                  </div>
                  <p>{zone.summary}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card hardened-fixes-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Applied hardening fixes</h3>
              <p>Safe production improvements deployed in this pass.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.hardenedFixes.map((fix) => (
                <li key={fix}>{fix}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <footer className="institutional-page__foot">
        <span>Route: {PRODUCTION_SECURITY_ADMIN_PATH}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
