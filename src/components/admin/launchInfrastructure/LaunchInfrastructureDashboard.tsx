import { useMemo, useState } from "react";
import { PRODUCTION_ENVIRONMENT_ADMIN_PATH } from "../../../constants/productionEnvironmentAdmin";
import {
  LAUNCH_INFRASTRUCTURE_ADMIN_PATH,
  LAUNCH_INFRASTRUCTURE_BRAND
} from "../../../constants/launchInfrastructureAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildLaunchInfrastructureVerification } from "../../../utils/launchInfrastructureEngine";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";
import { LaunchInfrastructureChecklist } from "./LaunchInfrastructureChecklist";
import { LaunchInfrastructureReportCard } from "./LaunchInfrastructureReportCard";

const STATUS_BADGE = {
  ready: "consistent",
  warning: "review",
  critical: "inconsistent"
} as const;

export function LaunchInfrastructureDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildLaunchInfrastructureVerification();
  }, [refreshKey]);

  return (
    <div className="institutional-page launch-infrastructure-page">
      <header className="institutional-page__head">
        <div>
          <h2>{LAUNCH_INFRASTRUCTURE_BRAND}</h2>
          <p>
            Verify every deployment artifact — Docker, SEO, PWA, deep links, Android App Links, Apple
            association, and service worker.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(PRODUCTION_ENVIRONMENT_ADMIN_PATH)}
          >
            Env audit
          </button>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Re-verify
          </button>
        </div>
      </header>

      <LaunchInfrastructureReportCard report={report} />

      <div className="institutional-page__body">
        <LaunchInfrastructureChecklist checklist={report.checklist} artifacts={report.artifacts} />

        <div className="institutional-page__column">
          <section className="institutional-card launch-infra-artifacts-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Artifact scores</h3>
              <p>Ready, warning, or critical per deployment surface.</p>
            </header>
            <ul className="institutional-card__list">
              {report.artifacts.map((artifact) => (
                <li key={artifact.id}>
                  <div className="institutional-card__row">
                    <strong>{artifact.label}</strong>
                    <InstitutionalStatusBadge status={STATUS_BADGE[artifact.status]} />
                    <span>{artifact.score}/100</span>
                  </div>
                  <p>{artifact.summary}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card launch-infra-fixes-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Fixes applied</h3>
              <p>Safe infrastructure corrections in this verification pass.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.fixesApplied.map((fix) => (
                <li key={fix}>{fix}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <footer className="institutional-page__foot">
        <span>Route: {LAUNCH_INFRASTRUCTURE_ADMIN_PATH}</span>
        <span>See LAUNCH_INFRASTRUCTURE_REPORT.md in repository root</span>
      </footer>
    </div>
  );
}
