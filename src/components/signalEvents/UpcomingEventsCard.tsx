import type { SignalEventViewModel } from "../../utils/signalEventsLogic";
import { COMMUNITY_LABEL, MEET_NEW_PEOPLE_LABEL } from "../../constants/signalEvents";
import { EventCard } from "./EventCard";

type UpcomingEventsCardProps = {
  events: SignalEventViewModel[];
  title?: string;
};

export function UpcomingEventsCard({
  events,
  title = "Upcoming gatherings"
}: UpcomingEventsCardProps) {
  return (
    <section className="se-upcoming-events-card signal-events-glass">
      <header className="se-upcoming-events-card__head">
        <h2>{title}</h2>
        <p>
          {COMMUNITY_LABEL} · {MEET_NEW_PEOPLE_LABEL}
        </p>
      </header>

      {events.length ? (
        <div className="se-upcoming-events-card__grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="se-upcoming-events-card__empty">
          Gatherings will appear here as your local community grows.
        </p>
      )}
    </section>
  );
}
