import {
  DATA_INTEGRITY_CHECK_LABELS,
  INTEGRITY_STATUS_LABELS
} from "../../../constants/dataIntegrity";
import type { IntegrityCheck } from "../../../types/dataIntegrity";

type IntegrityIssueCardProps = {
  check: IntegrityCheck;
};

export function IntegrityIssueCard({ check }: IntegrityIssueCardProps) {
  return (
    <article className={`integrity-issue-card integrity-issue-card--${check.status}`}>
      <header className="integrity-issue-card__head">
        <div className="integrity-issue-card__title-row">
          <h4>{DATA_INTEGRITY_CHECK_LABELS[check.id]}</h4>
          <span className={`integrity-status-badge integrity-status-badge--${check.status}`}>
            {INTEGRITY_STATUS_LABELS[check.status]}
          </span>
        </div>
        <p>{check.summary}</p>
        <small>
          Score {check.score}/100 · {check.issueCount} issue(s)
        </small>
      </header>

      {check.issues.length ? (
        <ul className="integrity-issue-card__list">
          {check.issues.map((item) => (
            <li key={item.id} className={`integrity-issue-card__item integrity-issue-card__item--${item.severity}`}>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="integrity-issue-card__ok">No integrity violations detected.</p>
      )}
    </article>
  );
}
