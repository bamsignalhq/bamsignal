import { useMemo, useState } from "react";
import {
  INSTITUTIONAL_READINESS_ADMIN_PATH,
  INSTITUTIONAL_READINESS_BRAND
} from "../../../constants/institutionalReadinessAdmin";
import { REMEDIATION_BOARD_ADMIN_PATH } from "../../../constants/remediationBoardAdmin";
import { LAUNCH_READINESS_ADMIN_PATH } from "../../../constants/launchReadiness";
import { navigateToPath } from "../../../constants/routes";
import { buildInstitutionalReadinessReport } from "../../../utils/institutionalReadinessEngine";
import { HealthCategoryCard } from "./HealthCategoryCard";
import { LaunchDecisionCard } from "./LaunchDecisionCard";
import { ReadinessScoreCard } from "./ReadinessScoreCard";

export function ReadinessPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => {
    void refreshKey;
    return buildInstitutionalReadinessReport();
  }, [refreshKey]);

  return (
    <div className="institutional-readiness-page">
      <header className="institutional-readiness-page__head">
        <div>
          <h2>{INSTITUTIONAL_READINESS_BRAND}</h2>
          <p>
            Aggregate institutional audit outputs — Route, Permission, Journey, Persistence,
            Operations, Safety, Executive, and Launch Readiness health with Go / No-Go decision.
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
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Refresh report
          </button>
        </div>
      </header>

      <ReadinessScoreCard report={report} />

      <div className="institutional-readiness-page__body">
        <HealthCategoryCard sections={report.sections} />
        <LaunchDecisionCard report={report} />
      </div>

      <footer className="institutional-readiness-page__foot">
        <p>Admin path: {INSTITUTIONAL_READINESS_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
