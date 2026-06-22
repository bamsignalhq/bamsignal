import { useMemo } from "react";
import {
  CORRIDOR_STATUS_DEFINITIONS,
  DIASPORA_CORRIDOR_FUTURE_CAPABILITIES,
  DIASPORA_CORRIDORS_PURPOSE_COPY,
  DIASPORA_CORRIDORS_RESERVED_COPY,
  DIASPORA_CORRIDORS_SUBCOPY,
  DIASPORA_CORRIDORS_TITLE,
  GLOBAL_CONNECTIONS_LABEL,
  JOURNEY_ACROSS_BORDERS_LABEL,
  SHARED_DREAMS_LABEL
} from "../../../constants/diasporaCorridors";
import { getDiasporaCorridorsBundle } from "../../../utils/DiasporaCorridorsEngine";
import { CorridorBadge } from "./CorridorBadge";
import { CorridorCard } from "./CorridorCard";
import { CorridorSuccessCard } from "./CorridorSuccessCard";
import { CorridorTimeline } from "./CorridorTimeline";

export function DiasporaCorridorsPage() {
  const bundle = useMemo(() => getDiasporaCorridorsBundle(), []);

  return (
    <div className="dc-page">
      <header className="dc-page__hero signal-events-glass">
        <p className="se-hub-page__eyebrow">{JOURNEY_ACROSS_BORDERS_LABEL}</p>
        <h1>{DIASPORA_CORRIDORS_TITLE}</h1>
        <p>{DIASPORA_CORRIDORS_SUBCOPY}</p>
        <p className="dc-page__labels">
          {GLOBAL_CONNECTIONS_LABEL} · {SHARED_DREAMS_LABEL}
        </p>
        <p className="dc-page__purpose">{DIASPORA_CORRIDORS_PURPOSE_COPY}</p>
      </header>

      <section className="dc-page__statuses signal-events-glass">
        <h2>Corridor status</h2>
        <p>Pathway maturity — human-first, never a funnel.</p>
        <ul className="dc-page__status-list">
          {CORRIDOR_STATUS_DEFINITIONS.map((status) => (
            <li key={status.id}>
              <CorridorBadge status={status.id} />
              <span>{status.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dc-page__section">
        <header className="se-section-head">
          <h2>Prepared corridors</h2>
          <p>International relationship pathways — alphabetical, not ranked.</p>
        </header>
        <div className="dc-page__grid">
          {bundle.corridors.map((corridor) => (
            <CorridorCard key={corridor.id} corridor={corridor} />
          ))}
        </div>
      </section>

      {bundle.corridors.map((corridor) => (
        <div key={`${corridor.id}-detail`} className="dc-page__detail">
          <CorridorSuccessCard corridor={corridor} />
          <CorridorTimeline routeLabel={corridor.routeLabel} entries={corridor.timeline} />
        </div>
      ))}

      <section className="dc-page__future-corridors signal-events-glass">
        <h2>Future corridors</h2>
        <p>Reserved pathways — not enabled yet.</p>
        <ul className="dc-page__future-list">
          {bundle.futureCorridors.map((corridor) => (
            <li key={corridor.id}>{corridor.routeLabel}</li>
          ))}
        </ul>
      </section>

      <section className="dc-page__future signal-events-glass">
        <h2>Future ready</h2>
        <ul>
          {DIASPORA_CORRIDOR_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="dc-page__reserved">{DIASPORA_CORRIDORS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
