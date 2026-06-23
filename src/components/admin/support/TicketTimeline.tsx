import type { TicketTimelineEvent } from "../../../types/supportCenter";

type TicketTimelineProps = {
  events: TicketTimelineEvent[];
};

export function TicketTimeline({ events }: TicketTimelineProps) {
  if (!events.length) {
    return (
      <section className="ticket-timeline concierge-consultant-card--glass cc-reveal">
        <h3>Ticket timeline</h3>
        <p className="ticket-timeline__empty">No timeline events yet.</p>
      </section>
    );
  }

  return (
    <section className="ticket-timeline concierge-consultant-card--glass cc-reveal" aria-label="Ticket timeline">
      <h3>Ticket timeline</h3>
      <ol className="ticket-timeline__list">
        {events.map((event) => (
          <li key={event.id} className="ticket-timeline__item">
            <div className="ticket-timeline__marker" aria-hidden="true" />
            <div className="ticket-timeline__body">
              <div className="ticket-timeline__head">
                <strong>{event.label}</strong>
                <time dateTime={event.at}>{new Date(event.at).toLocaleString()}</time>
              </div>
              <p>{event.detail}</p>
              <span className="ticket-timeline__actor">{event.actor}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
