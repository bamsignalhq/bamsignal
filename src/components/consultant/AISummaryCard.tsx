import { AI_ASSISTED_DRAFT_LABEL, AI_ASSISTED_REVIEW_LABEL } from "../../constants/aiAssistedConsultant";

type AISummaryCardProps = {
  memberName: string;
  summary: string;
};

export function AISummaryCard({ memberName, summary }: AISummaryCardProps) {
  return (
    <section className="ai-assist-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>AI Summary</h3>
        <p>
          {AI_ASSISTED_DRAFT_LABEL} · {AI_ASSISTED_REVIEW_LABEL}
        </p>
      </header>
      <p className="ai-assist-card__summary">
        <strong>{memberName}</strong> — {summary}
      </p>
    </section>
  );
}
