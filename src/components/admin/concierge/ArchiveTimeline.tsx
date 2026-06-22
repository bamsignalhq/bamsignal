import { CONCIERGE_TIMELINE_EVENT_LABELS } from "../../../constants/conciergeConsultant";
import type { ConciergeTimelineEvent } from "../../../types/conciergeConsultant";

const ARCHIVE_TIMELINE_TYPES = new Set([
  "application-received",
  "consultation-completed",
  "introduction",
  "relationship-update",
  "engagement",
  "marriage",
  "archived"
]);

type ArchiveTimelineProps = {
  events: ConciergeTimelineEvent[];
};

export function ArchiveTimeline({ events }: ArchiveTimelineProps) {
  const sorted = [...events]
    .filter((event) => ARCHIVE_TIMELINE_TYPES.has(event.type))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  if (!sorted.length) {
    return <p className="concierge-consultant__empty">No archive timeline events yet.</p>;
  }

  return (
    <ol className="archive-timeline">
      {sorted.map((event, index) => (
        <li
          key={event.id}
          className="archive-timeline__item cc-reveal"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div className="archive-timeline__dot" aria-hidden />
          <div className="archive-timeline__body">
            <p className="archive-timeline__label">
              {CONCIERGE_TIMELINE_EVENT_LABELS[event.type] ?? event.label}
            </p>
            {event.journeyId ? <p className="archive-timeline__journey-id">{event.journeyId}</p> : null}
            {event.detail ? <p className="archive-timeline__detail">{event.detail}</p> : null}
            <time className="archive-timeline__time" dateTime={event.at}>
              {new Date(event.at).toLocaleString()}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
