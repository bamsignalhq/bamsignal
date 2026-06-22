import type { SurpriseEventKind } from "../../../constants/surpriseAndDelight";
import {
  getSurpriseEventDefinition,
  surpriseEventLabel
} from "../../../constants/surpriseAndDelight";

type SurpriseEventCardProps = {
  eventId: SurpriseEventKind;
  highlighted?: boolean;
};

export function SurpriseEventCard({ eventId, highlighted = false }: SurpriseEventCardProps) {
  const event = getSurpriseEventDefinition(eventId);
  if (!event) return null;

  return (
    <article
      className={`surprise-event-card${highlighted ? " surprise-event-card--highlighted" : ""}`}
    >
      <header className="surprise-event-card__head">
        <span className="surprise-event-card__badge">{surpriseEventLabel(eventId)}</span>
        <span className="surprise-event-card__status">Reserved</span>
      </header>
      <p className="surprise-event-card__body">{event.description}</p>
    </article>
  );
}
