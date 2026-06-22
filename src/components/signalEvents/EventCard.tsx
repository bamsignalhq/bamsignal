import type { SignalEventViewModel } from "../../utils/signalEventsLogic";

type EventCardProps = {
  event: SignalEventViewModel;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="se-event-card signal-events-glass">
      <div className="se-event-card__head">
        <span className="se-event-card__type">{event.eventTypeLabel}</span>
        <span className="se-event-card__status">Reserved</span>
      </div>
      <h3>{event.title}</h3>
      <p className="se-event-card__city">
        {event.cityName} · {event.regionLabel}
      </p>
      {event.note ? <p className="se-event-card__note">{event.note}</p> : null}
      <time dateTime={event.scheduledAt}>
        {new Date(event.scheduledAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short"
        })}
      </time>
    </article>
  );
}
