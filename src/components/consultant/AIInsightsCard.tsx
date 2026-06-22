import type { AIAssistedInsight } from "../../types/aiAssistedConsultant";

type AIInsightsCardProps = {
  insights: AIAssistedInsight[];
};

export function AIInsightsCard({ insights }: AIInsightsCardProps) {
  return (
    <section className="ai-assist-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>AI Insights</h3>
        <p>Observations for your judgment — not instructions.</p>
      </header>
      {insights.length === 0 ? (
        <p className="concierge-consultant__empty">No insights drafted yet.</p>
      ) : (
        <ul className="ai-assist-insights">
          {insights.map((insight) => (
            <li key={insight.id} className={`ai-assist-insights__item--${insight.tone}`}>
              <strong>{insight.title}</strong>
              <span>{insight.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
