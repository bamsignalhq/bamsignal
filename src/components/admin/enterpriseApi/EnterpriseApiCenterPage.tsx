import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ENTERPRISE_API_REFRESH_INTERVAL_MS,
  type EnterpriseApiEndpointStatusId,
  type EnterpriseApiToolId
} from "../../../constants/enterpriseApiCenter";
import {
  ENTERPRISE_API_CENTER_ADMIN_BRAND,
  ENTERPRISE_API_CENTER_ADMIN_PATH
} from "../../../constants/enterpriseApiCenterAdmin";
import { buildLiveEnterpriseApiCenterBundle } from "../../../utils/enterpriseApiCenterEngine";
import { filterEndpointsByStatus } from "../../../utils/enterpriseApiCenterLogic";
import { applyEnterpriseApiTool } from "../../../utils/enterpriseApiCenterStore";
import { EnterpriseApiEndpointsCard } from "./EnterpriseApiEndpointsCard";
import { EnterpriseApiFailedJobsCard } from "./EnterpriseApiFailedJobsCard";
import { EnterpriseApiSummaryCard } from "./EnterpriseApiSummaryCard";
import { EnterpriseApiToolsCard } from "./EnterpriseApiToolsCard";

const STATUS_FILTERS: Array<EnterpriseApiEndpointStatusId | "all"> = [
  "all",
  "healthy",
  "degraded",
  "disabled",
  "maintenance"
];

export function EnterpriseApiCenterPage() {
  const [statusFilter, setStatusFilter] = useState<EnterpriseApiEndpointStatusId | "all">("all");
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyTool, setBusyTool] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildLiveEnterpriseApiCenterBundle();
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refresh, ENTERPRISE_API_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const filteredEndpoints = useMemo(
    () => filterEndpointsByStatus(bundle.endpoints, statusFilter),
    [bundle.endpoints, statusFilter]
  );

  const selectedEndpoint = bundle.endpoints.find((item) => item.id === selectedEndpointId) ?? null;

  const handleTool = useCallback(
    (toolId: EnterpriseApiToolId) => {
      setBusyTool(toolId);
      try {
        applyEnterpriseApiTool({
          toolId,
          actor: "ops@bamsignal.com",
          targetEndpointId: selectedEndpointId ?? undefined
        });
        setToast(`${toolId.replace(/-/g, " ")} completed.`);
        refresh();
      } finally {
        setBusyTool(null);
      }
    },
    [refresh, selectedEndpointId]
  );

  return (
    <div className="enterprise-api-center-page">
      <header className="enterprise-api-center-page__head">
        <div>
          <h2>{ENTERPRISE_API_CENTER_ADMIN_BRAND}</h2>
          <p>
            Live API operations dashboard — all endpoints with status, latency, requests, errors, rate
            limits, authentication, and payload size. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={refresh}>
          Refresh now
        </button>
      </header>

      {toast ? <p className="enterprise-api-center-page__toast">{toast}</p> : null}

      <EnterpriseApiSummaryCard summary={bundle.summary} />

      <nav className="enterprise-api-center-page__filters" aria-label="Endpoint status filters">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={`enterprise-api-center-page__filter-btn${
              statusFilter === item ? " is-active" : ""
            }`}
            onClick={() => setStatusFilter(item)}
          >
            {item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>

      <EnterpriseApiToolsCard
        toolRuns={bundle.toolRuns}
        busyTool={busyTool}
        selectedEndpointRef={selectedEndpoint?.endpointRef ?? null}
        onTool={handleTool}
      />

      <EnterpriseApiEndpointsCard
        endpoints={filteredEndpoints}
        selectedEndpointId={selectedEndpointId}
        onSelect={setSelectedEndpointId}
      />

      <EnterpriseApiFailedJobsCard jobs={bundle.failedJobs} />

      <footer className="enterprise-api-center-page__footer">
        <span>Route: {ENTERPRISE_API_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
