import {
  SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT,
  SIGNAL_CONCIERGE_CONSULTATION_FEE_HEADLINE,
  SIGNAL_CONCIERGE_MEMBERSHIP_FROM
} from "../../constants/signalConcierge";

export function SignalConciergeConsultationCard() {
  return (
    <article className="sc-gate-card signal-concierge-glass sc-gate-card--consultation">
      <h3 className="sc-gate-card__title">{SIGNAL_CONCIERGE_CONSULTATION_FEE_HEADLINE}</h3>
      <p className="sc-gate-card__amount">{SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT}</p>
      <p className="sc-gate-card__sub">{SIGNAL_CONCIERGE_MEMBERSHIP_FROM}</p>
    </article>
  );
}
