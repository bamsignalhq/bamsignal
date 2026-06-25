import { useMemo, useState } from "react";
import {
  READINESS_FUTURE_ARCHITECTURE,
  READINESS_VERIFICATION_RULES
} from "../../../constants/institutionalReadiness";
import {
  INSTITUTIONAL_READINESS_ADMIN_PATH,
  INSTITUTIONAL_READINESS_BRAND
} from "../../../constants/institutionalReadinessAdmin";
import { REMEDIATION_BOARD_ADMIN_PATH } from "../../../constants/remediationBoardAdmin";
import { LAUNCH_READINESS_ADMIN_PATH } from "../../../constants/launchReadiness";
import { navigateToPath } from "../../../constants/routes";
import { buildInstitutionalReadinessVerificationBundle } from "../../../utils/institutionalReadinessEngine";
import { CriticalIssueCard } from "./CriticalIssueCard";
import { DependencyCard } from "./DependencyCard";
import { LaunchRecommendationCard } from "./LaunchRecommendationCard";
import { ReadinessOverviewCard } from "./ReadinessOverviewCard";
import { SubsystemHealthCard } from "./SubsystemHealthCard";
import { VerificationCard } from "./VerificationCard";

export function ReadinessPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildInstitutionalReadinessVerificationBundle();
  }, [refreshKey]);

  return (
    <div className="institutional-readiness-page">
      <header className="institutional-readiness-page__head">
        <div>
          <h2>{INSTITUTIONAL_READINESS_BRAND}</h2>
          <p>
            Every major subsystem continuously reports operational readiness. This engine is the
            final authority for institutional launch go / no-go decisions.
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
            Re-verify
          </button>
        </div>
      </header>

      <ReadinessOverviewCard bundle={bundle} />

      <div className="institutional-readiness-page__rules">
        {READINESS_VERIFICATION_RULES.map((rule) => (
          <span key={rule} className="institutional-readiness-page__rule">
            {rule}
          </span>
        ))}
      </div>

      <div className="institutional-readiness-page__body">
        <div className="institutional-readiness-page__column">
          <SubsystemHealthCard subsystems={bundle.subsystems} />
          <VerificationCard checks={bundle.checks} passedChecks={bundle.passedChecks} />
        </div>
        <div className="institutional-readiness-page__column">
          <DependencyCard dependencies={bundle.dependencies} />
          <CriticalIssueCard criticalIssues={bundle.criticalIssues} warnings={bundle.warnings} />
          <LaunchRecommendationCard bundle={bundle} />
        </div>
      </div>

      <footer className="institutional-readiness-page__future">
        <h4>Future architecture (documented only)</h4>
        <p>{READINESS_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {INSTITUTIONAL_READINESS_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
