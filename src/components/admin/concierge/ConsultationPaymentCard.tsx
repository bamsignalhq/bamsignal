import {
  CONSULTATION_PAYMENT_ENGINE_BRAND,
  CONSULTATION_PAYMENT_FEE_LABEL,
  CONSULTATION_PAYMENT_ID_LABEL,
  CONSULTATION_PAYMENT_MEMBERSHIP_NOTE
} from "../../../constants/consultationPayment";
import type { PaymentSummary } from "../../../types/consultationPayment";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

type ConsultationPaymentCardProps = {
  summary: PaymentSummary;
};

export function ConsultationPaymentCard({ summary }: ConsultationPaymentCardProps) {
  return (
    <section className="consultation-payment-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Consultation fee</h3>
        <p>{CONSULTATION_PAYMENT_ENGINE_BRAND}</p>
      </header>
      <div className="consultation-payment-card__amount">
        <span>{CONSULTATION_PAYMENT_FEE_LABEL}</span>
        <strong>{summary.amountLabel}</strong>
      </div>
      <dl className="consultation-payment-card__grid">
        <div>
          <dt>{CONSULTATION_PAYMENT_ID_LABEL}</dt>
          <dd className="consultation-payment-card__payment-id">{summary.paymentId}</dd>
        </div>
        <div>
          <dt>Payment status</dt>
          <dd>
            <PaymentStatusBadge status={summary.status} />
          </dd>
        </div>
      </dl>
      <p className="consultation-payment-card__note">{CONSULTATION_PAYMENT_MEMBERSHIP_NOTE}</p>
      <p className="consultation-payment-card__narrative">{summary.narrative}</p>
    </section>
  );
}
