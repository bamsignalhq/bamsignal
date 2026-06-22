import { GLOBAL_CONNECTIONS_LABEL, SHARED_DREAMS_LABEL } from "../../../constants/diasporaCorridors";
import type { DiasporaCorridorViewModel } from "../../../utils/diasporaCorridorsLogic";

type CorridorSuccessCardProps = {
  corridor: DiasporaCorridorViewModel;
};

export function CorridorSuccessCard({ corridor }: CorridorSuccessCardProps) {
  return (
    <section className="dc-corridor-success-card signal-events-glass">
      <header className="dc-corridor-success-card__head">
        <h3>{GLOBAL_CONNECTIONS_LABEL}</h3>
        <p>
          {corridor.routeLabel} · {SHARED_DREAMS_LABEL}
        </p>
      </header>

      <div className="dc-corridor-success-card__stats">
        <p>
          <strong>{corridor.successStoriesCount}</strong> success stories preserved with consent
        </p>
        <p>
          <strong>{corridor.legacyFamiliesCount}</strong> legacy families honored — no sensitive data
        </p>
      </div>

      <p className="dc-corridor-success-card__private">
        Stories remain private by default. Architecture prepared — publishing not enabled yet.
      </p>
    </section>
  );
}
