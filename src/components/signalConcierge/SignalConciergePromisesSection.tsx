import { SIGNAL_CONCIERGE_PROMISES } from "../../constants/signalConcierge";

export function SignalConciergePromisesSection() {
  return (
    <section className="signal-concierge-section" aria-labelledby="sc-promises-title">
      <h2 id="sc-promises-title" className="signal-concierge-section__title">
        The Four Promises
      </h2>
      <div className="signal-concierge-promises">
        {SIGNAL_CONCIERGE_PROMISES.map((promise) => (
          <article key={promise.id} className="signal-concierge-promise signal-concierge-glass">
            <h3>{promise.title}</h3>
            <p>{promise.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
