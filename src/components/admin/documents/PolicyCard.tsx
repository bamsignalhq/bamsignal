import type { DocumentRecord, PolicyVersionRecord } from "../../../types/documentCenter";
import { DOCUMENT_STATUS_LABELS } from "../../../constants/documentCenter";

type PolicyCardProps = {
  policies: DocumentRecord[];
  policyVersions: PolicyVersionRecord[];
};

export function PolicyCard({ policies, policyVersions }: PolicyCardProps) {
  return (
    <section className="document-card policy-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Policies</h3>
        <p>Institutional policies with versioned publication history and approval trail.</p>
      </header>
      <ul className="policy-card__list">
        {policies.map((policy) => {
          const versions = policyVersions.filter((item) => item.policySlug === policy.slug);
          return (
            <li key={policy.id} className="policy-card__item">
              <div>
                <strong>{policy.title}</strong>
                <span className={`document-status document-status--${policy.status}`}>
                  {DOCUMENT_STATUS_LABELS[policy.status]}
                </span>
              </div>
              <p>{policy.summary}</p>
              <div className="policy-card__meta">
                <span>Current v{policy.version}</span>
                <span>{versions.length} published version(s)</span>
                {policy.approval ? <span>Approved by {policy.approval.approvedBy}</span> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
