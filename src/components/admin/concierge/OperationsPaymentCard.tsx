import { CONSULTATION_PAYMENT_STATUS_LABELS } from "../../../constants/consultationPayment";
import { OPERATIONS_PAYMENT_BUCKETS } from "../../../constants/operationsCenter";
import type { OperationsCenterBundle } from "../../../types/operationsCenter";

type OperationsPaymentCardProps = {
  bundle: OperationsCenterBundle;
};

export function OperationsPaymentCard({ bundle }: OperationsPaymentCardProps) {
  return (
    <section className="operations-center-payments concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Payments</h3>
        <p>Consultation Payment Engine™ — Paystack consultation fee lifecycle</p>
      </header>
      {OPERATIONS_PAYMENT_BUCKETS.map((bucket) => {
        const rows = bundle.payments[bucket];
        return (
          <div key={bucket} className="operations-center-panel__block">
            <h4>
              {CONSULTATION_PAYMENT_STATUS_LABELS[bucket]} <strong>{rows.length}</strong>
            </h4>
            {rows.length === 0 ? (
              <p className="concierge-consultant__empty">No {CONSULTATION_PAYMENT_STATUS_LABELS[bucket].toLowerCase()} payments.</p>
            ) : null}
            <ul className="concierge-consultant-list">
              {rows.slice(0, 8).map((row) => (
                <li key={row.id} className="concierge-consultant-list__item">
                  <div>
                    <strong>{row.memberName}</strong>
                    <span>
                      {row.paymentId} · {row.amountLabel}
                    </span>
                    {row.journeyId ? <span>Journey {row.journeyId}</span> : null}
                  </div>
                  <time dateTime={row.updatedAt}>{new Date(row.updatedAt).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
