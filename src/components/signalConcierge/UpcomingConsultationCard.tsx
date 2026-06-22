import { CALENDAR_EVENT_STATUS_LABELS } from "../../constants/calendar";
import type { ConsultationEvent } from "../../types/calendar";

type UpcomingConsultationCardProps = {
  event?: ConsultationEvent | null;
};

export function UpcomingConsultationCard({ event }: UpcomingConsultationCardProps) {
  return (
    <section className="upcoming-consultation-card signal-concierge-glass sc-reveal">
      <header className="upcoming-consultation-card__head">
        <h3>Upcoming consultation</h3>
        <p>Calendar invitations are sent privately to you and your steward.</p>
      </header>
      {event ? (
        <>
          <p className="upcoming-consultation-card__time">
            <time dateTime={event.scheduledAt}>
              {new Date(event.scheduledAt).toLocaleString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </time>
          </p>
          <dl className="upcoming-consultation-card__meta">
            <div>
              <dt>Steward</dt>
              <dd>{event.consultantName}</dd>
            </div>
            <div>
              <dt>Meeting ID</dt>
              <dd>{event.meetingId}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{CALENDAR_EVENT_STATUS_LABELS[event.status]}</dd>
            </div>
          </dl>
          {event.googleEventLink ? (
            <a className="signal-concierge-btn signal-concierge-btn--ghost" href={event.googleEventLink} target="_blank" rel="noreferrer">
              Open calendar event
            </a>
          ) : null}
        </>
      ) : (
        <p className="upcoming-consultation-card__empty">
          No consultation booked yet. Choose an available slot when you are ready.
        </p>
      )}
    </section>
  );
}
