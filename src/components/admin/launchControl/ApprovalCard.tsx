import type { LaunchApprovalRecord, LaunchControlSummary } from "../../../types/launchControlCenter";

type ApprovalCardProps = {
  summary: LaunchControlSummary;
  approvals: LaunchApprovalRecord[];
  recommendations: string[];
};

export function ApprovalCard({ summary, approvals, recommendations }: ApprovalCardProps) {
  return (
    <section className="launch-control-card approval-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-control-card__head">
        <h3>Go / No-Go</h3>
        <p>Overall readiness, critical issues, recommendations, and sign-off.</p>
      </header>
      <div className="approval-card__summary">
        <article>
          <span>Overall readiness</span>
          <strong>{summary.overallReadinessPercent}%</strong>
        </article>
        <article>
          <span>Critical issues</span>
          <strong>{summary.criticalIssues}</strong>
        </article>
        <article>
          <span>Recommendation</span>
          <strong className={`approval-card__go approval-card__go--${summary.goNoGoRecommendation}`}>
            {summary.goNoGoRecommendation.toUpperCase()}
          </strong>
        </article>
      </div>
      <ul className="approval-card__signoffs">
        {approvals.map((approval) => (
          <li key={approval.id}>
            <strong>{approval.role === "executive" ? "Executive sign-off" : "Founder sign-off"}</strong>
            <span className={`approval-card__status approval-card__status--${approval.status}`}>
              {approval.status}
            </span>
            {approval.signedBy ? <span>{approval.signedBy}</span> : null}
            {approval.notes ? <p>{approval.notes}</p> : null}
          </li>
        ))}
      </ul>
      {recommendations.length ? (
        <ul className="approval-card__recommendations">
          {recommendations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
