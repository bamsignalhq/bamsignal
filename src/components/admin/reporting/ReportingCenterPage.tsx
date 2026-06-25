import { useMemo, useState } from "react";
import {
  REPORT_CATEGORIES,
  REPORTING_FUTURE_ARCHITECTURE
} from "../../../constants/reportingCenter";
import {
  REPORTING_CENTER_ADMIN_BRAND,
  REPORTING_CENTER_ADMIN_PATH
} from "../../../constants/reportingCenterAdmin";
import type { ReportCategoryId } from "../../../constants/reportingCenter";
import { buildReportingCenterBundle } from "../../../utils/reportingCenterEngine";
import { ExportHistoryCard } from "./ExportHistoryCard";
import { ReportBuilderCard } from "./ReportBuilderCard";
import { ReportCard } from "./ReportCard";
import { ReportSummaryCard } from "./ReportSummaryCard";
import { ScheduledReportCard } from "./ScheduledReportCard";

export function ReportingCenterPage() {
  const [categoryFilter, setCategoryFilter] = useState<ReportCategoryId | "all">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildReportingCenterBundle(categoryFilter);
  }, [categoryFilter, refreshKey]);

  const showOverview = categoryFilter === "all";

  return (
    <div className="reporting-center-page">
      <header className="reporting-center-page__head">
        <div>
          <h2>{REPORTING_CENTER_ADMIN_BRAND}</h2>
          <p>
            Institutional reporting — operational dashboards show live information while exports
            and scheduled delivery preserve institutional knowledge over time.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <nav className="reporting-center-page__filters" aria-label="Report category filters">
        <button
          type="button"
          className={`reporting-center-page__filter-btn${categoryFilter === "all" ? " is-active" : ""}`}
          onClick={() => setCategoryFilter("all")}
        >
          All
        </button>
        {REPORT_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`reporting-center-page__filter-btn${
              categoryFilter === category.id ? " is-active" : ""
            }`}
            onClick={() => setCategoryFilter(category.id)}
          >
            {category.label.replace(" Reports", "")}
          </button>
        ))}
      </nav>

      {showOverview ? <ReportSummaryCard summary={bundle.summary} /> : null}

      <div className="reporting-center-page__body">
        <div className="reporting-center-page__column">
          <ReportCard reports={bundle.reports} />
          <ReportBuilderCard filterPresets={bundle.filterPresets} />
        </div>
        <div className="reporting-center-page__column">
          <ScheduledReportCard schedules={bundle.schedules} />
          <ExportHistoryCard exports={bundle.exports} />
        </div>
      </div>

      <footer className="reporting-center-page__future">
        <h4>Future architecture (documented only)</h4>
        <p>{REPORTING_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {REPORTING_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
