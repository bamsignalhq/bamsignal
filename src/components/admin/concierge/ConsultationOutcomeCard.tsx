import { CONSULTATION_OUTCOME_LABELS } from "../../../constants/consultationReview";
import type { ConsultationOutcome } from "../../../types/consultationReview";

type ConsultationOutcomeCardProps = {
  outcome: ConsultationOutcome;
  heldAt?: string;
  consultantName?: string;
};

export function ConsultationOutcomeCard({ outcome, heldAt, consultantName }: ConsultationOutcomeCardProps) {
  return (
    <section className="consultation-outcome-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Consultation outcome</h3>
        <p>Formal review outcome from Consultation Review Engine™.</p>
      </header>
      <div className="consultation-outcome-card__badge-wrap">
        <span className={`consultation-outcome-card__badge consultation-outcome-card__badge--${outcome}`}>
          {CONSULTATION_OUTCOME_LABELS[outcome]}
        </span>
      </div>
      <dl className="consultation-outcome-card__meta">
        {consultantName ? (
          <div>
            <dt>Steward</dt>
            <dd>{consultantName}</dd>
          </div>
        ) : null}
        {heldAt ? (
          <div>
            <dt>Consultation held</dt>
            <dd>
              <time dateTime={heldAt}>{new Date(heldAt).toLocaleString()}</time>
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
