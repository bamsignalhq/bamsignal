import { PERMISSION_SECURITY_STATUS_LABELS } from "../../../constants/permissionsAudit";
import type { SecurityIssue } from "../../../types/permissionsAudit";

type SecurityIssueCardProps = {
  issues: SecurityIssue[];
};

const ISSUE_KIND_LABELS: Record<SecurityIssue["kind"], string> = {
  "privilege-escalation": "Privilege escalation",
  "unprotected-route": "Unprotected route",
  "role-overlap": "Role overlap",
  "access-inconsistency": "Access inconsistency"
};

export function SecurityIssueCard({ issues }: SecurityIssueCardProps) {
  const flagged = issues.filter((issue) => issue.status !== "secure");

  return (
    <section className="security-issue-card concierge-consultant-card--glass cc-reveal">
      <header className="security-issue-card__head">
        <h3>Security issues</h3>
        <p>Privilege escalation, unprotected routes, role overlap, and access inconsistencies.</p>
      </header>

      <ul className="security-issue-card__list">
        {flagged.map((issue) => (
          <li key={issue.id}>
            <div className="security-issue-card__item-head">
              <strong>{issue.title}</strong>
              <span>{PERMISSION_SECURITY_STATUS_LABELS[issue.status]}</span>
            </div>
            <p className="security-issue-card__kind">{ISSUE_KIND_LABELS[issue.kind]}</p>
            <p>{issue.summary}</p>
            {issue.affectedPaths.length ? (
              <p className="security-issue-card__paths">{issue.affectedPaths.join(" · ")}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
