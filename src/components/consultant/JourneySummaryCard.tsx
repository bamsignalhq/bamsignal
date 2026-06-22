import { AI_ASSISTED_DRAFT_LABEL } from "../../constants/aiAssistedConsultant";
import type { AIAssistedDraftItem } from "../../types/aiAssistedConsultant";

type JourneySummaryCardProps = {
  timeline: AIAssistedDraftItem[];
  followUps: AIAssistedDraftItem[];
  relationshipHealth: AIAssistedDraftItem[];
};

export function JourneySummaryCard({ timeline, followUps, relationshipHealth }: JourneySummaryCardProps) {
  return (
    <section className="ai-assist-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Journey Summary</h3>
        <p>{AI_ASSISTED_DRAFT_LABEL} — timeline, follow-ups, and relationship health.</p>
      </header>

      <div className="ai-assist-journey__section">
        <h4>Timeline</h4>
        {timeline.length === 0 ? (
          <p className="concierge-consultant__empty">No timeline events yet.</p>
        ) : (
          <ul className="ai-assist-drafts">
            {timeline.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="ai-assist-journey__section">
        <h4>Follow-up suggestions</h4>
        {followUps.length === 0 ? (
          <p className="concierge-consultant__empty">No follow-up suggestions.</p>
        ) : (
          <ul className="ai-assist-drafts">
            {followUps.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="ai-assist-journey__section">
        <h4>Relationship health</h4>
        <ul className="ai-assist-drafts">
          {relationshipHealth.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
