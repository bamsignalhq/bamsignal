import { AI_ASSISTED_DRAFT_LABEL } from "../../constants/aiAssistedConsultant";
import type { AIAssistedDraftItem } from "../../types/aiAssistedConsultant";

type AIFollowUpCardProps = {
  followUpTopics: AIAssistedDraftItem[];
};

export function AIFollowUpCard({ followUpTopics }: AIFollowUpCardProps) {
  return (
    <section className="ai-assist-card ai-followup-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Suggested Follow-up Topics</h3>
        <p>{AI_ASSISTED_DRAFT_LABEL} — consultant schedules and completes.</p>
      </header>
      {followUpTopics.length === 0 ? (
        <p className="concierge-consultant__empty">No follow-up topics suggested yet.</p>
      ) : (
        <ul className="ai-assist-drafts">
          {followUpTopics.map((item) => (
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
