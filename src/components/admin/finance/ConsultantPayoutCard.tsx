import { FINANCE_STATUS_LABELS } from "../../../constants/financeOperations";
import type { FinanceRecord } from "../../../types/financeOperations";

type ConsultantPayoutCardProps = {
  records: FinanceRecord[];
};

export function ConsultantPayoutCard({ records }: ConsultantPayoutCardProps) {
  const payoutRecords = records.filter((record) => record.areaId === "consultant-payouts");

  return (
    <section className="consultant-payout-card concierge-consultant-card--glass cc-reveal">
      <header className="consultant-payout-card__head">
        <h3>Consultant payouts</h3>
        <p>Scheduled and settled consultant payments.</p>
      </header>

      {payoutRecords.length ? (
        <ul className="consultant-payout-card__list">
          {payoutRecords.map((record) => (
            <li key={record.id}>
              <strong>{record.consultantRef ?? "—"}</strong>
              <span className={`consultant-payout-card__status consultant-payout-card__status--${record.status}`}>
                {FINANCE_STATUS_LABELS[record.status]}
              </span>
              <span>₦{record.amountNgn.toLocaleString("en-NG")}</span>
              {record.auditRef ? <span>Audit: {record.auditRef}</span> : null}
              <p>{record.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="consultant-payout-card__empty">No payout records in current view.</p>
      )}
    </section>
  );
}
