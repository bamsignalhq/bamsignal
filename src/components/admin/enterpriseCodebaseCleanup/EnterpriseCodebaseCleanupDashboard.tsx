import { useMemo, useState } from "react";
import { LAUNCH_CERTIFICATION_ADMIN_PATH } from "../../../constants/launchCertificationAdmin";
import {
  ENTERPRISE_CODEBASE_CLEANUP_ADMIN_PATH,
  ENTERPRISE_CODEBASE_CLEANUP_BRAND
} from "../../../constants/enterpriseCodebaseCleanupAdmin";
import { UX_CONSISTENCY_ADMIN_PATH } from "../../../constants/uxConsistencyAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildEnterpriseCodebaseCleanup } from "../../../utils/enterpriseCodebaseCleanupEngine";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";
import { EnterpriseCleanupChecklist } from "./EnterpriseCleanupChecklist";
import { EngineeringHealthReportCard } from "./EngineeringHealthReportCard";

const DOMAIN_STATUS_BADGE: Record<
  "healthy" | "review" | "debt",
  "consistent" | "review" | "inconsistent"
> = {
  healthy: "consistent",
  review: "review",
  debt: "inconsistent"
};

export function EnterpriseCodebaseCleanupDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildEnterpriseCodebaseCleanup();
  }, [refreshKey]);

  return (
    <div className="institutional-page enterprise-codebase-cleanup-page">
      <header className="institutional-page__head">
        <div>
          <h2>{ENTERPRISE_CODEBASE_CLEANUP_BRAND}</h2>
          <p>
            Complete engineering health pass — unused files, dead components, duplicate logic, and
            standardization without functionality or UI changes.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(UX_CONSISTENCY_ADMIN_PATH)}
          >
            UX audit
          </button>
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
            Re-audit
          </button>
        </div>
      </header>

      <EngineeringHealthReportCard report={report} />

      <div className="institutional-page__body">
        <EnterpriseCleanupChecklist checklist={report.checklist} domains={report.domains} />

        <div className="institutional-page__column">
          <section className="institutional-card enterprise-duplicates-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Duplicate logic inventory</h3>
              <p>Parallel implementations documented — removed or scheduled for safe consolidation.</p>
            </header>
            <ul className="institutional-card__list">
              {report.duplicates.map((item) => (
                <li key={item.id}>
                  <div className="institutional-card__row">
                    <strong>{item.label}</strong>
                    <InstitutionalStatusBadge status={DOMAIN_STATUS_BADGE[item.status]} />
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

          <section className="institutional-card enterprise-removed-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Files removed</h3>
              <p>Dead code eliminated in this cleanup pass.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.removedFiles.map((file) => (
                <li key={file}>{file}</li>
              ))}
            </ul>
          </section>

          <section className="institutional-card enterprise-standardization-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Standardization targets</h3>
              <p>Folder structure, naming, imports, and file conventions.</p>
            </header>
            <ul className="institutional-card__fixes">
              {report.standardizationTargets.map((target) => (
                <li key={target}>{target}</li>
              ))}
            </ul>
          </section>

          <section className="institutional-card enterprise-fixes-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Applied fixes</h3>
              <p>Safe refactors deployed — no functionality or member UI changes.</p>
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
        <span>Route: {ENTERPRISE_CODEBASE_CLEANUP_ADMIN_PATH}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
