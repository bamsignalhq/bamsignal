import { SIGNAL_CONCIERGE_PROMISES } from "../../constants/signalConcierge";

export function SignalConciergePromises() {
  return (
    <section className="sc-section" aria-labelledby="sc-promises-title">
      <h2 id="sc-promises-title" className="sc-section__eyebrow">
        Four promises
      </h2>
      <div className="sc-promises">
        {SIGNAL_CONCIERGE_PROMISES.map((promise, index) => (
          <article
            key={promise.id}
            className="sc-promise signal-concierge-glass sc-reveal"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <h3 className="sc-promise__title">{promise.title}</h3>
            <p className="sc-promise__body">{promise.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
