import { JOURNEY_ACROSS_BORDERS_LABEL } from "../../../constants/globalRelationshipMap";
import type { RelationshipCorridorMapViewModel } from "../../../utils/globalRelationshipMapLogic";

type RelationshipCorridorCardProps = {
  corridor: RelationshipCorridorMapViewModel;
};

export function RelationshipCorridorCard({ corridor }: RelationshipCorridorCardProps) {
  return (
    <article className="grm-corridor-card signal-events-glass">
      <header className="grm-corridor-card__head">
        <h3>{corridor.routeLabel}</h3>
        <span className="grm-corridor-card__badge">{JOURNEY_ACROSS_BORDERS_LABEL}</span>
      </header>

      <p className="grm-corridor-card__labels">
        {corridor.originLabel} → {corridor.destinationLabel}
      </p>

      <dl className="grm-corridor-card__display">
        {corridor.displayRows.map((row) => (
          <div key={row.label} className="grm-corridor-card__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
