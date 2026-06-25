import { useMemo, useState } from "react";
import {
  INSTITUTIONAL_GOVERNANCE_ADMIN_BRAND,
  INSTITUTIONAL_GOVERNANCE_ADMIN_PATH
} from "../../../constants/institutionalGovernanceAdmin";
import { GOVERNANCE_FUTURE_ARCHITECTURE } from "../../../constants/institutionalGovernance";
import { buildInstitutionalGovernanceBundle } from "../../../utils/governanceEngine";
import { ApprovalQueueCard } from "./ApprovalQueueCard";
import { AuthorityMatrixCard } from "./AuthorityMatrixCard";
import { DecisionRegisterCard } from "./DecisionRegisterCard";
import { DelegationCard } from "./DelegationCard";
import { GovernanceMetricsCard } from "./GovernanceMetricsCard";
import { GovernanceOverviewCard } from "./GovernanceOverviewCard";
import { InstitutionHealthCard } from "./InstitutionHealthCard";
import { PermissionExplorerCard } from "./PermissionExplorerCard";
import { PolicyAcknowledgementCard } from "./PolicyAcknowledgementCard";
import { RoleManagementCard } from "./RoleManagementCard";

export function InstitutionalGovernancePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildInstitutionalGovernanceBundle();
  }, [refreshKey]);

  return (
    <div className="institutional-governance-page">
      <header className="institutional-governance-page__head">
        <div>
          <h2>{INSTITUTIONAL_GOVERNANCE_ADMIN_BRAND}</h2>
          <p>
            Constitutional layer for authority, roles, permissions, delegation, approvals,
            separation of duties, executive oversight, compliance, and policy acknowledgement.
            Every subsystem derives authority from Governance.
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

      <GovernanceOverviewCard
        metrics={bundle.overviewMetrics}
        effectivePermissionCount={bundle.effectivePermissionCount}
      />

      <div className="institutional-governance-page__body">
        <div className="institutional-governance-page__column">
          <AuthorityMatrixCard matrix={bundle.authorityMatrix} />
          <RoleManagementCard roles={bundle.roles} />
          <PermissionExplorerCard permissions={bundle.permissions} />
          <ApprovalQueueCard queue={bundle.approvalQueue} />
        </div>
        <div className="institutional-governance-page__column">
          <DelegationCard delegations={bundle.delegations} />
          <DecisionRegisterCard decisions={bundle.decisions} />
          <PolicyAcknowledgementCard
            policies={bundle.policies}
            acknowledgements={bundle.acknowledgements}
          />
          <InstitutionHealthCard metrics={bundle.overviewMetrics} />
          <GovernanceMetricsCard
            roleCount={bundle.roles.length}
            permissionCount={bundle.permissions.length}
            approvalHistory={bundle.approvalHistory}
          />
        </div>
      </div>

      <footer className="institutional-governance-page__future">
        <h4>Future architecture (documented only)</h4>
        <p>{GOVERNANCE_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {INSTITUTIONAL_GOVERNANCE_ADMIN_PATH}</span>
      </footer>
    </div>
  );
}
