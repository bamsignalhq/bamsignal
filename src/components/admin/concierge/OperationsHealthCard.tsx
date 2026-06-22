import { OPERATION_HEALTH_LEVELS } from "../../../constants/conciergeOperations";
import type { ConciergeOperation } from "../../../types/conciergeOperations";

type OperationsHealthCardProps = {
  operation: ConciergeOperation;
};

export function OperationsHealthCard({ operation }: OperationsHealthCardProps) {
  const active = OPERATION_HEALTH_LEVELS.find((level) => level.id === operation.health);

  return (
    <section className="operations-health concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Operation Health</h3>
        <p>Human language only — never percentages.</p>
      </header>
      <div className="operations-health__grid">
        {OPERATION_HEALTH_LEVELS.map((level) => (
          <div
            key={level.id}
            className={`operations-health__badge operations-health__badge--${level.id}${
              operation.health === level.id ? " is-active" : ""
            }`}
          >
            <strong>{level.label}</strong>
            <span>{level.hint}</span>
          </div>
        ))}
      </div>
      {active ? <p className="operations-health__current">Current: {active.label}</p> : null}
    </section>
  );
}
