import type { ApprovalDecision } from "../../../types/applicationApproval";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";

type DecisionSummaryCardProps = {
  decision: ApprovalDecision;
};

export function DecisionSummaryCard({ decision }: DecisionSummaryCardProps) {
  return (
    <section className="decision-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Decision</h3>
        <p>Final human decision — recorded with dignity.</p>
      </header>
      <div className="decision-summary-card__header">
        <strong>{decision.label}</strong>
        <ApprovalStatusBadge status={decision.status} />
      </div>
      <p className="decision-summary-card__detail">{decision.detail}</p>
      {decision.decidedAt ? (
        <p className="decision-summary-card__meta">
          {decision.decidedBy ? `${decision.decidedBy} · ` : ""}
          <time dateTime={decision.decidedAt}>
            {new Date(decision.decidedAt).toLocaleString()}
          </time>
        </p>
      ) : null}
    </section>
  );
}
