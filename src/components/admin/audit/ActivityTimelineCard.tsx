import type { AuditEventRecord } from "../../../types/auditCenter";
import { AuditEventCard } from "./AuditEventCard";

type ActivityTimelineCardProps = {
  events: AuditEventRecord[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
};

export function ActivityTimelineCard({ events, selectedEventId, onSelectEvent }: ActivityTimelineCardProps) {
  return (
    <section className="audit-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="audit-timeline-card__head">
        <h3>Activity timeline</h3>
        <p>Append-only event stream — newest first.</p>
      </header>

      {events.length ? (
        <div className="audit-timeline-card__list">
          {events.map((event) => (
            <AuditEventCard
              key={event.id}
              event={event}
              selected={selectedEventId === event.id}
              onSelect={() => onSelectEvent(event.id)}
            />
          ))}
        </div>
      ) : (
        <p className="audit-timeline-card__empty">No events match the current filters.</p>
      )}
    </section>
  );
}
