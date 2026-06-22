import type { SignalEventTypeDefinition } from "../../constants/signalEvents";

type EventCategoryCardProps = {
  event: SignalEventTypeDefinition;
};

export function EventCategoryCard({ event }: EventCategoryCardProps) {
  return (
    <article className="se-event-category-card signal-events-glass">
      <h3>{event.label}</h3>
      <p>{event.description}</p>
    </article>
  );
}
