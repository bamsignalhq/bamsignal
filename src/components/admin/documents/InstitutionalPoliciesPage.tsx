import { useMemo, useState } from "react";
import {
  INSTITUTIONAL_POLICIES_ADMIN_BRAND,
  INSTITUTIONAL_POLICIES_ADMIN_PATH
} from "../../../constants/institutionalPoliciesAdmin";
import { buildInstitutionalPoliciesBundle } from "../../../utils/documentCenterEngine";
import { AcknowledgementCard } from "./AcknowledgementCard";
import { PolicyCard } from "./PolicyCard";
import { VersionHistoryCard } from "./VersionHistoryCard";

export function InstitutionalPoliciesPage() {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>("doc_001");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildInstitutionalPoliciesBundle();
  }, [refreshKey]);

  const selectedPolicy =
    bundle.policies.find((policy) => policy.id === selectedPolicyId) ?? bundle.policies[0] ?? null;

  return (
    <div className="document-center-page institutional-policies-page">
      <header className="document-center-page__head">
        <div>
          <h2>{INSTITUTIONAL_POLICIES_ADMIN_BRAND}</h2>
          <p>
            Policy publication, version history, and employee acknowledgement — integrated with the
            Institutional Policy & Documentation Center.
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

      <PolicyCard policies={bundle.policies} policyVersions={bundle.policyVersions} />

      <div className="document-center-page__body">
        <section className="document-center-page__list">
          <h3>Policy register</h3>
          <ul className="policy-card__list">
            {bundle.policies.map((policy) => (
              <li key={policy.id}>
                <button
                  type="button"
                  className={`document-library-card__item${selectedPolicyId === policy.id ? " is-selected" : ""}`}
                  onClick={() => setSelectedPolicyId(policy.id)}
                >
                  <strong>{policy.title}</strong>
                  <span>v{policy.version}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="document-center-page__detail">
          {selectedPolicy ? (
            <VersionHistoryCard
              versions={selectedPolicy.versionHistory}
              currentVersion={selectedPolicy.version}
            />
          ) : null}
          <AcknowledgementCard
            acknowledgements={bundle.acknowledgements.filter(
              (item) => item.documentId === selectedPolicy?.id
            )}
            documents={bundle.policies}
            pending={bundle.pendingAcknowledgements.filter(
              (item) => item.documentId === selectedPolicy?.id
            )}
          />
        </div>
      </div>

      <footer className="document-center-page__future">
        <p>Route: {INSTITUTIONAL_POLICIES_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
