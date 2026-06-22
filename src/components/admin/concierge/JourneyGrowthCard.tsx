import type { JourneyAnalyticsGrowthSignal } from "../../../types/journeyAnalytics";

type JourneyGrowthCardProps = {
  growth: JourneyAnalyticsGrowthSignal[];
};

export function JourneyGrowthCard({ growth }: JourneyGrowthCardProps) {
  return (
    <section className="journey-analytics-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Growth Signals</h3>
        <p>Last 90 days compared to the prior quarter — care over volume.</p>
      </header>
      <ul className="journey-analytics-growth">
        {growth.map((signal) => (
          <li key={signal.id} className={`journey-analytics-growth__item--${signal.direction}`}>
            <div className="journey-analytics-growth__head">
              <strong>{signal.label}</strong>
              <span>
                {signal.recent} <em>vs {signal.prior}</em>
              </span>
            </div>
            <p>{signal.narrative}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
