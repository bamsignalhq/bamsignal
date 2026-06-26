import { useCallback, useEffect, useState } from "react";
import {
  OBSERVABILITY_FUTURE_CAPABILITIES,
  OBSERVABILITY_REFRESH_INTERVAL_MS
} from "../../../constants/productionObservability";
import {
  PRODUCTION_OBSERVABILITY_ADMIN_BRAND,
  PRODUCTION_OBSERVABILITY_ADMIN_PATH
} from "../../../constants/productionObservabilityAdmin";
import type { ProductionObservabilityBundle } from "../../../types/productionObservability";
import { buildLiveProductionObservabilityBundle } from "../../../utils/productionObservabilityEngine";
import { listSlowEndpoints } from "../../../utils/productionObservabilityLogic";
import { applyObservabilityErrorTriage } from "../../../utils/productionObservabilityStore";
import {
  BackgroundWorkersCard,
  NotificationQueueCard
} from "./BackgroundWorkersCard";
import { DatabaseHealthCard, PerformanceMetricsCard } from "./DatabaseHealthCard";
import { LiveServicesCard } from "./LiveServicesCard";
import { ObservabilitySummaryCards } from "./ObservabilitySummaryCards";
import { RecentDeploymentsCard } from "./RecentDeploymentsCard";
import { RecentErrorsCard } from "./RecentErrorsCard";
import { SlowEndpointsCard } from "./SlowEndpointsCard";

export function ProductionObservabilityPage() {
  const [bundle, setBundle] = useState<ProductionObservabilityBundle | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await buildLiveProductionObservabilityBundle();
      setBundle(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, OBSERVABILITY_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const handleTriage = useCallback(
    (errorId: string, action: "resolve" | "ignore" | "assign") => {
      applyObservabilityErrorTriage({
        errorId,
        action,
        actor: "ops@bamsignal.com",
        assignee: action === "assign" ? "ops@bamsignal.com" : undefined
      });
      void refresh();
    },
    [refresh]
  );

  const slowEndpoints = bundle ? listSlowEndpoints(bundle.endpoints) : [];

  return (
    <div className="observability-page">
      <header className="observability-page__head">
        <div>
          <h2>{PRODUCTION_OBSERVABILITY_ADMIN_BRAND}</h2>
          <p>
            Operational heartbeat of BamSignal — live service health, API latency, error center,
            deployments, background workers, and database status. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={() => void refresh()}>
          {loading ? "Refreshing…" : "Refresh now"}
        </button>
      </header>

      {bundle ? (
        <>
          <ObservabilitySummaryCards cards={bundle.summaryCards} />

          <div className="observability-page__body">
            <div className="observability-page__column">
              <LiveServicesCard services={bundle.services} />
              <RecentErrorsCard errors={bundle.errors} onTriage={handleTriage} />
              <RecentDeploymentsCard deployments={bundle.deployments} />
            </div>
            <div className="observability-page__column">
              <BackgroundWorkersCard queues={bundle.queues} />
              <SlowEndpointsCard endpoints={slowEndpoints} />
              <NotificationQueueCard queues={bundle.queues} />
              <DatabaseHealthCard database={bundle.database} />
              <PerformanceMetricsCard performance={bundle.performance} />
            </div>
          </div>

          <footer className="observability-page__foot">
            <span>Route: {PRODUCTION_OBSERVABILITY_ADMIN_PATH}</span>
            <span>Live probe: {bundle.liveProbe ? "connected" : "seed fallback"}</span>
            <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
            <span>
              Future: {OBSERVABILITY_FUTURE_CAPABILITIES.map((item) => item.label).join(" · ")}
            </span>
          </footer>
        </>
      ) : (
        <p className="observability-page__empty">Loading observability center…</p>
      )}
    </div>
  );
}
