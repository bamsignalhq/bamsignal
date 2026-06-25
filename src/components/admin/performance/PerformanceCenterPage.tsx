import { useMemo, useState } from "react";
import {
  PERFORMANCE_FUTURE_ARCHITECTURE,
  PERFORMANCE_METRIC_LABELS,
  PERFORMANCE_SECTIONS
} from "../../../constants/performanceCenter";
import {
  PERFORMANCE_CENTER_ADMIN_BRAND,
  PERFORMANCE_CENTER_ADMIN_PATH
} from "../../../constants/performanceCenterAdmin";
import type { PerformanceSectionId } from "../../../constants/performanceCenter";
import { buildPerformanceCenterBundle } from "../../../utils/performanceCenterEngine";
import { ApiPerformanceCard } from "./ApiPerformanceCard";
import { CapacityPlanningCard } from "./CapacityPlanningCard";
import { DatabasePerformanceCard } from "./DatabasePerformanceCard";
import { GrowthForecastCard } from "./GrowthForecastCard";
import { OptimizationCard } from "./OptimizationCard";
import { PerformanceOverviewCard } from "./PerformanceOverviewCard";

export function PerformanceCenterPage() {
  const [section, setSection] = useState<PerformanceSectionId>("system-performance");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildPerformanceCenterBundle(section);
  }, [section, refreshKey]);

  const showOverview = section === "system-performance";
  const showApi =
    showOverview || section === "api-performance" || section === "search-performance";
  const showDatabase = showOverview || section === "database-performance";
  const showCapacity =
    showOverview || section === "capacity-planning" || section === "storage" || section === "bandwidth";
  const showOptimization =
    showOverview || section === "optimization" || section === "queue-performance";
  const showForecast = showOverview || section === "growth-forecast";

  return (
    <div className="performance-center-page">
      <header className="performance-center-page__head">
        <div>
          <h2>{PERFORMANCE_CENTER_ADMIN_BRAND}</h2>
          <p>
            Institutional capacity planning — ensure BamSignal scales from hundreds to millions of
            members without operational surprises. This is not a server monitor; it is strategic
            performance, headroom, and optimization intelligence.
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

      <nav className="performance-center-page__sections" aria-label="Performance sections">
        {PERFORMANCE_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`performance-center-page__section-btn${
              section === item.id ? " is-active" : ""
            }`}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {showOverview ? <PerformanceOverviewCard summary={bundle.summary} /> : null}

      {!showOverview && bundle.metrics.length ? (
        <p className="performance-center-page__metrics-note">
          Section metrics:{" "}
          {bundle.metrics
            .map((item) => `${PERFORMANCE_METRIC_LABELS[item.metricId]} ${item.value}${item.unit}`)
            .join(" · ")}
        </p>
      ) : null}

      <div className="performance-center-page__body">
        <div className="performance-center-page__column">
          {showApi ? <ApiPerformanceCard profiles={bundle.apiProfiles} /> : null}
          {showDatabase ? <DatabasePerformanceCard profiles={bundle.databaseProfiles} /> : null}
          {showCapacity ? (
            <CapacityPlanningCard
              plans={bundle.capacityPlans}
              recommendations={bundle.scalingRecommendations}
            />
          ) : null}
        </div>
        <div className="performance-center-page__column">
          {showOptimization ? <OptimizationCard items={bundle.optimizationItems} /> : null}
          {showForecast ? <GrowthForecastCard forecasts={bundle.growthForecasts} /> : null}
        </div>
      </div>

      <footer className="performance-center-page__future">
        <h4>Future architecture (documented only)</h4>
        <p>{PERFORMANCE_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {PERFORMANCE_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
