import { useMemo, useState } from "react";
import { LAUNCH_ISSUE_SEVERITY_LABELS } from "../../../constants/launchCertification";
import {
  LAUNCH_CERTIFICATION_ADMIN_PATH,
  LAUNCH_CERTIFICATION_BRAND
} from "../../../constants/launchCertificationAdmin";
import { INSTITUTIONAL_READINESS_ADMIN_PATH } from "../../../constants/institutionalReadinessAdmin";
import { LAUNCH_READINESS_ADMIN_PATH } from "../../../constants/launchReadiness";
import { navigateToPath } from "../../../constants/routes";
import { buildInstitutionalLaunchCertification } from "../../../utils/launchCertificationEngine";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";
import { LaunchCertificationChecklist } from "./LaunchCertificationChecklist";
import { LaunchCertificationReportCard } from "./LaunchCertificationReportCard";

export function LaunchCertificationDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildInstitutionalLaunchCertification();
  }, [refreshKey]);

  return (
    <div className="institutional-page launch-certification-page">
      <header className="institutional-page__head">
        <div>
          <h2>{LAUNCH_CERTIFICATION_BRAND}</h2>
          <p>
            Final launch certification — verify, repair, consolidate, and certify every subsystem.
            No new features. Assume BamSignal launches tomorrow.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(LAUNCH_READINESS_ADMIN_PATH)}
          >
            Launch readiness
          </button>
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(INSTITUTIONAL_READINESS_ADMIN_PATH)}
          >
            Readiness engine
          </button>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Re-certify
          </button>
        </div>
      </header>

      <LaunchCertificationReportCard report={report} />

      <div className="institutional-page__body">
        <LaunchCertificationChecklist checks={report.consolidationChecks} />

        <div className="institutional-page__column">
          <section className="institutional-card launch-subsystems-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Subsystem scores</h3>
              <p>Every certified domain — routing through iOS.</p>
            </header>
            <ul className="institutional-card__list">
              {report.subsystems.map((subsystem) => (
                <li key={subsystem.id}>
                  <div className="institutional-card__row">
                    <strong>{subsystem.label}</strong>
                    <InstitutionalStatusBadge
                      status={
                        subsystem.status === "certified"
                          ? "consistent"
                          : subsystem.status === "conditional"
                            ? "review"
                            : "inconsistent"
                      }
                    />
                    <span>{subsystem.score}/100</span>
                  </div>
                  <p>{subsystem.summary}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card launch-issues-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Critical blockers &amp; warnings</h3>
              <p>Issues that affect launch decision.</p>
            </header>
            <ul className="institutional-card__list">
              {[...report.criticalBlockers, ...report.warnings, ...report.minorIssues].map((issue) => (
                <li key={issue.id}>
                  <div className="institutional-card__row">
                    <strong>{issue.title}</strong>
                    <span className={`launch-issue-badge launch-issue-badge--${issue.severity}`}>
                      {LAUNCH_ISSUE_SEVERITY_LABELS[issue.severity]}
                    </span>
                  </div>
                  <p>{issue.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card launch-recommendations-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Recommendations</h3>
              <p>Actions before tomorrow&apos;s launch window.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.recommendations.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong> — {item.detail}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <footer className="institutional-page__foot">
        <span>Route: {LAUNCH_CERTIFICATION_ADMIN_PATH}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
