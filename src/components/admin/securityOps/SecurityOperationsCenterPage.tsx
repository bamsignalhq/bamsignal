import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SECURITY_OPS_MODULES,
  SECURITY_OPS_REFRESH_INTERVAL_MS
} from "../../../constants/securityOperationsCenter";
import {
  SECURITY_OPERATIONS_CENTER_ADMIN_BRAND,
  SECURITY_OPERATIONS_CENTER_ADMIN_PATH
} from "../../../constants/securityOperationsCenterAdmin";
import type { SecurityOpsModuleId, SecurityOpsToolId } from "../../../constants/securityOperationsCenter";
import { buildLiveSecurityOperationsCenterBundle } from "../../../utils/securityOperationsCenterEngine";
import { filterEventsByModule } from "../../../utils/securityOperationsCenterLogic";
import { applySecurityOpsTool } from "../../../utils/securityOperationsCenterStore";
import { SecurityOpsEventsCard } from "./SecurityOpsEventsCard";
import { SecurityOpsIncidentsCard } from "./SecurityOpsIncidentsCard";
import { SecurityOpsScoresCard } from "./SecurityOpsScoresCard";
import { SecurityOpsSummaryCard } from "./SecurityOpsSummaryCard";
import { SecurityOpsToolsCard } from "./SecurityOpsToolsCard";

export function SecurityOperationsCenterPage() {
  const [module, setModule] = useState<SecurityOpsModuleId>("authentication");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyTool, setBusyTool] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildLiveSecurityOperationsCenterBundle();
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refresh, SECURITY_OPS_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const moduleEvents = useMemo(
    () => filterEventsByModule(bundle.events, module),
    [bundle.events, module]
  );

  const handleTool = useCallback(
    (toolId: SecurityOpsToolId) => {
      setBusyTool(toolId);
      try {
        const target = bundle.events[0]?.target ?? "member_***00";
        applySecurityOpsTool({ toolId, target, actor: "security@bamsignal.com" });
        setToast(`${toolId.replace(/-/g, " ")} executed.`);
        refresh();
      } finally {
        setBusyTool(null);
      }
    },
    [bundle.events, refresh]
  );

  return (
    <div className="security-ops-center-page">
      <header className="security-ops-center-page__head">
        <div>
          <h2>{SECURITY_OPERATIONS_CENTER_ADMIN_BRAND}</h2>
          <p>
            Centralized platform security — authentication, suspicious logins, permission changes,
            API abuse, session anomalies, brute-force attempts, and admin activity. Not moderation.
            Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={refresh}>
          Refresh now
        </button>
      </header>

      {toast ? <p className="security-ops-center-page__toast">{toast}</p> : null}

      <SecurityOpsSummaryCard summary={bundle.summary} />
      <SecurityOpsScoresCard scores={bundle.scores} />
      <SecurityOpsToolsCard onTool={handleTool} busyTool={busyTool} />

      <nav className="security-ops-center-page__modules" aria-label="Security modules">
        {SECURITY_OPS_MODULES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`security-ops-center-page__module-btn${
              module === item.id ? " is-active" : ""
            }`}
            onClick={() => setModule(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="security-ops-center-page__body">
        <div className="security-ops-center-page__column">
          <SecurityOpsEventsCard
            events={moduleEvents}
            title={`${SECURITY_OPS_MODULES.find((item) => item.id === module)?.label ?? "Security"} events`}
          />
        </div>
        <div className="security-ops-center-page__column">
          <SecurityOpsIncidentsCard incidents={bundle.incidents} />
        </div>
      </div>

      <footer className="security-ops-center-page__foot">
        <span>Route: {SECURITY_OPERATIONS_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
