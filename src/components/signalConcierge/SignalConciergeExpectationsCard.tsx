import {
  SIGNAL_CONCIERGE_CONSULTATION_CHANNELS,
  SIGNAL_CONCIERGE_CONSULTATION_TIMING,
  SIGNAL_CONCIERGE_EXPECTATIONS,
  SIGNAL_CONCIERGE_EXPECTATIONS_TITLE
} from "../../constants/signalConcierge";

export function SignalConciergeExpectationsCard() {
  return (
    <article className="sc-gate-card signal-concierge-glass sc-gate-card--expectations">
      <h3 className="sc-gate-card__title">{SIGNAL_CONCIERGE_EXPECTATIONS_TITLE}</h3>
      <ul className="sc-gate-card__list">
        {SIGNAL_CONCIERGE_EXPECTATIONS.map((item) => (
          <li key={item}>
            <span className="sc-gate-card__check" aria-hidden>
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="sc-gate-card__timing">
        <p className="sc-gate-card__timing-label">Timing</p>
        <p className="sc-gate-card__timing-value">{SIGNAL_CONCIERGE_CONSULTATION_TIMING}</p>
        <ul className="sc-gate-card__channels">
          {SIGNAL_CONCIERGE_CONSULTATION_CHANNELS.map((channel) => (
            <li key={channel.id}>{channel.label}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
