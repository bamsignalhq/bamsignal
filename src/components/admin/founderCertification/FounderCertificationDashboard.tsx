import { useMemo, useState } from "react";
import {
  FOUNDER_CERTIFICATION_ADMIN_PATH,
  FOUNDER_CERTIFICATION_BRAND
} from "../../../constants/founderCertificationAdmin";
import { LAUNCH_CERTIFICATION_ADMIN_PATH } from "../../../constants/launchCertificationAdmin";
import { FOUNDER_ACCEPTANCE_ADMIN_PATH } from "../../../constants/founderAcceptanceAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildFounderCertificationBundle } from "../../../utils/founderCertificationEngine";
import { FounderCertificationReportCard } from "./FounderCertificationReportCard";
import { FounderSubsystemScoreList } from "./FounderSubsystemScoreList";

export function FounderCertificationDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildFounderCertificationBundle();
  }, [refreshKey]);

  return (
    <div className="institutional-page founder-certification-page">
      <header className="institutional-page__head">
        <div>
          <h2>{FOUNDER_CERTIFICATION_BRAND}</h2>
          <p>
            Final launch certification combining every subsystem. Run{" "}
            <code>npm run certify:founder</code> for the authoritative GO decision.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(LAUNCH_CERTIFICATION_ADMIN_PATH)}
          >
            Launch cert
          </button>
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(FOUNDER_ACCEPTANCE_ADMIN_PATH)}
          >
            Founder acceptance
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

      <FounderCertificationReportCard report={report} />

      <div className="institutional-page__body">
        <FounderSubsystemScoreList scores={report.subsystemScores} />

        <div className="institutional-page__column">
          <section className="institutional-card founder-issues-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Critical issues</h3>
              <p>Blockers that force NO GO.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.criticalIssues.length > 0 ? (
                report.criticalIssues.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong> — {item.detail}
                  </li>
                ))
              ) : (
                <li>No critical blockers on record.</li>
              )}
            </ul>
          </section>

          <section className="institutional-card founder-warnings-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Warnings</h3>
              <p>Conditions tracked for GO WITH CONDITIONS.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.warnings.length > 0 ? (
                report.warnings.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong> — {item.detail}
                  </li>
                ))
              ) : (
                <li>No warnings on record.</li>
              )}
            </ul>
          </section>

          <section className="institutional-card founder-resolved-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Resolved since last release</h3>
            </header>
            <ul className="institutional-card__fixes">
              {report.resolvedSinceLastRelease.length > 0 ? (
                report.resolvedSinceLastRelease.map((item) => <li key={item}>{item}</li>)
              ) : (
                <li>No resolved items vs previous certification.</li>
              )}
            </ul>
          </section>

          {report.exports.json && (
            <section className="institutional-card founder-exports-card concierge-consultant-card--glass cc-reveal">
              <header className="institutional-card__head">
                <h3>Exports</h3>
                <p>Founder PDF, board PDF, JSON, and Markdown from latest CLI run.</p>
              </header>
              <ul className="institutional-card__fixes">
                <li>JSON — certification/founder/reports/latest.json</li>
                <li>Markdown — founder-cert markdown report</li>
                <li>Founder PDF — print-ready HTML export</li>
                <li>Board PDF — board brief HTML export</li>
              </ul>
            </section>
          )}
        </div>
      </div>

      <footer className="institutional-page__foot">
        <span>Route: {FOUNDER_CERTIFICATION_ADMIN_PATH}</span>
        <span>Run ID: {report.runId}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
