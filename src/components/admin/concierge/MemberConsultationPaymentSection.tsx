import { useMemo } from "react";
import { CONSULTATION_PAYMENT_ENGINE_BRAND } from "../../../constants/consultationPayment";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { ensureConsultationPaymentForMember } from "../../../utils/ConsultationPaymentEngine";
import { buildPaymentSummary } from "../../../utils/consultationPaymentLogic";
import { ConsultationPaymentCard } from "./ConsultationPaymentCard";
import { PaymentReceiptCard } from "./PaymentReceiptCard";
import { PaymentTimelineCard } from "./PaymentTimelineCard";

type MemberConsultationPaymentSectionProps = {
  member: ConciergeMemberRecord;
};

export function MemberConsultationPaymentSection({ member }: MemberConsultationPaymentSectionProps) {
  const bundle = useMemo(() => {
    const payment = ensureConsultationPaymentForMember(member);
    const summary = buildPaymentSummary(payment);
    return { payment, summary };
  }, [member]);

  return (
    <section className="member-consultation-payment">
      <header className="member-consultation-payment__section-head cc-reveal">
        <h2>Consultation payment</h2>
        <p>{CONSULTATION_PAYMENT_ENGINE_BRAND} — permanent records for the ₦100,000 consultation fee.</p>
      </header>

      <div className="member-consultation-payment__cards">
        <ConsultationPaymentCard summary={bundle.summary} />
        {bundle.payment.receipt ? <PaymentReceiptCard receipt={bundle.payment.receipt} /> : null}
        <PaymentTimelineCard timeline={bundle.payment.timeline} />
      </div>
    </section>
  );
}
