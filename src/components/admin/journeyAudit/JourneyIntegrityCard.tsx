import { JOURNEY_HEALTH_STATUS_LABELS } from "../../../constants/journeyIntegrityAudit";
import type { JourneyRecord } from "../../../types/journeyIntegrityAudit";

type JourneyIntegrityCardProps = {
  journeys: JourneyRecord[];
  query: string;
};

export function JourneyIntegrityCard({ journeys, query }: JourneyIntegrityCardProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = journeys.filter((journey) => {
    if (!normalizedQuery) return true;
    return (
      journey.journeyId.toLowerCase().includes(normalizedQuery) ||
      (journey.memberId ?? "").toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <section className="journey-integrity-card concierge-consultant-card--glass cc-reveal">
      <header className="journey-integrity-card__head">
        <h3>Journey integrity</h3>
        <p>Canonical member registry — {filtered.length} journey record(s).</p>
      </header>

      <div className="journey-integrity-card__list">
        {filtered.map((journey) => (
          <article
            key={journey.id}
            className={`journey-integrity-card__row journey-integrity-card__row--${journey.status}`}
          >
            <div>
              <strong>{journey.journeyId}</strong>
              <p>{journey.memberId ?? "No member ID"}</p>
            </div>
            <span className={`journey-audit-badge journey-audit-badge--${journey.status}`}>
              {JOURNEY_HEALTH_STATUS_LABELS[journey.status]}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
