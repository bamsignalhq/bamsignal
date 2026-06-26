import { useCallback, useEffect, useMemo, useState } from "react";
import {
  INSTITUTIONAL_READINESS_REFRESH_INTERVAL_MS,
  READINESS_VERIFICATION_RULES
} from "../../../constants/institutionalReadiness";
import {
  INSTITUTIONAL_READINESS_ADMIN_PATH,
  INSTITUTIONAL_READINESS_BRAND
} from "../../../constants/institutionalReadinessAdmin";
import { LAUNCH_READINESS_ADMIN_PATH } from "../../../constants/launchReadiness";
import { REMEDIATION_BOARD_ADMIN_PATH } from "../../../constants/remediationBoardAdmin";
import { navigateToPath } from "../../../constants/routes";
import type { ReadinessExportTypeId } from "../../../types/institutionalReadiness";
import { buildLiveInstitutionalReadinessBundle } from "../../../utils/institutionalReadinessEngine";
import { exportReadinessReport } from "../../../utils/institutionalReadinessStore";
import { CriticalIssueCard } from "./CriticalIssueCard";
import { LaunchRecommendationCard } from "./LaunchRecommendationCard";
import { ReadinessAuditDomainsCard } from "./ReadinessAuditDomainsCard";
import { ReadinessBlockersCard } from "./ReadinessBlockersCard";
import { ReadinessExportCard } from "./ReadinessExportCard";
import { ReadinessOverviewCard } from "./ReadinessOverviewCard";

export function ReadinessPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyExport, setBusyExport] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildLiveInstitutionalReadinessBundle();
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refresh, INSTITUTIONAL_READINESS_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const handleExport = useCallback(
    (exportType: ReadinessExportTypeId) => {
      setBusyExport(exportType);
      try {
        const record = exportReadinessReport({
          exportType,
          bundle,
          actor: "founder@bamsignal.com"
        });
        setToast(`${record.title} generated.`);
        refresh();
      } finally {
        setBusyExport(null);
      }
    },
    [bundle, refresh]
  );

  return (
    <div className="institutional-readiness-page">
      <header className="institutional-readiness-page__head">
        <div>
          <h2>{INSTITUTIONAL_READINESS_BRAND}</h2>
          <p>
            Final institutional audit engine — one place that evaluates the entire platform. Overall
            score, trend, blockers, and automatic GO / GO WITH CONDITIONS / NO GO recommendation.
            Auto-refreshes every 30 seconds.
          </p>
        </div>
        <div className="institutional-readiness-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(LAUNCH_READINESS_ADMIN_PATH)}
          >
            Launch command center
          </button>
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(REMEDIATION_BOARD_ADMIN_PATH)}
          >
            Remediation board
          </button>
          <button type="button" className="concierge-consultant-btn" onClick={refresh}>
            Re-verify
          </button>
        </div>
      </header>

      {toast ? <p className="institutional-readiness-page__toast">{toast}</p> : null}

      <ReadinessOverviewCard bundle={bundle} />
      <LaunchRecommendationCard bundle={bundle} />

      <div className="institutional-readiness-page__rules">
        {READINESS_VERIFICATION_RULES.map((rule) => (
          <span key={rule} className="institutional-readiness-page__rule">
            {rule}
          </span>
        ))}
      </div>

      <ReadinessAuditDomainsCard domains={bundle.auditDomains} />
      <ReadinessBlockersCard blockers={bundle.blockers} blockerCounts={bundle.blockerCounts} />
      <ReadinessExportCard exports={bundle.exports} busyExport={busyExport} onExport={handleExport} />

      <div className="institutional-readiness-page__body">
        <div className="institutional-readiness-page__column">
          <CriticalIssueCard criticalIssues={bundle.criticalIssues} warnings={bundle.warnings} />
        </div>
      </div>

      <footer className="institutional-readiness-page__future">
        <span>Route: {INSTITUTIONAL_READINESS_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
