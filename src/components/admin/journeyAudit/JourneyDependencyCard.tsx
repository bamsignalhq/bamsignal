import { JOURNEY_HEALTH_STATUS_LABELS } from "../../../constants/journeyIntegrityAudit";
import type { JourneyDependency } from "../../../types/journeyIntegrityAudit";

type JourneyDependencyCardProps = {
  dependencies: JourneyDependency[];
};

export function JourneyDependencyCard({ dependencies }: JourneyDependencyCardProps) {
  const broken = dependencies.filter((dependency) => !dependency.linked);

  return (
    <section className="journey-dependency-card concierge-consultant-card--glass cc-reveal">
      <header className="journey-dependency-card__head">
        <h3>Journey dependencies</h3>
        <p>
          Cross-system references — {dependencies.length} dependency check(s), {broken.length} unlinked.
        </p>
      </header>

      <div className="journey-dependency-card__list">
        {dependencies.map((dependency) => (
          <article
            key={dependency.id}
            className={`journey-dependency-card__row journey-dependency-card__row--${dependency.status}`}
          >
            <div>
              <strong>{dependency.journeyId}</strong>
              <p>
                {dependency.system} · {dependency.recordType}
              </p>
              {dependency.note ? <small>{dependency.note}</small> : null}
            </div>
            <span className={`journey-audit-badge journey-audit-badge--${dependency.status}`}>
              {dependency.linked ? "Linked" : JOURNEY_HEALTH_STATUS_LABELS[dependency.status]}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
