import { BALLROOM_EVENT_LABEL, BAMSIGNAL_HOUSE_FORBIDDEN_COPY } from "../../../constants/ballroom";
import type { EventCardViewModel } from "../../../utils/ballroomLogic";

type EventCardProps = {
  event: EventCardViewModel;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="blrm-event-card institute-glass">
      <header className="blrm-event-card__head">
        <h3>{event.title}</h3>
        <span className="blrm-event-card__badge">{BALLROOM_EVENT_LABEL}</span>
      </header>
      <p className="blrm-event-card__description">{event.description}</p>
      <p className="blrm-event-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="blrm-event-card__status">{event.statusLabel}</p>
    </article>
  );
}
