import { useMemo, useState } from "react";
import {
  SECURITY_CERTIFICATION_ADMIN_PATH,
  SECURITY_CERTIFICATION_BRAND
} from "../../../constants/securityCertificationAdmin";
import { PRODUCTION_SECURITY_ADMIN_PATH } from "../../../constants/productionSecurityAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildSecurityCertificationBundle } from "../../../utils/securityCertificationEngine";
import { SecurityCertificationFindingsList } from "./SecurityCertificationFindingsList";
import { SecurityCertificationReportCard } from "./SecurityCertificationReportCard";

export function SecurityCertificationDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildSecurityCertificationBundle();
  }, [refreshKey]);

  return (
    <div className="institutional-page security-certification-page">
      <header className="institutional-page__head">
        <div>
          <h2>{SECURITY_CERTIFICATION_BRAND}</h2>
          <p>
            Verify every production build against BamSignal&apos;s security baseline. Run{" "}
            <code>npm run certify:security</code> before every release candidate.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(PRODUCTION_SECURITY_ADMIN_PATH)}
          >
            Security dashboard
          </button>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Refresh report
          </button>
        </div>
      </header>

      <SecurityCertificationReportCard report={report} />

      <div className="institutional-page__body">
        <SecurityCertificationFindingsList findings={report.findings} />

        <div className="institutional-page__column">
          <section className="institutional-card security-recommendations-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Recommendations</h3>
              <p>Actions when certification fails or regresses.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.recommendations.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong> — {item.detail}
                </li>
              ))}
            </ul>
          </section>

          {report.failures.length > 0 && (
            <section className="institutional-card security-failures-card concierge-consultant-card--glass cc-reveal">
              <header className="institutional-card__head">
                <h3>Release blockers</h3>
                <p>Critical and high findings block release.</p>
              </header>
              <ul className="institutional-card__fixes">
                {report.failures.map((failure) => (
                  <li key={failure}>{failure}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <footer className="institutional-page__foot">
        <span>Route: {SECURITY_CERTIFICATION_ADMIN_PATH}</span>
        <span>Run ID: {report.runId}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
