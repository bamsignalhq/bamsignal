import {
  SIGNAL_CONCIERGE_CONFIDENTIALITY_BODY,
  SIGNAL_CONCIERGE_CONFIDENTIALITY_HEADLINE,
  SIGNAL_CONCIERGE_CONFIDENTIALITY_NOTE
} from "../../constants/signalConcierge";

export function SignalConciergeConfidentiality() {
  return (
    <section className="sc-section sc-confidentiality" aria-labelledby="sc-confidentiality-title">
      <div className="sc-confidentiality__card signal-concierge-glass sc-reveal">
        <h2 id="sc-confidentiality-title" className="sc-section__title">
          {SIGNAL_CONCIERGE_CONFIDENTIALITY_HEADLINE}
        </h2>
        <p className="sc-section__lead">{SIGNAL_CONCIERGE_CONFIDENTIALITY_BODY}</p>
        <p className="sc-section__note">{SIGNAL_CONCIERGE_CONFIDENTIALITY_NOTE}</p>
      </div>
    </section>
  );
}
