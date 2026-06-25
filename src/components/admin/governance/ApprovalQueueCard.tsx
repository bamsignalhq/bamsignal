import {
  GOVERNANCE_APPROVAL_DOMAIN_LABELS,
  GOVERNANCE_APPROVAL_STATUS_LABELS
} from "../../../constants/institutionalGovernance";
import type { ApprovalRequestRecord } from "../../../types/institutionalGovernance";

type ApprovalQueueCardProps = {
  queue: ApprovalRequestRecord[];
};

export function ApprovalQueueCard({ queue }: ApprovalQueueCardProps) {
  return (
    <section className="governance-card approval-queue-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Approval queue</h3>
        <p>Maker/checker separation — nobody may approve their own request.</p>
      </header>
      {queue.length === 0 ? (
        <p className="concierge-consultant__empty">No pending approvals.</p>
      ) : (
        <ul className="approval-queue-card__list">
          {queue.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{GOVERNANCE_APPROVAL_DOMAIN_LABELS[item.domainId]}</span>
              <span>{GOVERNANCE_APPROVAL_STATUS_LABELS[item.status]}</span>
              <p>Maker: {item.makerEmail}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
