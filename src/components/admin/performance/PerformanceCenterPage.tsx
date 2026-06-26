import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PERFORMANCE_CENTER_REFRESH_INTERVAL_MS,
  type PerformanceCompareWindowId,
  type PerformanceEngineeringToolId,
  type PerformanceTrackId
} from "../../../constants/performanceCenter";
import {
  PERFORMANCE_CENTER_ADMIN_BRAND,
  PERFORMANCE_CENTER_ADMIN_PATH
} from "../../../constants/performanceCenterAdmin";
import { buildDatabasePerformanceCertificationBundle } from "../../../utils/databasePerformanceCertificationEngine";
import { buildLivePerformanceCenterBundle } from "../../../utils/performanceCenterEngine";
import { applyPerformanceEngineeringTool } from "../../../utils/performanceCenterStore";
import { ApiPerformanceCard } from "./ApiPerformanceCard";
import { DatabasePerformanceCard } from "./DatabasePerformanceCard";
import { DatabasePerformanceCertificationCard } from "./DatabasePerformanceCertificationCard";
import { PerformanceCompareCard } from "./PerformanceCompareCard";
import { PerformanceEngineeringSummaryCard } from "./PerformanceEngineeringSummaryCard";
import { PerformanceEngineeringToolsCard } from "./PerformanceEngineeringToolsCard";
import { PerformanceReportsCard } from "./PerformanceReportsCard";
import { PerformanceTracksCard } from "./PerformanceTracksCard";

export function PerformanceCenterPage() {
  const [compareWindow, setCompareWindow] = useState<PerformanceCompareWindowId>("current");
  const [activeTrack, setActiveTrack] = useState<PerformanceTrackId>("startup");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyTool, setBusyTool] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildLivePerformanceCenterBundle(compareWindow);
  }, [compareWindow, refreshKey]);

  const databaseCertReport = useMemo(() => {
    void refreshKey;
    return buildDatabasePerformanceCertificationBundle();
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refresh, PERFORMANCE_CENTER_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const handleTool = useCallback(
    (toolId: PerformanceEngineeringToolId) => {
      setBusyTool(toolId);
      try {
        applyPerformanceEngineeringTool({ toolId, actor: "ops@bamsignal.com" });
        setToast(`${toolId.replace(/-/g, " ")} completed.`);
        refresh();
      } finally {
        setBusyTool(null);
      }
    },
    [refresh]
  );

  const showApi =
    activeTrack === "api-latency" ||
    activeTrack === "slow-endpoints" ||
    activeTrack === "startup";
  const showDatabase =
    activeTrack === "database" || activeTrack === "slow-queries";

  return (
    <div className="performance-center-page">
      <header className="performance-center-page__head">
        <div>
          <h2>{PERFORMANCE_CENTER_ADMIN_BRAND}</h2>
          <p>
            One dashboard dedicated to application performance — startup, API latency, bundle size,
            web vitals, memory, CPU, and database health. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={refresh}>
          Refresh now
        </button>
      </header>

      {toast ? <p className="performance-center-page__toast">{toast}</p> : null}

      <DatabasePerformanceCertificationCard report={databaseCertReport} />
      <PerformanceEngineeringSummaryCard summary={bundle.engineeringSummary} />
      <PerformanceCompareCard activeWindow={compareWindow} onWindowChange={setCompareWindow} />
      <PerformanceTracksCard
        tracks={bundle.tracks}
        compareWindow={compareWindow}
        activeTrack={activeTrack}
        onTrackSelect={setActiveTrack}
      />
      <PerformanceEngineeringToolsCard
        toolRuns={bundle.toolRuns}
        busyTool={busyTool}
        onTool={handleTool}
      />

      <div className="performance-center-page__body">
        <div className="performance-center-page__column">
          <PerformanceReportsCard reports={bundle.reports} />
        </div>
        <div className="performance-center-page__column">
          {showApi ? <ApiPerformanceCard profiles={bundle.apiProfiles} /> : null}
          {showDatabase ? <DatabasePerformanceCard profiles={bundle.databaseProfiles} /> : null}
        </div>
      </div>

      <footer className="performance-center-page__future">
        <span>Route: {PERFORMANCE_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
