import { CONSULTATION_PAYMENT_STATUS_LABELS } from "../../../constants/consultationPayment";
import type { ConsultationPaymentStatus } from "../../../types/consultationPayment";

type PaymentStatusBadgeProps = {
  status: ConsultationPaymentStatus;
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={`payment-status-badge payment-status-badge--${status}`}>
      {CONSULTATION_PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
