import { CONSULTATION_PAYMENT_FEE_LABEL } from "../../../constants/consultationPayment";
import type { PaymentReceipt } from "../../../types/consultationPayment";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

type PaymentReceiptCardProps = {
  receipt: PaymentReceipt;
};

export function PaymentReceiptCard({ receipt }: PaymentReceiptCardProps) {
  return (
    <section className="payment-receipt concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Receipt</h3>
        <p>Permanent record — luxury service, human-first.</p>
      </header>
      <div className="payment-receipt__header">
        <div>
          <span>{CONSULTATION_PAYMENT_FEE_LABEL}</span>
          <strong>{receipt.amountLabel}</strong>
        </div>
        <PaymentStatusBadge status={receipt.status} />
      </div>
      <dl className="payment-receipt__grid">
        <div>
          <dt>Payment ID</dt>
          <dd className="payment-receipt__payment-id">{receipt.paymentId}</dd>
        </div>
        <div>
          <dt>Member</dt>
          <dd>{receipt.memberName}</dd>
        </div>
        {receipt.journeyId ? (
          <div>
            <dt>Journey ID</dt>
            <dd className="payment-receipt__journey-id">{receipt.journeyId}</dd>
          </div>
        ) : null}
        <div>
          <dt>Issued</dt>
          <dd>
            <time dateTime={receipt.issuedAt}>{new Date(receipt.issuedAt).toLocaleString()}</time>
          </dd>
        </div>
      </dl>
      <p className="payment-receipt__narrative">{receipt.narrative}</p>
    </section>
  );
}
