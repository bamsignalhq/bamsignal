import { useMemo, useState } from "react";
import {
  PERFORMANCE_CERTIFICATION_ADMIN_PATH,
  PERFORMANCE_CERTIFICATION_BRAND
} from "../../../constants/performanceCertificationAdmin";
import { PERFORMANCE_CENTER_ADMIN_PATH } from "../../../constants/performanceCenterAdmin";
import { PRODUCTION_PERFORMANCE_ADMIN_PATH } from "../../../constants/productionPerformanceAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildPerformanceCertificationBundle } from "../../../utils/performanceCertificationEngine";
import { PerformanceCertificationReportCard } from "./PerformanceCertificationReportCard";
import { PerformanceRegressionList } from "./PerformanceRegressionList";

export function PerformanceCertificationDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildPerformanceCertificationBundle();
  }, [refreshKey]);

  return (
    <div className="institutional-page performance-certification-page">
      <header className="institutional-page__head">
        <div>
          <h2>{PERFORMANCE_CERTIFICATION_BRAND}</h2>
          <p>
            Measure, compare, and certify release performance. Run{" "}
            <code>npm run certify:performance</code> before every release candidate.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(PERFORMANCE_CENTER_ADMIN_PATH)}
          >
            Performance center
          </button>
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(PRODUCTION_PERFORMANCE_ADMIN_PATH)}
          >
            Perf optimize
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

      <PerformanceCertificationReportCard report={report} />

      <div className="institutional-page__body">
        <PerformanceRegressionList regressions={report.regressions} />

        <div className="institutional-page__column">
          <section className="institutional-card performance-compare-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Trend comparison</h3>
              <p>Previous release, 30 days, 90 days, lifetime.</p>
            </header>
            <ul className="institutional-card__list">
              {report.comparisons.map((item) => (
                <li key={item.windowId}>
                  <div className="institutional-card__row">
                    <strong>{item.windowLabel}</strong>
                    <span>
                      {item.deltaPercent == null ? "—" : `${item.deltaPercent > 0 ? "+" : ""}${item.deltaPercent}%`}
                    </span>
                  </div>
                  <p>
                    {item.baselineAt
                      ? `Baseline score ${item.score}% · ${new Date(item.baselineAt).toLocaleDateString()}`
                      : "No baseline snapshot"}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card performance-recommendations-card concierge-consultant-card--glass cc-reveal">
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
            <section className="institutional-card performance-failures-card concierge-consultant-card--glass cc-reveal">
              <header className="institutional-card__head">
                <h3>Failures</h3>
                <p>Release blocked until resolved.</p>
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
        <span>Route: {PERFORMANCE_CERTIFICATION_ADMIN_PATH}</span>
        <span>Run ID: {report.runId}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
