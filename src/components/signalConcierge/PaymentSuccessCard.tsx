import { COMMERCIAL_PRODUCT_LABELS, COMMERCIAL_RECEIPT } from "../../constants/commercialExperience";
import { CONSULTATION_PAYMENT_AMOUNT_LABEL } from "../../constants/consultationPayment";
import type { PaymentSummary } from "../../types/consultationPayment";
import { CommercialReceiptCard } from "../commercial/CommercialOutcomeCard";

type PaymentSuccessCardProps = {
  summary: PaymentSummary;
  paymentId?: string;
};

export function PaymentSuccessCard({ summary, paymentId }: PaymentSuccessCardProps) {
  return (
    <div className="sc-reveal">
      <CommercialReceiptCard
        productLabel={COMMERCIAL_PRODUCT_LABELS.consultation_fee}
        amountLabel={CONSULTATION_PAYMENT_AMOUNT_LABEL}
        reference={paymentId || summary.paymentId}
        statusLabel={summary.statusLabel || COMMERCIAL_RECEIPT.paid}
        note={`Thank you, ${summary.memberName}. You may now schedule your private consultation. ${COMMERCIAL_RECEIPT.membershipNote}`}
      />
    </div>
  );
}
