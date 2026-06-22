import type { AIAssistedObservation } from "../../types/aiAssistedConsultant";

type AIObservationCardProps = {
  observations: AIAssistedObservation[];
};

export function AIObservationCard({ observations }: AIObservationCardProps) {
  return (
    <section className="ai-assist-card ai-observation-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Suggested Observations</h3>
        <p>Observations for your judgment — not instructions or decisions.</p>
      </header>
      {observations.length === 0 ? (
        <p className="concierge-consultant__empty">No observations drafted yet.</p>
      ) : (
        <ul className="ai-assist-insights">
          {observations.map((observation) => (
            <li key={observation.id} className={`ai-assist-insights__item--${observation.tone}`}>
              <strong>{observation.title}</strong>
              <span>{observation.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
