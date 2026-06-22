import { deriveRelationshipPipelinePhases } from "../../../utils/relationshipFollowUpLogic";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";

type RelationshipTimelineProps = {
  record: RelationshipFollowUpRecord;
};

export function RelationshipTimeline({ record }: RelationshipTimelineProps) {
  const phases = deriveRelationshipPipelinePhases(record);

  return (
    <section className="relationship-timeline concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Relationship pipeline</h3>
        <p>Growing Together — timeline preserved forever.</p>
      </header>
      <ol className="relationship-timeline__list">
        {phases.map((phase) => (
          <li
            key={phase.id}
            className={`relationship-timeline__item${phase.reached ? " relationship-timeline__item--reached" : ""}`}
          >
            <span className="relationship-timeline__dot" aria-hidden />
            <p className="relationship-timeline__label">{phase.label}</p>
          </li>
        ))}
      </ol>
      {record.timeline.length ? (
        <ul className="relationship-timeline__history">
          {record.timeline.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.label}</strong>
              {entry.detail ? <span>{entry.detail}</span> : null}
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleDateString()}</time>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
