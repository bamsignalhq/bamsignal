import { useMemo, useState } from "react";
import {
  RELIABILITY_CERTIFICATION_ADMIN_PATH,
  RELIABILITY_CERTIFICATION_BRAND
} from "../../../constants/reliabilityCertificationAdmin";
import { DISASTER_RECOVERY_ADMIN_PATH } from "../../../constants/disasterRecoveryAdmin";
import { SYSTEM_HEALTH_ADMIN_PATH } from "../../../constants/systemHealthAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildReliabilityCertificationBundle } from "../../../utils/reliabilityCertificationEngine";
import { ReliabilityCertificationReportCard } from "./ReliabilityCertificationReportCard";
import { ReliabilityScenarioList } from "./ReliabilityScenarioList";

export function ReliabilityCertificationDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildReliabilityCertificationBundle();
  }, [refreshKey]);

  return (
    <div className="institutional-page reliability-certification-page">
      <header className="institutional-page__head">
        <div>
          <h2>{RELIABILITY_CERTIFICATION_BRAND}</h2>
          <p>
            Prove the platform survives failure. Run{" "}
            <code>npm run certify:reliability</code> before every release candidate.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(SYSTEM_HEALTH_ADMIN_PATH)}
          >
            System health
          </button>
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(DISASTER_RECOVERY_ADMIN_PATH)}
          >
            Disaster recovery
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

      <ReliabilityCertificationReportCard report={report} />

      <div className="institutional-page__body">
        <ReliabilityScenarioList scenarios={report.scenarios} />

        <div className="institutional-page__column">
          <section className="institutional-card reliability-recommendations-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Recommendations</h3>
              <p>Actions when certification fails or recovery regresses.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.recommendations.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong> — {item.detail}
                </li>
              ))}
            </ul>
          </section>

          {report.recoveryFailures.length > 0 && (
            <section className="institutional-card reliability-failures-card concierge-consultant-card--glass cc-reveal">
              <header className="institutional-card__head">
                <h3>Recovery failures</h3>
                <p>Release blocked until resolved.</p>
              </header>
              <ul className="institutional-card__fixes">
                {report.recoveryFailures.map((failure) => (
                  <li key={failure}>{failure}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <footer className="institutional-page__foot">
        <span>Route: {RELIABILITY_CERTIFICATION_ADMIN_PATH}</span>
        <span>Run ID: {report.runId}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
