import { CONSULTATION_PAYMENT_TIMELINE_STEPS } from "../../../constants/consultationPayment";
import type { PaymentTimelineEntry } from "../../../types/consultationPayment";

type PaymentTimelineCardProps = {
  timeline: PaymentTimelineEntry[];
};

export function PaymentTimelineCard({ timeline }: PaymentTimelineCardProps) {
  const reachedKinds = new Set(timeline.map((entry) => entry.kind));

  return (
    <section className="payment-timeline concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Payment timeline</h3>
        <p>Append-only — permanent consultation payment history.</p>
      </header>
      <ol className="payment-timeline__pipeline">
        {CONSULTATION_PAYMENT_TIMELINE_STEPS.map((step) => {
          const reached = reachedKinds.has(step.kind);
          const entry = timeline.find((item) => item.kind === step.kind);
          return (
            <li
              key={step.kind}
              className={`payment-timeline__step${reached ? " payment-timeline__step--reached" : ""}${
                entry && step.kind === timeline[timeline.length - 1]?.kind
                  ? " payment-timeline__step--active"
                  : ""
              }`}
            >
              <span className="payment-timeline__dot" aria-hidden />
              <div>
                <strong>{step.label}</strong>
                <span>{entry?.detail ?? step.detail}</span>
                {entry ? (
                  <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      {timeline
        .filter(
          (entry) =>
            entry.kind === "payment-failed" ||
            entry.kind === "payment-refunded" ||
            entry.kind === "payment-cancelled"
        )
        .map((entry) => (
          <div key={entry.id} className="payment-timeline__terminal">
            <strong>{entry.label}</strong>
            <span>{entry.detail}</span>
            <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
          </div>
        ))}
    </section>
  );
}
