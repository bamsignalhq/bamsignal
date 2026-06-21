import { SIGNAL_CONCIERGE_PROCESS } from "../../constants/signalConcierge";

export function SignalConciergeProcess() {
  return (
    <section className="sc-section" aria-labelledby="sc-process-title">
      <h2 id="sc-process-title" className="sc-section__eyebrow">
        How it works
      </h2>
      <p className="sc-section__lead sc-section__lead--center">
        Human-led matchmaking from first conversation to meaningful introduction.
      </p>
      <ol className="sc-process">
        {SIGNAL_CONCIERGE_PROCESS.map((step, index) => (
          <li
            key={step.id}
            className="sc-process__step signal-concierge-glass sc-reveal"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span className="sc-process__index" aria-hidden>
              {step.step}
            </span>
            <div className="sc-process__copy">
              <h3 className="sc-process__title">{step.title}</h3>
              <p className="sc-process__detail">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
