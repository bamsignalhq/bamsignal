import type { JourneyAnalyticsOutcome } from "../../../types/journeyAnalytics";

type JourneyOutcomeCardProps = {
  outcomes: JourneyAnalyticsOutcome[];
};

export function JourneyOutcomeCard({ outcomes }: JourneyOutcomeCardProps) {
  return (
    <section className="journey-analytics-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Journey Outcomes</h3>
        <p>How members move from application to legacy — told as stories, not funnels.</p>
      </header>
      <ul className="journey-analytics-outcomes">
        {outcomes.map((outcome) => (
          <li key={outcome.id}>
            <div className="journey-analytics-outcomes__copy">
              <strong>{outcome.label}</strong>
              <p>{outcome.narrative}</p>
            </div>
            <span className="journey-analytics-outcomes__count">{outcome.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
