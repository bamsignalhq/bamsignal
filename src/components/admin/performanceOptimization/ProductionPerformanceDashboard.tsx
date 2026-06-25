import { useMemo, useState } from "react";
import { PERFORMANCE_CENTER_ADMIN_PATH } from "../../../constants/performanceCenterAdmin";
import {
  PRODUCTION_PERFORMANCE_ADMIN_PATH,
  PRODUCTION_PERFORMANCE_BRAND
} from "../../../constants/productionPerformanceAdmin";
import { UX_CONSISTENCY_ADMIN_PATH } from "../../../constants/uxConsistencyAdmin";
import { navigateToPath } from "../../../constants/routes";
import { buildProductionPerformanceReport } from "../../../utils/productionPerformanceEngine";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";
import { PerformanceHealthReportCard } from "./PerformanceHealthReportCard";
import { PerformanceOptimizationChecklist } from "./PerformanceOptimizationChecklist";

export function ProductionPerformanceDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildProductionPerformanceReport();
  }, [refreshKey]);

  return (
    <div className="institutional-page production-performance-page">
      <header className="institutional-page__head">
        <div>
          <h2>{PRODUCTION_PERFORMANCE_BRAND}</h2>
          <p>
            Fast initial load, smooth navigation, minimal bundle — bundle size, code splitting, lazy
            loading, caching, queries, and duplicate request elimination without changing functionality.
          </p>
        </div>
        <div className="institutional-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(PERFORMANCE_CENTER_ADMIN_PATH)}
          >
            Capacity center
          </button>
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(UX_CONSISTENCY_ADMIN_PATH)}
          >
            UX audit
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

      <PerformanceHealthReportCard report={report} />

      <div className="institutional-page__body">
        <PerformanceOptimizationChecklist checklist={report.checklist} domains={report.domains} />

        <div className="institutional-page__column">
          <section className="institutional-card performance-targets-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Optimization targets</h3>
              <p>Large components, slow pages, heavy queries, and repeated fetches.</p>
            </header>
            <ul className="institutional-card__list">
              {report.optimizationTargets.map((target) => (
                <li key={target.id}>
                  <div className="institutional-card__row">
                    <strong>{target.label}</strong>
                    <InstitutionalStatusBadge status={target.status} />
                  </div>
                  <div className="institutional-card__meta">
                    <span>{target.surface}</span>
                  </div>
                  <p>{target.summary}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="institutional-card performance-fixes-card concierge-consultant-card--glass cc-reveal">
            <header className="institutional-card__head">
              <h3>Applied optimizations</h3>
              <p>Safe performance improvements deployed in this pass.</p>
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
        <span>Route: {PRODUCTION_PERFORMANCE_ADMIN_PATH}</span>
        <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
