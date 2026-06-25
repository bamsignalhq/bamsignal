import type { ReconciliationLogRecord } from "../../../types/financeOperations";

type ReconciliationCardProps = {
  reconciliations: ReconciliationLogRecord[];
};

function formatNgn(amount?: number): string {
  if (amount == null) return "—";
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function ReconciliationCard({ reconciliations }: ReconciliationCardProps) {
  return (
    <section className="finance-card reconciliation-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Reconciliation</h3>
        <p>Daily, monthly, quarterly, and annual Paystack vs internal ledger reconciliation.</p>
      </header>
      <ul className="finance-list">
        {reconciliations.map((item) => (
          <li key={item.id} className={`finance-list__item finance-list__item--${item.status}`}>
            <div>
              <strong>{item.reconciliationRef}</strong>
              <span className={`finance-pill finance-pill--${item.status}`}>{item.status}</span>
            </div>
            <div className="finance-list__meta">
              <span>{item.reconciliationType}</span>
              <span>Paystack {formatNgn(item.paystackTotalNgn)}</span>
              <span>Internal {formatNgn(item.internalTotalNgn)}</span>
              <span>Variance {formatNgn(item.varianceNgn)}</span>
            </div>
            {item.notes ? <p>{item.notes}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
