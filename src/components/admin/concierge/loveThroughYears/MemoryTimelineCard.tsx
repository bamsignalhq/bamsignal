import {
  CELEBRATING_YOUR_STORY_LABEL,
  JOURNEY_MEMORIES_LABEL
} from "../../../../constants/loveThroughYears";
import type { LoveThroughYearsTimelineRow } from "../../../../utils/loveThroughYearsLogic";

type MemoryTimelineCardProps = {
  timeline: LoveThroughYearsTimelineRow[];
};

export function MemoryTimelineCard({ timeline }: MemoryTimelineCardProps) {
  return (
    <section className="memory-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{JOURNEY_MEMORIES_LABEL}</h3>
        <p>{CELEBRATING_YOUR_STORY_LABEL}</p>
      </header>

      <ol className="memory-timeline-card__list">
        {timeline.map((row) => (
          <li
            key={row.phaseId}
            className={`memory-timeline-card__item${row.reached ? " is-reached" : ""}`}
          >
            <span className="memory-timeline-card__dot" aria-hidden />
            <div>
              <div className="memory-timeline-card__row">
                <strong>{row.label}</strong>
                {row.year ? (
                  <span className="memory-timeline-card__year">{row.year}</span>
                ) : (
                  <span className="memory-timeline-card__pending">Awaiting</span>
                )}
              </div>
              {row.note ? <p className="memory-timeline-card__note">{row.note}</p> : null}
              {row.milestoneAt ? (
                <time dateTime={row.milestoneAt}>
                  {new Date(row.milestoneAt).toLocaleDateString()}
                </time>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
