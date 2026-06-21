import {
  SIGNAL_CONCIERGE_NO_PRESSURE_BODY,
  SIGNAL_CONCIERGE_NO_PRESSURE_HEADLINE
} from "../../constants/signalConcierge";

export function SignalConciergeNoPressureCard() {
  return (
    <article className="sc-gate-card signal-concierge-glass sc-gate-card--no-pressure">
      <h3 className="sc-gate-card__title">{SIGNAL_CONCIERGE_NO_PRESSURE_HEADLINE}</h3>
      <p className="sc-gate-card__body">{SIGNAL_CONCIERGE_NO_PRESSURE_BODY}</p>
    </article>
  );
}
