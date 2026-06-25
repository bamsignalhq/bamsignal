import { useMemo, useState } from "react";
import {
  DATA_GOVERNANCE_AREAS,
  DATA_GOVERNANCE_FUTURE_ARCHITECTURE
} from "../../../constants/dataGovernanceCenter";
import {
  DATA_GOVERNANCE_CENTER_ADMIN_BRAND,
  DATA_GOVERNANCE_CENTER_ADMIN_PATH
} from "../../../constants/dataGovernanceCenterAdmin";
import type { DataGovernanceAreaId } from "../../../constants/dataGovernanceCenter";
import { buildDataGovernanceCenterBundle } from "../../../utils/dataGovernanceCenterEngine";
import { ComplianceCard } from "./ComplianceCard";
import { ConsentCard } from "./ConsentCard";
import { DataInventoryCard } from "./DataInventoryCard";
import { PrivacyRequestCard } from "./PrivacyRequestCard";
import { RetentionCard } from "./RetentionCard";
import { SensitiveDataCard } from "./SensitiveDataCard";

export function DataGovernanceCenterPage() {
  const [area, setArea] = useState<DataGovernanceAreaId>("inventory");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildDataGovernanceCenterBundle(area);
  }, [area, refreshKey]);

  const showInventory = area === "inventory" || area === "classification";
  const showRetention = area === "inventory" || area === "retention";
  const showConsent = area === "inventory" || area === "consent";
  const showPrivacy =
    area === "inventory" ||
    area === "privacy" ||
    area === "deletion" ||
    area === "export";
  const showSensitive = area === "inventory" || area === "sensitive";
  const showCompliance = area === "inventory" || area === "regional";

  return (
    <div className="data-governance-center-page">
      <header className="data-governance-center-page__head">
        <div>
          <h2>{DATA_GOVERNANCE_CENTER_ADMIN_BRAND}</h2>
          <p>
            Institutional data stewardship — classification, retention, consent, privacy requests,
            regional policies, and sensitive data registers. People entrust BamSignal with extremely
            personal information.
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

      <nav className="data-governance-center-page__areas" aria-label="Data governance areas">
        {DATA_GOVERNANCE_AREAS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`data-governance-center-page__area-btn${
              area === item.id ? " is-active" : ""
            }`}
            onClick={() => setArea(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {area === "inventory" ? (
        <ComplianceCard summary={bundle.summary} regionalPolicies={bundle.regionalPolicies} />
      ) : null}

      <div className="data-governance-center-page__body">
        <div className="data-governance-center-page__column">
          {showInventory ? (
            <DataInventoryCard summary={bundle.summary} inventory={bundle.inventory} />
          ) : null}
          {showRetention ? <RetentionCard policies={bundle.retentionPolicies} /> : null}
          {showConsent ? <ConsentCard consents={bundle.consentRecords} /> : null}
        </div>
        <div className="data-governance-center-page__column">
          {showPrivacy ? <PrivacyRequestCard requests={bundle.privacyRequests} /> : null}
          {showSensitive ? <SensitiveDataCard registers={bundle.sensitiveRegisters} /> : null}
          {showCompliance && area !== "inventory" ? (
            <ComplianceCard summary={bundle.summary} regionalPolicies={bundle.regionalPolicies} />
          ) : null}
        </div>
      </div>

      <footer className="data-governance-center-page__future">
        <h4>Future architecture (documented only)</h4>
        <p>{DATA_GOVERNANCE_FUTURE_ARCHITECTURE.map((item) => item.label).join(" · ")}</p>
        <span>Route: {DATA_GOVERNANCE_CENTER_ADMIN_PATH}</span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
