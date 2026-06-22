import { CONSULTATION_PAYMENT_AMOUNT_LABEL, CONSULTATION_PAYMENT_FEE_LABEL } from "../../constants/consultationPayment";
import type { PaymentSummary } from "../../types/consultationPayment";

type PaymentSuccessCardProps = {
  summary: PaymentSummary;
  paymentId?: string;
};

export function PaymentSuccessCard({ summary, paymentId }: PaymentSuccessCardProps) {
  return (
    <article className="consultation-payment-status-card consultation-payment-status-card--success signal-concierge-glass sc-reveal">
      <h2>Consultation fee received</h2>
      <p>
        Thank you, {summary.memberName}. Your {CONSULTATION_PAYMENT_FEE_LABEL.toLowerCase()} ({CONSULTATION_PAYMENT_AMOUNT_LABEL}) is confirmed.
      </p>
      <dl className="consultation-payment-status-card__meta">
        <div>
          <dt>Payment ID</dt>
          <dd>{paymentId || summary.paymentId}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{summary.statusLabel}</dd>
        </div>
      </dl>
      <p className="consultation-payment-status-card__note">
        You may now schedule your private consultation. Your steward will meet you with care and discretion.
      </p>
    </article>
  );
}
