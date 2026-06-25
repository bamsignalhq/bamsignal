import { useMemo, useState } from "react";
import { LAUNCH_CERTIFICATION_ADMIN_PATH } from "../../../constants/launchCertificationAdmin";
import {
  FOUNDER_ACCEPTANCE_ADMIN_PATH,
  FOUNDER_ACCEPTANCE_BRAND
} from "../../../constants/founderAcceptanceAdmin";
import { FAT_GO_LABELS } from "../../../constants/founderAcceptance";
import { navigateToPath } from "../../../constants/routes";
import { buildFounderAcceptanceVerification } from "../../../utils/founderAcceptanceEngine";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";
import { FounderAcceptanceChecklist } from "./FounderAcceptanceChecklist";
import { FounderAcceptanceReportCard } from "./FounderAcceptanceReportCard";

const SEVERITY_BADGE = {
  passed: "consistent",
  warning: "review",
  critical: "inconsistent"
} as const;

export function FounderAcceptanceDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildFounderAcceptanceVerification();
  }, [refreshKey]);

  return (
    <div className="institutional-page founder-acceptance-page">
      <header className="institutional-page__head">
        <div>
          <h2>{FOUNDER_ACCEPTANCE_BRAND}</h2>
          <p>
            Launch-tomorrow acceptance — guest through super admin, every button, form, payment, and
            permission surface.
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
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Re-run FAT
          </button>
        </div>
      </header>

      <FounderAcceptanceReportCard report={report} />

      <div className="institutional-page__body">
        <FounderAcceptanceChecklist checklist={report.checklist} personas={report.personas} />

        <div className="institutional-page__column">
          <section className="institutional-card fat-workflows-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Workflow status</h3>
              <p>Passed, warning, or critical per major product workflow.</p>
            </header>
            <ul className="institutional-card__list">
              {report.workflows.map((workflow) => (
                <li key={workflow.id}>
                  <div className="institutional-card__row">
                    <strong>{workflow.label}</strong>
                    <InstitutionalStatusBadge status={SEVERITY_BADGE[workflow.status]} />
                    <span>{workflow.score}/100</span>
                  </div>
                  <p>{workflow.summary}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card fat-issues-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Warnings</h3>
              <p>Conditions to resolve before or shortly after launch.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.warnings.map((issue) => (
                <li key={issue.id}>{issue.detail}</li>
              ))}
            </ul>
          </section>

          <section className="institutional-card fat-decision-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Go / No-Go</h3>
              <p>{FAT_GO_LABELS[report.goDecision]}</p>
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
        <span>Route: {FOUNDER_ACCEPTANCE_ADMIN_PATH}</span>
        <span>See FOUNDER_ACCEPTANCE_REPORT.md · npm run test:founder-acceptance</span>
      </footer>
    </div>
  );
}
