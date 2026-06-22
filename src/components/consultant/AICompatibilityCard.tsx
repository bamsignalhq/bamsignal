import { AI_ASSISTED_DRAFT_LABEL } from "../../constants/aiAssistedConsultant";
import type { AIAssistedDraftItem } from "../../types/aiAssistedConsultant";

type AICompatibilityCardProps = {
  compatibilityAreas: AIAssistedDraftItem[];
};

export function AICompatibilityCard({ compatibilityAreas }: AICompatibilityCardProps) {
  return (
    <section className="ai-assist-card ai-compatibility-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Suggested Compatibility Areas</h3>
        <p>{AI_ASSISTED_DRAFT_LABEL} — AI does not score, approve, or match members.</p>
      </header>
      {compatibilityAreas.length === 0 ? (
        <p className="concierge-consultant__empty">No compatibility areas suggested yet.</p>
      ) : (
        <ul className="ai-assist-drafts">
          {compatibilityAreas.map((item) => (
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
