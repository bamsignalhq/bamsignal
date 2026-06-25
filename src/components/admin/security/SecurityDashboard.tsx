import { useMemo, useState } from "react";
import { PERMISSIONS_AUDIT_ADMIN_PATH } from "../../../constants/permissionsAudit";
import {
  PRODUCTION_SECURITY_ADMIN_PATH,
  PRODUCTION_SECURITY_BRAND
} from "../../../constants/productionSecurityAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildProductionSecurityReport } from "../../../utils/productionSecurityEngine";
import { SecurityChecklist } from "./SecurityChecklist";
import { SecurityHealthReportCard } from "./SecurityHealthReportCard";

export function SecurityDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildProductionSecurityReport();
  }, [refreshKey]);

  return (
    <div className="production-security-page">
      <header className="production-security-page__head">
        <div>
          <h2>{PRODUCTION_SECURITY_BRAND}</h2>
          <p>
            Production security hardening — authentication, authorization, RLS, sessions, secrets,
            headers, rate limiting, validation, and route verification without architecture redesign.
          </p>
        </div>
        <div className="production-security-page__actions">
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

      <div className="production-security-page__body">
        <SecurityChecklist checklist={report.checklist} domains={report.domains} />

        <div className="production-security-page__column">
          <section className="production-security-card route-verification-card concierge-consultant-card--glass cc-reveal">
            <header className="production-security-card__head">
              <h3>Route verification</h3>
              <p>Admin, consultant, member, operations, executive, Supabase, and storage access.</p>
            </header>
            <ul className="production-security-card__list">
              {report.routeVerifications.map((zone) => (
                <li key={zone.id}>
                  <div className="production-security-card__row">
                    <strong>{zone.label}</strong>
                    <span className={`security-status-badge security-status-badge--${zone.status}`}>
                      {zone.status}
                    </span>
                  </div>
                  <p>{zone.summary}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="production-security-card hardened-fixes-card concierge-consultant-card--glass cc-reveal">
            <header className="production-security-card__head">
              <h3>Applied hardening fixes</h3>
              <p>Safe production improvements deployed in this pass.</p>
            </header>
            <ul className="production-security-card__fixes">
              {report.hardenedFixes.map((fix) => (
                <li key={fix}>{fix}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <footer className="production-security-page__foot">
        <span>Route: {PRODUCTION_SECURITY_ADMIN_PATH}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
