import { REFUND_REQUEST_STATUS_LABELS } from "../../../constants/financeOperations";
import type { RefundApprovalRecord, RefundRequestRecord } from "../../../types/financeOperations";

type RefundQueueCardProps = {
  refunds: RefundRequestRecord[];
  approvals: RefundApprovalRecord[];
};

function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function RefundQueueCard({ refunds, approvals }: RefundQueueCardProps) {
  const pending = refunds.filter((item) => item.status === "pending");

  return (
    <section className="finance-card refund-queue-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Refund queue</h3>
        <p>
          Refunds require approval — no self-approval. {pending.length} pending.
        </p>
      </header>
      <ul className="finance-list">
        {refunds.map((refund) => {
          const approval = approvals.find((item) => item.refundRequestId === refund.id);
          return (
            <li key={refund.id} className={`finance-list__item finance-list__item--${refund.status}`}>
              <div>
                <strong>{refund.refundRef}</strong>
                <span>{REFUND_REQUEST_STATUS_LABELS[refund.status]}</span>
              </div>
              <div className="finance-list__meta">
                <span>{formatNgn(refund.amountNgn)}</span>
                <span>Requested by {refund.requestedByEmail}</span>
                {approval ? <span>Approved by {approval.approverEmail}</span> : null}
              </div>
              <p>{refund.reason}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
