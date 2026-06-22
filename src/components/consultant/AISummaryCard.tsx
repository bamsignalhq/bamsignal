import { AI_ASSISTED_DRAFT_LABEL, AI_ASSISTED_REVIEW_LABEL } from "../../constants/aiAssistedConsultant";
import type { AIAssistedSummarySection } from "../../types/aiAssistedConsultant";

type AISummaryCardProps = {
  memberName: string;
  summaries: AIAssistedSummarySection[];
};

export function AISummaryCard({ memberName, summaries }: AISummaryCardProps) {
  return (
    <section className="ai-assist-card ai-summary-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>AI Summaries</h3>
        <p>
          {AI_ASSISTED_DRAFT_LABEL} · {AI_ASSISTED_REVIEW_LABEL}
        </p>
      </header>
      <p className="ai-assist-card__member">
        <strong>{memberName}</strong>
      </p>
      <dl className="ai-summary-card__sections">
        {summaries.map((section) => (
          <div key={section.id}>
            <dt>{section.label}</dt>
            <dd>{section.summary}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
