import { useMemo, useState } from "react";
import {
  BUSINESS_CONTINUITY_ADMIN_BRAND,
  BUSINESS_CONTINUITY_ADMIN_PATH
} from "../../../constants/businessContinuityAdmin";
import { BUSINESS_CONTINUITY_FUTURE_ARCHITECTURE } from "../../../constants/businessContinuity";
import { buildBusinessContinuityBundle } from "../../../utils/businessContinuityEngine";
import { BackupStatusCard } from "./BackupStatusCard";
import { ContinuityExerciseCard } from "./ContinuityExerciseCard";
import { IncidentCenterCard } from "./IncidentCenterCard";
import { IncidentOverviewCard } from "./IncidentOverviewCard";
import { InfrastructureHealthCard } from "./InfrastructureHealthCard";
import { ProviderHealthCard } from "./ProviderHealthCard";
import { RecoveryPlaybookCard } from "./RecoveryPlaybookCard";
import { RiskAssessmentCard } from "./RiskAssessmentCard";

export function BusinessContinuityPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildBusinessContinuityBundle();
  }, [refreshKey]);

  return (
    <div className="business-continuity-page">
      <header className="business-continuity-page__head">
        <div>
          <h2>{BUSINESS_CONTINUITY_ADMIN_BRAND}</h2>
          <p>
            Operational resilience layer for outages, provider downtime, infrastructure incidents,
            and regional failures. Monitor health, document playbooks, track incidents, and verify
            backup posture — institution continues operating during disruption.
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

      <IncidentOverviewCard metrics={bundle.overviewMetrics} />

      <div className="business-continuity-page__body">
        <div className="business-continuity-page__column">
          <IncidentCenterCard incidents={bundle.incidents} />
          <ProviderHealthCard providers={bundle.providerStatuses} />
          <RecoveryPlaybookCard plans={bundle.recoveryPlans} />
        </div>
        <div className="business-continuity-page__column">
          <BackupStatusCard backupJobs={bundle.backupJobs} />
          <ContinuityExerciseCard exercises={bundle.exercises} />
          <InfrastructureHealthCard snapshot={bundle.latestSnapshot} />
          <RiskAssessmentCard items={bundle.riskAssessment} />
        </div>
      </div>

      <footer className="business-continuity-page__future">
        <h4>Future architecture (documented only)</h4>
        <p>{BUSINESS_CONTINUITY_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {BUSINESS_CONTINUITY_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
