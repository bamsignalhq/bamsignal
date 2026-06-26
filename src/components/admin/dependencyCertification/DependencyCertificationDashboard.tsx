import { useMemo, useState } from "react";
import {
  DEPENDENCY_CERTIFICATION_ADMIN_PATH,
  DEPENDENCY_CERTIFICATION_BRAND
} from "../../../constants/dependencyCertificationAdmin";
import { PRODUCTION_SECURITY_ADMIN_PATH } from "../../../constants/productionSecurityAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildDependencyCertificationBundle } from "../../../utils/dependencyCertificationEngine";
import { DependencyCertificationFindingsList } from "./DependencyCertificationFindingsList";
import { DependencyCertificationReportCard } from "./DependencyCertificationReportCard";

export function DependencyCertificationDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildDependencyCertificationBundle();
  }, [refreshKey]);

  return (
    <div className="institutional-page dependency-certification-page">
      <header className="institutional-page__head">
        <div>
          <h2>{DEPENDENCY_CERTIFICATION_BRAND}</h2>
          <p>
            Certify every dependency in the BamSignal supply chain. Run{" "}
            <code>npm run certify:dependencies</code> before every release candidate.
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

      <DependencyCertificationReportCard report={report} />

      <div className="institutional-page__body">
        <DependencyCertificationFindingsList findings={report.findings} />

        <div className="institutional-page__column">
          <section className="institutional-card dependency-recommendations-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Upgrade candidates</h3>
              <p>Packages with newer releases available.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.upgradeCandidates.slice(0, 10).map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong> — {item.current} → {item.latest}
                  {item.majorDrift ? " (major)" : ""}
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card dependency-unused-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Unused dependencies</h3>
              <p>Declared packages not found in static import scan.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.unusedDependencies.length ? (
                report.unusedDependencies.slice(0, 12).map((item) => <li key={item}>{item}</li>)
              ) : (
                <li>No unused dependencies flagged.</li>
              )}
            </ul>
          </section>

          {report.failures.length > 0 && (
            <section className="institutional-card dependency-failures-card concierge-consultant-card--glass cc-reveal">
              <header className="institutional-card__head">
                <h3>Release blockers</h3>
                <p>Critical dependency vulnerabilities block release.</p>
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
        <span>Route: {DEPENDENCY_CERTIFICATION_ADMIN_PATH}</span>
        <span>Run ID: {report.runId}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
