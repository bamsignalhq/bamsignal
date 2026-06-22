import { DIASPORA_CORRIDOR_LABEL, SHARED_DREAMS_LABEL } from "../../../constants/diasporaCorridors";
import type { DiasporaCorridorViewModel } from "../../../utils/diasporaCorridorsLogic";
import { CorridorBadge } from "./CorridorBadge";

type CorridorCardProps = {
  corridor: DiasporaCorridorViewModel;
};

export function CorridorCard({ corridor }: CorridorCardProps) {
  return (
    <article className="dc-corridor-card signal-events-glass">
      <header className="dc-corridor-card__head">
        <h3>{corridor.routeLabel}</h3>
        <CorridorBadge status={corridor.status} primary />
      </header>

      <p className="dc-corridor-card__labels">
        {DIASPORA_CORRIDOR_LABEL} · {SHARED_DREAMS_LABEL}
      </p>

      <dl className="dc-corridor-card__display">
        {corridor.displayRows.map((row) => (
          <div key={row.id} className="dc-corridor-card__row">
            <dt>{row.label}</dt>
            <dd>{row.value ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
