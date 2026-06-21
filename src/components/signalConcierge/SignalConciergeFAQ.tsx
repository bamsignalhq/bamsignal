import { SIGNAL_CONCIERGE_FAQ } from "../../constants/signalConcierge";

export function SignalConciergeFAQ() {
  return (
    <section className="signal-concierge-section" aria-labelledby="sc-faq-title">
      <h2 id="sc-faq-title" className="signal-concierge-section__title">
        Questions
      </h2>
      <div className="signal-concierge-faq">
        {SIGNAL_CONCIERGE_FAQ.map((item) => (
          <details key={item.question} className="signal-concierge-glass">
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
