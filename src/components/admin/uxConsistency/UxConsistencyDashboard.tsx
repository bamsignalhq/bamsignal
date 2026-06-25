import { useMemo, useState } from "react";
import { PRODUCTION_SECURITY_ADMIN_PATH } from "../../../constants/productionSecurityAdmin";
import {
  UX_CONSISTENCY_ADMIN_PATH,
  UX_CONSISTENCY_BRAND
} from "../../../constants/uxConsistencyAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildUxConsistencyAudit } from "../../../utils/uxConsistencyEngine";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";
import { UxConsistencyChecklist } from "./UxConsistencyChecklist";
import { UxConsistencyReportCard } from "./UxConsistencyReportCard";

export function UxConsistencyDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildUxConsistencyAudit();
  }, [refreshKey]);

  return (
    <div className="institutional-page ux-consistency-page">
      <header className="institutional-page__head">
        <div>
          <h2>{UX_CONSISTENCY_BRAND}</h2>
          <p>
            Every screen should feel like one institution built by one team — typography, spacing,
            buttons, cards, states, navigation, and theme consistency without member UI redesign.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(PRODUCTION_SECURITY_ADMIN_PATH)}
          >
            Security audit
          </button>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Re-scan
          </button>
        </div>
      </header>

      <UxConsistencyReportCard report={report} />

      <div className="institutional-page__body">
        <UxConsistencyChecklist checklist={report.checklist} domains={report.domains} />

        <div className="institutional-page__column">
          <section className="institutional-card ux-duplicates-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Duplicate components</h3>
              <p>Parallel implementations inventoried — removed or documented.</p>
            </header>
            <ul className="institutional-card__list">
              {report.duplicates.map((item) => (
                <li key={item.id}>
                  <div className="institutional-card__row">
                    <strong>{item.label}</strong>
                    <InstitutionalStatusBadge status={item.status} />
                  </div>
                  <p>{item.summary}</p>
                  <div className="institutional-card__meta">
                    {item.paths.map((path) => (
                      <span key={path}>{path}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card ux-standardization-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Standardization targets</h3>
              <p>Canonical tokens per surface — member UI remains locked.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.standardizationTargets.map((target) => (
                <li key={target}>{target}</li>
              ))}
            </ul>
          </section>

          <section className="institutional-card ux-fixes-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Applied fixes</h3>
              <p>Safe consistency improvements deployed in this pass.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.appliedFixes.map((fix) => (
                <li key={fix}>{fix}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <footer className="institutional-page__foot">
        <span>Route: {UX_CONSISTENCY_ADMIN_PATH}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
