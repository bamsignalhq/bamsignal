import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DATA_GOVERNANCE_MODULES,
  DATA_GOVERNANCE_REFRESH_INTERVAL_MS
} from "../../../constants/dataGovernanceCenter";
import {
  DATA_GOVERNANCE_CENTER_ADMIN_BRAND,
  DATA_GOVERNANCE_CENTER_ADMIN_PATH
} from "../../../constants/dataGovernanceCenterAdmin";
import type { DataGovernanceModuleId, DataGovernanceToolId } from "../../../constants/dataGovernanceCenter";
import { buildDataGovernanceCenterBundle } from "../../../utils/dataGovernanceCenterEngine";
import { filterGeneralPrivacyRequests } from "../../../utils/dataGovernanceCenterLogic";
import { applyDataGovernanceTool } from "../../../utils/dataGovernanceCenterStore";
import { AuditExportsCard } from "./AuditExportsCard";
import { ComplianceCard } from "./ComplianceCard";
import { ConsentCard } from "./ConsentCard";
import { GovernanceAuditCard } from "./GovernanceAuditCard";
import { GovernanceSummaryCard } from "./GovernanceSummaryCard";
import { GovernanceToolsCard } from "./GovernanceToolsCard";
import { LegalHoldsCard } from "./LegalHoldsCard";
import { PolicyVersionsCard } from "./PolicyVersionsCard";
import { PrivacyRequestCard } from "./PrivacyRequestCard";
import { RetentionCard } from "./RetentionCard";

export function DataGovernanceCenterPage() {
  const [module, setModule] = useState<DataGovernanceModuleId>("consent-management");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyTool, setBusyTool] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildDataGovernanceCenterBundle(module);
  }, [module, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refresh, DATA_GOVERNANCE_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const privacyRequestsForModule = useMemo(() => {
    if (module === "deletion-requests") return bundle.deletionRequests;
    if (module === "export-requests") return bundle.exportRequests;
    if (module === "privacy-requests") return filterGeneralPrivacyRequests(bundle.privacyRequests);
    return bundle.privacyRequests;
  }, [bundle, module]);

  const handleTool = useCallback(
    (toolId: DataGovernanceToolId) => {
      setBusyTool(toolId);
      try {
        const target =
          bundle.privacyRequests[0]?.memberRef ??
          bundle.consentRecords[0]?.memberRef ??
          "member_***00";
        applyDataGovernanceTool({
          toolId,
          target,
          actor: "privacy@bamsignal.com"
        });
        setToast(`${toolId.replace(/-/g, " ")} completed.`);
        refresh();
      } finally {
        setBusyTool(null);
      }
    },
    [bundle.consentRecords, bundle.privacyRequests, refresh]
  );

  return (
    <div className="data-governance-center-page">
      <header className="data-governance-center-page__head">
        <div>
          <h2>{DATA_GOVERNANCE_CENTER_ADMIN_BRAND}</h2>
          <p>
            Centralized privacy and governance operations — consent, retention, deletion and export
            requests, legal holds, and audit exports. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={refresh}>
          Refresh now
        </button>
      </header>

      {toast ? <p className="data-governance-center-page__toast">{toast}</p> : null}

      <GovernanceSummaryCard summary={bundle.summary} />
      <ComplianceCard summary={bundle.summary} regionalPolicies={bundle.regionalPolicies} />
      <GovernanceToolsCard onTool={handleTool} busyTool={busyTool} />

      <nav className="data-governance-center-page__areas" aria-label="Governance modules">
        {DATA_GOVERNANCE_MODULES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`data-governance-center-page__area-btn${
              module === item.id ? " is-active" : ""
            }`}
            onClick={() => setModule(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="data-governance-center-page__body">
        <div className="data-governance-center-page__column">
          {module === "consent-management" ? <ConsentCard consents={bundle.consentRecords} /> : null}
          {module === "data-retention" ? (
            <>
              <RetentionCard policies={bundle.retentionPolicies} />
              <PolicyVersionsCard versions={bundle.policyVersions} />
            </>
          ) : null}
          {module === "deletion-requests" ? (
            <PrivacyRequestCard
              requests={privacyRequestsForModule}
              title="Deletion requests"
              description="Verified member data deletion queue."
            />
          ) : null}
          {module === "export-requests" ? (
            <PrivacyRequestCard
              requests={privacyRequestsForModule}
              title="Export requests"
              description="Member data download and portability requests."
            />
          ) : null}
          {module === "privacy-requests" ? (
            <PrivacyRequestCard
              requests={privacyRequestsForModule}
              title="Privacy requests"
              description="Correction, consent withdrawal, and processing restriction."
            />
          ) : null}
          {module === "legal-holds" ? <LegalHoldsCard holds={bundle.legalHolds} /> : null}
          {module === "audit-exports" ? <AuditExportsCard exports={bundle.auditExports} /> : null}
        </div>
        <div className="data-governance-center-page__column">
          <GovernanceAuditCard records={bundle.governanceAudit} />
        </div>
      </div>

      <footer className="data-governance-center-page__future">
        <span>Route: {DATA_GOVERNANCE_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
