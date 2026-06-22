import { CONSULTATION_PAYMENT_AMOUNT_LABEL } from "../../constants/consultationPayment";

type PaymentPendingCardProps = {
  detail?: string;
};

export function PaymentPendingCard({
  detail = `We are confirming your ${CONSULTATION_PAYMENT_AMOUNT_LABEL} consultation fee. This usually takes a moment.`
}: PaymentPendingCardProps) {
  return (
    <article className="consultation-payment-status-card consultation-payment-status-card--pending signal-concierge-glass sc-reveal">
      <h2>Confirming payment</h2>
      <p>{detail}</p>
      <p className="consultation-payment-status-card__note">
        Please keep this page open. You will be able to schedule your consultation as soon as payment is confirmed.
      </p>
    </article>
  );
}
