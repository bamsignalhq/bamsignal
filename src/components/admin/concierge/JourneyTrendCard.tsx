import type { JourneyAnalyticsTrendPoint } from "../../../types/journeyAnalytics";

type JourneyTrendCardProps = {
  trends: JourneyAnalyticsTrendPoint[];
};

export function JourneyTrendCard({ trends }: JourneyTrendCardProps) {
  const peak = Math.max(...trends.map((point) => point.value), 1);

  return (
    <section className="journey-analytics-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Journey Rhythm</h3>
        <p>Milestone activity by month — consultations, introductions, and relationship updates.</p>
      </header>
      {trends.length === 0 ? (
        <p className="concierge-consultant__empty">No milestone rhythm recorded yet.</p>
      ) : (
        <ul className="journey-analytics-trends" aria-label="Monthly journey rhythm">
          {trends.map((point) => (
            <li key={point.id}>
              <span className="journey-analytics-trends__label">{point.label}</span>
              <div className="journey-analytics-trends__bar" aria-hidden>
                <span style={{ width: `${Math.max(8, (point.value / peak) * 100)}%` }} />
              </div>
              <strong>{point.value}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
