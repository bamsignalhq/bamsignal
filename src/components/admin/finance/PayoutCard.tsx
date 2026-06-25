import type { ConsultantPayoutRecord } from "../../../types/financeOperations";
import { FINANCE_STATUS_LABELS } from "../../../constants/financeOperations";

type PayoutCardProps = {
  payouts: ConsultantPayoutRecord[];
};

function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function PayoutCard({ payouts }: PayoutCardProps) {
  const outstanding = payouts
    .filter((item) => item.status === "pending")
    .reduce((sum, item) => sum + item.amountNgn, 0);

  return (
    <section className="finance-card payout-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Consultant payouts</h3>
        <p>Payout tracking — {formatNgn(outstanding)} outstanding.</p>
      </header>
      <ul className="finance-list">
        {payouts.map((payout) => (
          <li key={payout.id} className="finance-list__item">
            <div>
              <strong>{payout.payoutRef}</strong>
              <span>{FINANCE_STATUS_LABELS[payout.status]}</span>
            </div>
            <div className="finance-list__meta">
              <span>{formatNgn(payout.amountNgn)}</span>
              <span>{payout.consultantRef}</span>
              <span>{payout.periodLabel}</span>
              <span>{payout.consultationsCount} consultations</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
