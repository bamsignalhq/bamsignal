import {
  REMEDIATION_CATEGORY_LABELS,
  REMEDIATION_STATUS_LABELS,
  REMEDIATION_STATUSES
} from "../../../constants/remediationBoard";
import { navigateToPath } from "../../../constants/routes";
import type { RemediationFinding, RemediationStatusId } from "../../../types/remediationBoard";
import { SeverityBadge } from "./SeverityBadge";

type RemediationCardProps = {
  finding: RemediationFinding;
  onStatusChange: (findingId: string, status: RemediationStatusId) => void;
};

export function RemediationCard({ finding, onStatusChange }: RemediationCardProps) {
  return (
    <article className={`remediation-card remediation-card--${finding.status}`}>
      <header className="remediation-card__head">
        <div className="remediation-card__title-row">
          <SeverityBadge severity={finding.severity} />
          {finding.launchBlocker ? (
            <span className="remediation-card__blocker">Launch blocker</span>
          ) : null}
        </div>
        <h4>{finding.title}</h4>
      </header>

      <p className="remediation-card__detail">{finding.detail}</p>

      <dl className="remediation-card__meta">
        <div>
          <dt>Category</dt>
          <dd>{REMEDIATION_CATEGORY_LABELS[finding.category]}</dd>
        </div>
        <div>
          <dt>Audit source</dt>
          <dd>{finding.auditSource}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <select
              className="remediation-card__status-select"
              value={finding.status}
              onChange={(event) =>
                onStatusChange(finding.id, event.target.value as RemediationStatusId)
              }
            >
              {REMEDIATION_STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {REMEDIATION_STATUS_LABELS[status.id]}
                </option>
              ))}
            </select>
          </dd>
        </div>
      </dl>

      {finding.auditPath ? (
        <footer className="remediation-card__foot">
          <button
            type="button"
            className="concierge-consultant-btn concierge-consultant-btn--ghost"
            onClick={() => navigateToPath(finding.auditPath!)}
          >
            View audit
          </button>
        </footer>
      ) : null}
    </article>
  );
}
