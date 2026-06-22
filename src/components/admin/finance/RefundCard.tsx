import { FINANCE_STATUS_LABELS } from "../../../constants/financeOperations";
import type { FinanceRecord } from "../../../types/financeOperations";

type RefundCardProps = {
  records: FinanceRecord[];
};

export function RefundCard({ records }: RefundCardProps) {
  const refundRecords = records.filter((record) => record.areaId === "refunds");

  return (
    <section className="refund-card concierge-consultant-card--glass cc-reveal">
      <header className="refund-card__head">
        <h3>Refunds</h3>
        <p>Refund transactions linked to audit trail.</p>
      </header>

      {refundRecords.length ? (
        <ul className="refund-card__list">
          {refundRecords.map((record) => (
            <li key={record.id}>
              <strong>{record.transactionRef}</strong>
              <span>{FINANCE_STATUS_LABELS[record.status]}</span>
              <span>₦{record.amountNgn.toLocaleString("en-NG")}</span>
              {record.auditRef ? <span>Audit: {record.auditRef}</span> : null}
              <p>{record.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="refund-card__empty">No refunds in current view.</p>
      )}
    </section>
  );
}
