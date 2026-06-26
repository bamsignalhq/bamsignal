import { useMemo, useState } from "react";
import {
  DRIFT_CERTIFICATION_ADMIN_PATH,
  DRIFT_CERTIFICATION_BRAND
} from "../../../constants/driftCertificationAdmin";
import { PRODUCTION_ENVIRONMENT_ADMIN_PATH } from "../../../constants/productionEnvironmentAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildDriftCertificationBundle } from "../../../utils/driftCertificationEngine";
import { DriftCertificationFindingsList } from "./DriftCertificationFindingsList";
import { DriftCertificationReportCard } from "./DriftCertificationReportCard";

export function DriftCertificationDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildDriftCertificationBundle();
  }, [refreshKey]);

  return (
    <div className="institutional-page drift-certification-page">
      <header className="institutional-page__head">
        <div>
          <h2>{DRIFT_CERTIFICATION_BRAND}</h2>
          <p>
            Detect silent configuration drift across BamSignal. Run{" "}
            <code>npm run certify:drift</code> before every release candidate.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(PRODUCTION_ENVIRONMENT_ADMIN_PATH)}
          >
            Environment audit
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

      <DriftCertificationReportCard report={report} />

      <div className="institutional-page__body">
        <DriftCertificationFindingsList findings={report.findings} />

        <div className="institutional-page__column">
          <section className="institutional-card drift-recommendations-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Recommendations</h3>
              <p>Remediate drift before release.</p>
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
            <section className="institutional-card drift-failures-card concierge-consultant-card--glass cc-reveal">
              <header className="institutional-card__head">
                <h3>Release blockers</h3>
                <p>Critical configuration drift blocks release.</p>
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
        <span>Route: {DRIFT_CERTIFICATION_ADMIN_PATH}</span>
        <span>Run ID: {report.runId}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
