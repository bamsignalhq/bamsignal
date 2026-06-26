import { LAUNCH_READINESS_AREA_LABELS } from "../../../constants/launchReadiness";
import type { LaunchCriticalIssue } from "../../../types/launchReadiness";

type CriticalIssueCardProps = {
  issues: LaunchCriticalIssue[];
};

export function CriticalIssueCard({ issues }: CriticalIssueCardProps) {
  return (
    <section className="critical-issue-card concierge-consultant-card--glass cc-reveal">
      <header className="critical-issue-card__head">
        <h3>Critical issues</h3>
        <p>{issues.length} blocked or critical area(s) requiring review before launch.</p>
      </header>

      {issues.length ? (
        <ul className="critical-issue-card__list">
          {issues.map((issue) => (
            <li key={issue.id} className={`critical-issue-card__item critical-issue-card__item--${issue.status}`}>
              <strong>{issue.title}</strong>
              <p>{issue.summary}</p>
              <small>{LAUNCH_READINESS_AREA_LABELS[issue.areaId]}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p className="critical-issue-card__empty">No critical or blocked systems detected.</p>
      )}
    </section>
  );
}
