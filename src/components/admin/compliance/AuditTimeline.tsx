import type { AuditEvent } from "../../../types/auditEngine";
import { AuditEventCard } from "./AuditEventCard";

type AuditTimelineProps = {
  events: AuditEvent[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
};

export function AuditTimeline({ events, selectedEventId, onSelectEvent }: AuditTimelineProps) {
  return (
    <section className="institutional-audit-timeline concierge-consultant-card--glass cc-reveal">
      <header className="institutional-audit-timeline__head">
        <h3>Audit timeline</h3>
        <p>Append-only institutional event stream — newest first.</p>
      </header>

      {events.length ? (
        <div className="institutional-audit-timeline__list">
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
        <p className="institutional-audit-timeline__empty">No events match the current filters.</p>
      )}
    </section>
  );
}
