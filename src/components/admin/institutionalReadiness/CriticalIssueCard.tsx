import { READINESS_SUBSYSTEM_LABELS } from "../../../constants/institutionalReadiness";
import { navigateToPath } from "../../../constants/routes";
import type { ReadinessCriticalIssue } from "../../../types/institutionalReadiness";

type CriticalIssueCardProps = {
  criticalIssues: ReadinessCriticalIssue[];
  warnings: ReadinessCriticalIssue[];
};

export function CriticalIssueCard({ criticalIssues, warnings }: CriticalIssueCardProps) {
  return (
    <section className="readiness-verification-card critical-issue-card concierge-consultant-card--glass cc-reveal">
      <header className="readiness-verification-card__head">
        <h3>Critical issues & warnings</h3>
        <p>Blockers and warnings surfaced from remediation and subsystem verification.</p>
      </header>

      <div className="critical-issue-card__group">
        <h4>Critical issues ({criticalIssues.length})</h4>
        {criticalIssues.length ? (
          <ul className="readiness-verification-card__list">
            {criticalIssues.map((issue) => (
              <li key={issue.id}>
                <div className="readiness-verification-card__row">
                  <strong>{issue.title}</strong>
                  <span className="readiness-result-badge readiness-result-badge--critical">
                    {READINESS_SUBSYSTEM_LABELS[issue.subsystemId]}
                  </span>
                </div>
                <p>{issue.detail}</p>
                {issue.auditPath ? (
                  <button
                    type="button"
                    className="concierge-consultant-btn concierge-consultant-btn--ghost"
                    onClick={() => navigateToPath(issue.auditPath!)}
                  >
                    Open audit
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="readiness-verification-card__empty">No critical issues.</p>
        )}
      </div>

      <div className="critical-issue-card__group">
        <h4>Warnings ({warnings.length})</h4>
        {warnings.length ? (
          <ul className="readiness-verification-card__list">
            {warnings.slice(0, 8).map((issue) => (
              <li key={issue.id}>
                <strong>{issue.title}</strong>
                <p>{issue.detail}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="readiness-verification-card__empty">No warnings.</p>
        )}
      </div>
    </section>
  );
}
