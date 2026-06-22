import {
  RELATIONSHIP_ANNIVERSARY_ENGINE_TITLE,
  RELATIONSHIP_ANNIVERSARY_FUTURE_CAPABILITIES,
  RELATIONSHIP_ANNIVERSARY_PERMANENCE_COPY,
  RELATIONSHIP_ANNIVERSARY_RESERVED_COPY,
  RELATIONSHIP_ANNIVERSARY_SUBCOPY,
  relationshipAnniversaryYear,
  type RelationshipAnniversaryTimelineEntry
} from "../../../constants/relationshipAnniversary";
import { getRelationshipAnniversaryArchitectureTimeline } from "../../../utils/RelationshipAnniversaryEngine";
import { AnniversaryBadge } from "./AnniversaryBadge";

type AnniversaryTimelineCardProps = {
  entries?: RelationshipAnniversaryTimelineEntry[];
  showArchitecturePreview?: boolean;
};

export function AnniversaryTimelineCard({
  entries,
  showArchitecturePreview = false
}: AnniversaryTimelineCardProps) {
  const timelineEntries =
    entries ?? (showArchitecturePreview ? getRelationshipAnniversaryArchitectureTimeline() : []);

  const sorted = [...timelineEntries].sort(
    (a, b) => new Date(a.milestoneAt).getTime() - new Date(b.milestoneAt).getTime()
  );

  return (
    <section className="relationship-anniversary-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{RELATIONSHIP_ANNIVERSARY_ENGINE_TITLE}</h3>
        <p>{RELATIONSHIP_ANNIVERSARY_SUBCOPY}</p>
      </header>

      <p className="relationship-anniversary-timeline-card__permanence">
        {RELATIONSHIP_ANNIVERSARY_PERMANENCE_COPY}
      </p>

      {sorted.length ? (
        <ol className="relationship-anniversary-timeline-card__list">
          {sorted.map((entry) => {
            const year = relationshipAnniversaryYear(entry.milestoneAt);
            return (
              <li key={entry.id} className="relationship-anniversary-timeline-card__item">
                <div className="relationship-anniversary-timeline-card__row">
                  <AnniversaryBadge milestoneId={entry.milestoneId} label={entry.label} primary />
                  {year ? (
                    <span className="relationship-anniversary-timeline-card__year">{year}</span>
                  ) : null}
                </div>
                {entry.note ? (
                  <p className="relationship-anniversary-timeline-card__note">{entry.note}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="concierge-consultant__empty">No anniversary milestones recorded yet.</p>
      )}

      <div className="relationship-anniversary-timeline-card__future">
        <h4>Future ready</h4>
        <ul>
          {RELATIONSHIP_ANNIVERSARY_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relationship-anniversary-timeline-card__reserved">
        {RELATIONSHIP_ANNIVERSARY_RESERVED_COPY}
      </p>
    </section>
  );
}
