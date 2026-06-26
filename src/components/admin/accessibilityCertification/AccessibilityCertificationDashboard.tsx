import { useMemo, useState } from "react";
import {
  ACCESSIBILITY_CERTIFICATION_ADMIN_PATH,
  ACCESSIBILITY_CERTIFICATION_BRAND
} from "../../../constants/accessibilityCertificationAdmin";
import { UX_CONSISTENCY_ADMIN_PATH } from "../../../constants/uxConsistencyAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildAccessibilityCertificationBundle } from "../../../utils/accessibilityCertificationEngine";
import { AccessibilityCertificationFindingsList } from "./AccessibilityCertificationFindingsList";
import { AccessibilityCertificationReportCard } from "./AccessibilityCertificationReportCard";

export function AccessibilityCertificationDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildAccessibilityCertificationBundle();
  }, [refreshKey]);

  return (
    <div className="institutional-page accessibility-certification-page">
      <header className="institutional-page__head">
        <div>
          <h2>{ACCESSIBILITY_CERTIFICATION_BRAND}</h2>
          <p>
            Verify keyboard navigation, ARIA, contrast, screen readers, touch targets, and modal
            semantics. Run <code>npm run certify:accessibility</code> before every release
            candidate.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(UX_CONSISTENCY_ADMIN_PATH)}
          >
            UX consistency
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

      <AccessibilityCertificationReportCard report={report} />

      <div className="institutional-page__body">
        <AccessibilityCertificationFindingsList findings={report.findings} />

        <div className="institutional-page__column">
          <section className="institutional-card accessibility-domains-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Domain scores</h3>
              <p>Ten verified accessibility domains for member surfaces.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.domains.length ? (
                report.domains.map((item) => (
                  <li key={item.id}>
                    <strong>{item.label}</strong> — {item.score}% ({item.openCount} open)
                  </li>
                ))
              ) : (
                <li>No domain snapshot — run certification CLI.</li>
              )}
            </ul>
          </section>

          <section className="institutional-card accessibility-recommendations-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Recommendations</h3>
              <p>Prioritized fixes from the latest certification run.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.recommendations.length ? (
                report.recommendations.slice(0, 12).map((item) => (
                  <li key={item.id}>
                    <strong>[{item.priority}]</strong> {item.title} — {item.detail}
                  </li>
                ))
              ) : (
                <li>No recommendations in snapshot.</li>
              )}
            </ul>
          </section>

          {report.failures.length > 0 && (
            <section className="institutional-card accessibility-failures-card concierge-consultant-card--glass cc-reveal">
              <header className="institutional-card__head">
                <h3>Release blockers</h3>
                <p>Critical accessibility failures block release.</p>
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
        <span>Route: {ACCESSIBILITY_CERTIFICATION_ADMIN_PATH}</span>
        <span>Run ID: {report.runId}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
