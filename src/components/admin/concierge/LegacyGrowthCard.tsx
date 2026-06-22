import type { JourneyIntelligenceLegacyGrowthSignal } from "../../../types/journeyIntelligence";

type LegacyGrowthCardProps = {
  growth: JourneyIntelligenceLegacyGrowthSignal[];
};

export function LegacyGrowthCard({ growth }: LegacyGrowthCardProps) {
  return (
    <section className="journey-intelligence-card legacy-growth-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Legacy growth</h3>
        <p>Legacy families and success stories over the last 90 days — celebrated privately.</p>
      </header>
      {growth.length === 0 ? (
        <p className="concierge-consultant__empty">No legacy growth signals yet.</p>
      ) : (
        <ul className="legacy-growth-card__list">
          {growth.map((signal) => (
            <li key={signal.id} className={`legacy-growth-card__item--${signal.direction}`}>
              <div className="legacy-growth-card__head">
                <strong>{signal.label}</strong>
                <span>
                  {signal.recent} recent · {signal.prior} prior
                </span>
                <em>{signal.direction === "up" ? "Growing" : signal.direction === "down" ? "Quieter" : "Steady"}</em>
              </div>
              <p>{signal.narrative}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
