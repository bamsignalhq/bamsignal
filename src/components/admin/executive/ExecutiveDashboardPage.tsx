import { useCallback, useMemo, useState } from "react";
import {
  EXECUTIVE_DASHBOARD_FUTURE_KINDS,
  EXECUTIVE_VIEWS,
  EXECUTIVE_VIEW_LABELS,
  type ExecutiveViewId
} from "../../../constants/executiveDashboard";
import {
  EXECUTIVE_DASHBOARD_ADMIN_BRAND,
  EXECUTIVE_DASHBOARD_ADMIN_PATH
} from "../../../constants/executiveDashboardAdmin";
import { buildExecutiveDashboard } from "../../../utils/executiveDashboardEngine";
import { CommunityOverviewCard } from "./CommunityOverviewCard";
import { ExecutiveMetricCard } from "./ExecutiveMetricCard";
import { GrowthTrendCard } from "./GrowthTrendCard";
import { InstitutionHealthCard } from "./InstitutionHealthCard";
import { LegacyGrowthCard } from "./LegacyGrowthCard";
import { ResearchInsightCard } from "./ResearchInsightCard";
import { StrategicFocusCard } from "./StrategicFocusCard";

export function ExecutiveDashboardPage() {
  const [view, setView] = useState<ExecutiveViewId>("30-days");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildExecutiveDashboard(view);
  }, [refreshKey, view]);

  const handleViewChange = useCallback((nextView: ExecutiveViewId) => {
    setView(nextView);
  }, []);

  return (
    <div className="executive-dashboard-page">
      <header className="executive-dashboard-page__head">
        <div>
          <h2>{EXECUTIVE_DASHBOARD_ADMIN_BRAND}</h2>
          <p>
            Founder and executive strategic visibility — institution health, growth, journey outcomes,
            consultant health, communities, research, finance, and legacy. Not operational detail.
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

      <section className="executive-dashboard-page__views" aria-label="Time views">
        {EXECUTIVE_VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`executive-view-chip${view === item.id ? " executive-view-chip--active" : ""}`}
            onClick={() => handleViewChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </section>

      <section className="executive-dashboard-page__metrics" aria-label="Executive metrics">
        {bundle.metrics.map((metric) => (
          <ExecutiveMetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <div className="executive-dashboard-page__body">
        <div className="executive-dashboard-page__column">
          <InstitutionHealthCard snapshot={bundle.institutionHealth} />
          <GrowthTrendCard points={bundle.growthTrend} viewLabel={EXECUTIVE_VIEW_LABELS[bundle.view]} />
          <LegacyGrowthCard snapshot={bundle.legacyGrowth} />
        </div>

        <div className="executive-dashboard-page__column">
          <ResearchInsightCard snapshot={bundle.researchInsight} />
          <CommunityOverviewCard snapshot={bundle.communityOverview} />
          <StrategicFocusCard areas={bundle.areas} focusItems={bundle.strategicFocus} />
        </div>
      </div>

      <footer className="executive-dashboard-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — not implemented in this release.</p>
        <ul>
          {EXECUTIVE_DASHBOARD_FUTURE_KINDS.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
        <p>Admin path: {EXECUTIVE_DASHBOARD_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
