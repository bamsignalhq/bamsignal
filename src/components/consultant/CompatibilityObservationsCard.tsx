import { AI_ASSISTED_DRAFT_LABEL } from "../../constants/aiAssistedConsultant";
import type { AIAssistedDraftItem } from "../../types/aiAssistedConsultant";

type CompatibilityObservationsCardProps = {
  observations: AIAssistedDraftItem[];
};

export function CompatibilityObservationsCard({ observations }: CompatibilityObservationsCardProps) {
  return (
    <section className="ai-assist-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Compatibility Observations</h3>
        <p>{AI_ASSISTED_DRAFT_LABEL} — AI does not score or match members.</p>
      </header>
      {observations.length === 0 ? (
        <p className="concierge-consultant__empty">No compatibility observations yet.</p>
      ) : (
        <ul className="ai-assist-drafts">
          {observations.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
