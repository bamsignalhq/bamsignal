import { FINANCE_AREA_LABELS, FINANCE_STATUS_LABELS } from "../../../constants/financeOperations";
import type { FinanceRecord } from "../../../types/financeOperations";

type PaymentStatusCardProps = {
  records: FinanceRecord[];
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string) => void;
};

export function PaymentStatusCard({
  records,
  selectedRecordId,
  onSelectRecord
}: PaymentStatusCardProps) {
  const paymentRecords = records.filter(
    (record) =>
      record.areaId === "consultation-fees" ||
      record.areaId === "failed-payments" ||
      record.areaId === "pending-settlements"
  );

  return (
    <section className="payment-status-card concierge-consultant-card--glass cc-reveal">
      <header className="payment-status-card__head">
        <h3>Payment status</h3>
        <p>Consultation fees, failed payments, and pending settlements.</p>
      </header>

      {paymentRecords.length ? (
        <ul className="payment-status-card__list">
          {paymentRecords.map((record) => (
            <li key={record.id}>
              <button
                type="button"
                className={`payment-status-card__item${
                  selectedRecordId === record.id ? " is-selected" : ""
                }`}
                onClick={() => onSelectRecord(record.id)}
              >
                <strong>{record.transactionRef}</strong>
                <span className={`payment-status-card__status payment-status-card__status--${record.status}`}>
                  {FINANCE_STATUS_LABELS[record.status]}
                </span>
                <span>{FINANCE_AREA_LABELS[record.areaId]}</span>
                <span>₦{record.amountNgn.toLocaleString("en-NG")}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="payment-status-card__empty">No payment records match filters.</p>
      )}
    </section>
  );
}
