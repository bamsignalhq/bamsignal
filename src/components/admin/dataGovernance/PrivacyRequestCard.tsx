import {
  PRIVACY_REQUEST_STATUS_LABELS,
  PRIVACY_REQUEST_TYPES
} from "../../../constants/dataGovernanceCenter";
import type { PrivacyRequestRecord } from "../../../types/dataGovernanceCenter";

type PrivacyRequestCardProps = {
  requests: PrivacyRequestRecord[];
  title?: string;
  description?: string;
};

const REQUEST_TYPE_LABELS = Object.fromEntries(
  PRIVACY_REQUEST_TYPES.map((item) => [item.id, item.label])
) as Record<PrivacyRequestRecord["requestType"], string>;

export function PrivacyRequestCard({
  requests,
  title = "Privacy requests",
  description = "Download, delete, correct, consent withdrawal, and processing restriction."
}: PrivacyRequestCardProps) {
  const sorted = [...requests].sort(
    (left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()
  );

  return (
    <section className="data-governance-card privacy-request-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>{title}</h3>
        <p>{description}</p>
      </header>
      {sorted.length ? (
        <ul className="data-governance-card__list">
          {sorted.map((request) => (
            <li key={request.id}>
              <div className="data-governance-card__row">
                <strong>{request.requestRef}</strong>
                <span className={`privacy-request-card__status privacy-request-card__status--${request.status}`}>
                  {PRIVACY_REQUEST_STATUS_LABELS[request.status]}
                </span>
              </div>
              <p>{REQUEST_TYPE_LABELS[request.requestType]}</p>
              <div className="data-governance-card__meta">
                <span>{request.memberRef}</span>
                <span>Submitted {new Date(request.submittedAt).toLocaleDateString()}</span>
                {request.assignedTo ? <span>{request.assignedTo}</span> : null}
              </div>
              {request.notes ? <p className="privacy-request-card__notes">{request.notes}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="data-governance-card__empty">No privacy requests in this area.</p>
      )}
    </section>
  );
}
