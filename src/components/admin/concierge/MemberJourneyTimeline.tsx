import type { ConciergeTimelineEvent } from "../../../types/conciergeConsultant";

type MemberJourneyTimelineProps = {
  events: ConciergeTimelineEvent[];
};

export function MemberJourneyTimeline({ events }: MemberJourneyTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  if (!sorted.length) {
    return <p className="concierge-consultant__empty">No journey events yet.</p>;
  }

  return (
    <ol className="concierge-journey-timeline">
      {sorted.map((event, index) => (
        <li
          key={event.id}
          className="concierge-journey-timeline__item cc-reveal"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="concierge-journey-timeline__dot" aria-hidden />
          <div className="concierge-journey-timeline__body">
            <p className="concierge-journey-timeline__label">{event.label}</p>
            {event.journeyId ? (
              <p className="concierge-journey-timeline__journey-id">{event.journeyId}</p>
            ) : null}
            {event.detail ? <p className="concierge-journey-timeline__detail">{event.detail}</p> : null}
            <time className="concierge-journey-timeline__time" dateTime={event.at}>
              {new Date(event.at).toLocaleString()}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
