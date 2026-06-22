import type { ConciergeConsultantActivity } from "../../../types/conciergeConsultantDirectory";

type ConsultantActivityTimelineProps = {
  events: ConciergeConsultantActivity[];
  showActor?: boolean;
};

export function ConsultantActivityTimeline({
  events,
  showActor = true
}: ConsultantActivityTimelineProps) {
  if (!events.length) {
    return <p className="concierge-consultant__empty">No activity recorded yet.</p>;
  }

  return (
    <ol className="consultant-activity-timeline">
      {events.map((event, index) => (
        <li
          key={event.id}
          className="consultant-activity-timeline__item cc-reveal"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div className="consultant-activity-timeline__dot" aria-hidden />
          <div className="consultant-activity-timeline__body">
            <p className="consultant-activity-timeline__label">{event.label}</p>
            {event.memberName ? (
              <p className="consultant-activity-timeline__member">{event.memberName}</p>
            ) : null}
            {event.detail ? (
              <p className="consultant-activity-timeline__detail">{event.detail}</p>
            ) : null}
            {event.changes ? (
              <p className="consultant-activity-timeline__changes">{event.changes}</p>
            ) : null}
            <div className="consultant-activity-timeline__meta">
              {showActor ? (
                <span>
                  {event.actorName} · {event.actorRole === "admin" ? "Admin" : "Consultant"}
                </span>
              ) : null}
              <time dateTime={event.at}>{new Date(event.at).toLocaleString()}</time>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
